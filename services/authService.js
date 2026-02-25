import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { keycloakConfig, getKeycloakEndpoints } from '../config/keycloak.config';
import { makeRedirectUri } from 'expo-auth-session';

// React Native'in fetch'i whatwg-fetch polyfill'i üzerine kurulu (XHR tabanlı).
// Android'de Chrome Custom Tab kapandıktan hemen sonra bu polyfill'in setTimeout
// wrapper'ı "Network request failed" fırlatıyor.
// XMLHttpRequest'i doğrudan kullanarak bu sorunu atlıyoruz.
function xhrFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url, true);

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }

    xhr.onload = () => {
      const responseHeaders = {};
      xhr.getAllResponseHeaders()
        .trim()
        .split('\r\n')
        .forEach(line => {
          const [key, ...rest] = line.split(': ');
          responseHeaders[key.toLowerCase()] = rest.join(': ');
        });

      resolve({
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        headers: {
          get: (name) => responseHeaders[name.toLowerCase()] || null,
          entries: () => Object.entries(responseHeaders),
        },
        text: () => Promise.resolve(xhr.responseText),
        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
      });
    };

    xhr.onerror = () => reject(new TypeError('Network request failed (XHR)'));
    xhr.ontimeout = () => reject(new TypeError('Network request timed out (XHR)'));
    xhr.timeout = 30000;

    xhr.send(options.body || null);
  });
}

// WebBrowser için gerekli
WebBrowser.maybeCompleteAuthSession();

// Rastgele string oluştur
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const randomBytes = Crypto.getRandomBytes(length);

  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }

  return result;
}

// Code Verifier oluştur (PKCE için)
function generateCodeVerifier() {
  return generateRandomString(128);
}

// Code Challenge oluştur
async function generateCodeChallenge(codeVerifier) {
  // encoding: 'base64' ile doğrudan base64 çıktısı alıp base64url'e dönüştür
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  // base64 -> base64url dönüşümü
  return hash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@access_token',
  REFRESH_TOKEN: '@refresh_token',
  ID_TOKEN: '@id_token',
  USER_INFO: '@user_info',
};

class AuthService {
  constructor() {
    this.endpoints = getKeycloakEndpoints();
    this.discovery = {
      authorizationEndpoint: this.endpoints.authorization,
      tokenEndpoint: this.endpoints.token,
      revocationEndpoint: this.endpoints.logout,
    };
  }

