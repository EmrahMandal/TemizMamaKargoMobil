// Keycloak Configuration
// Bu ayarları kendi Keycloak sunucunuza göre güncelleyin

export const keycloakConfig = {
  // Keycloak sunucu URL'i (örnek: https://keycloak.example.com)
  url: 'https://giris.temizmama.com',

  // Realm adı
  realm: 'personel_sso',

  // Client ID
  clientId: '836e8564-52e6-42fb-bc0c-f53a7d667492',

  // Redirect URI - Expo projesi için (app.json'daki scheme ile eşleşmeli)
  // Development için: Expo Go ile çalışmaz, development build gerekir
  // Alternatif: https://auth.expo.io/@your-username/your-app-slug kullanabilirsiniz
  redirectUri: 'keycloakapp://redirect',

  // Scopes
  scopes: ['openid', 'profile', 'email'],
};

// Keycloak endpoint'leri
export const getKeycloakEndpoints = () => {
  const { url, realm } = keycloakConfig;
  const baseUrl = `${url}/realms/${realm}/protocol/openid-connect`;

  return {
    authorization: `${baseUrl}/auth`,
    token: `${baseUrl}/token`,
    userInfo: `${baseUrl}/userinfo`,
    logout: `${baseUrl}/logout`,
  };
};