  // Login - Keycloak'a yönlendir
  async login() {
    try {
      const redirectUri = makeRedirectUri({
        path: 'redirect',
      });

      console.log('Generated Redirect URI:', redirectUri);

      // Code verifier ve challenge oluştur
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);

      console.log('Code Verifier:', codeVerifier);
      console.log('Code Challenge:', codeChallenge);

      const authRequestConfig = {
        clientId: keycloakConfig.clientId,
        scopes: keycloakConfig.scopes,
        redirectUri: redirectUri,
        usePKCE: false, // Manuel PKCE kullanıyoruz
        extraParams: {
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
        },
      };

      const authRequest = new AuthSession.AuthRequest(authRequestConfig);

      const authUrl = await authRequest.makeAuthUrlAsync(this.discovery);

      console.log('Auth URL:', authUrl);

      const result = await authRequest.promptAsync(this.discovery, {
        preferEphemeralSession: true,
      });

      console.log('Auth result:', result);

      if (result.type === 'success' && result.params.code) {
        console.log('Success! Code:', result.params.code);

        // WebBrowser kapandıktan sonra Android'de ağ geçişi için bekleme
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Token al (ağ hatasında 3 kez dene)
        let tokens = null;
        let lastError = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            console.log(`[DEBUG] Token exchange attempt ${attempt}/3`);
            tokens = await this.exchangeCodeForToken(
              result.params.code,
              codeVerifier,
              redirectUri
            );
            break; // başarılıysa döngüden çık
          } catch (err) {
            lastError = err;
            console.warn(`[DEBUG] Attempt ${attempt} failed:`, err?.message);
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }

        if (!tokens) {
          throw lastError;
        }

        // Token'ları kaydet
        await this.saveTokens(tokens);

        // Kullanıcı bilgilerini al
        const userInfo = await this.getUserInfo(tokens.access_token);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));

        return { success: true, userInfo };
      } else {
        return { success: false, error: 'Login iptal edildi veya başarısız' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Authorization code'u token ile değiştir
  async exchangeCodeForToken(code, codeVerifier, redirectUri) {
    try {
      console.log('Token endpoint:', this.endpoints.token);
      console.log('Token exchange params:', {
        grant_type: 'authorization_code',
        client_id: keycloakConfig.clientId,
        code: code.substring(0, 20) + '...',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier.substring(0, 20) + '...',
      });

      const bodyParams = [
        `grant_type=authorization_code`,
        `client_id=${encodeURIComponent(keycloakConfig.clientId)}`,
        `code=${encodeURIComponent(code)}`,
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        `code_verifier=${encodeURIComponent(codeVerifier)}`,
      ].join('&');

      console.log('[DEBUG] Full request body:', bodyParams);

      // Pre-flight: verify network is reachable before token exchange
      try {
        const ping = await xhrFetch(this.endpoints.token, { method: 'HEAD' });
        console.log('[DEBUG] Pre-flight HEAD status:', ping.status);
      } catch (pingErr) {
        console.error('[DEBUG] Pre-flight HEAD failed — network unreachable:', pingErr?.message);
        console.error('[DEBUG] Pre-flight error name:', pingErr?.name);
        console.error('[DEBUG] Pre-flight error stack:', pingErr?.stack);
      }

      console.log('[DEBUG] Initiating fetch to token endpoint...');

      let response;
      try {
        response = await xhrFetch(this.endpoints.token, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: bodyParams,
        });
      } catch (fetchError) {
        console.error('[DEBUG] fetch() itself threw an error:');
        console.error('  error.name    :', fetchError?.name);
        console.error('  error.message :', fetchError?.message);
        console.error('  error.stack   :', fetchError?.stack);
        console.error('  typeof error  :', typeof fetchError);
        console.error('  JSON          :', JSON.stringify(fetchError, Object.getOwnPropertyNames(fetchError)));
        console.error('[DEBUG] Target URL was:', this.endpoints.token);
        throw fetchError;
      }

      console.log('Token response status:', response.status);
      console.log('[DEBUG] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange error response body:', errorText);
        throw new Error('Token alınamadı: ' + errorText);
      }

      const tokens = await response.json();
      console.log('Tokens received successfully');
      return tokens;
    } catch (error) {
      console.error('Token exchange network error:', error);
      console.error('  name   :', error?.name);
      console.error('  message:', error?.message);
      console.error('  stack  :', error?.stack);
      throw error;
    }
  }

  // Token'ları kaydet
  async saveTokens(tokens) {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    if (tokens.refresh_token) {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    }
    if (tokens.id_token) {
      await AsyncStorage.setItem(STORAGE_KEYS.ID_TOKEN, tokens.id_token);
    }
  }

  // Kullanıcı bilgilerini al
  async getUserInfo(accessToken) {
    const response = await xhrFetch(this.endpoints.userInfo, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Kullanıcı bilgileri alınamadı');
    }

    return await response.json();
  }

  // Kayıtlı token'ı al
  async getAccessToken() {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Kayıtlı kullanıcı bilgilerini al
  async getCachedUserInfo() {
    const userInfo = await AsyncStorage.getItem(STORAGE_KEYS.USER_INFO);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Token yenile
  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('Refresh token bulunamadı');
      }

      const response = await xhrFetch(this.endpoints.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: keycloakConfig.clientId,
          refresh_token: refreshToken,
        }).toString(),
      });

      if (!response.ok) {
        throw new Error('Token yenilenemedi');
      }

      const tokens = await response.json();
      await this.saveTokens(tokens);

      return tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      const idToken = await AsyncStorage.getItem(STORAGE_KEYS.ID_TOKEN);

      if (idToken) {
        const logoutUrl = `${this.endpoints.logout}?${new URLSearchParams({
          id_token_hint: idToken,
          post_logout_redirect_uri: keycloakConfig.redirectUri,
        }).toString()}`;

        await WebBrowser.openBrowserAsync(logoutUrl);
      }

      // Local storage'ı temizle
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.ID_TOKEN,
        STORAGE_KEYS.USER_INFO,
      ]);

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  // Kullanıcı login durumunu kontrol et
  async isLoggedIn() {
    const accessToken = await this.getAccessToken();
    return !!accessToken;
  }
}

export default new AuthService();
