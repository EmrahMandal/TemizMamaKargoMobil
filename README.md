# React Native Expo + Keycloak Login Uygulaması

Bu proje, React Native Expo kullanarak Keycloak ile kimlik doğrulama yapan ve kullanıcı bilgilerini gösteren bir mobil uygulamadır.

## Özellikler

- ✅ Keycloak OAuth2/OIDC entegrasyonu
- ✅ PKCE (Proof Key for Code Exchange) güvenliği
- ✅ Kullanıcı bilgilerini görüntüleme
- ✅ Token yönetimi (access token, refresh token)
- ✅ Güvenli logout işlemi
- ✅ AsyncStorage ile token saklama

## Kurulum

### 1. Bağımlılıkları yükleyin

```bash
npm install
```

### 2. Keycloak Yapılandırması

`config/keycloak.config.js` dosyasını kendi Keycloak sunucunuza göre düzenleyin:

```javascript
export const keycloakConfig = {
  url: 'https://your-keycloak-server.com',  // Keycloak sunucu URL'i
  realm: 'your-realm',                       // Realm adı
  clientId: 'your-client-id',                // Client ID
  redirectUri: 'exp://localhost:8081',       // Redirect URI
  scopes: ['openid', 'profile', 'email'],
};
```

### 3. Keycloak Client Ayarları

Keycloak Admin Console'da client ayarlarınızı yapın:

1. **Valid Redirect URIs** ekleyin:
   - Development: `exp://localhost:8081/*`
   - Production: Expo app scheme'inizi kullanın (örn: `myapp://*`)

2. **Access Type**: `public` olarak ayarlayın

3. **Valid Post Logout Redirect URIs**: Redirect URI ile aynı değeri girin

4. **Standard Flow Enabled**: Aktif olmalı

5. **Direct Access Grants Enabled**: İsteğe bağlı

## Çalıştırma

### Development

```bash
# Metro bundler'ı başlat
npm start

# veya
npx expo start
```

Sonra:
- Android için: `a` tuşuna basın veya Android emülatörde Expo Go uygulamasını kullanın
- iOS için: `i` tuşuna basın veya iOS simulator'da Expo Go uygulamasını kullanın
- Web için: `w` tuşuna basın (sınırlı destek)

### Android

```bash
npm run android
```

### iOS (sadece macOS)

```bash
npm run ios
```

### Web

```bash
npm run web
```

## Proje Yapısı

```
reactNativeKeycloak/
├── App.js                      # Ana uygulama component'i
├── config/
│   └── keycloak.config.js      # Keycloak yapılandırması
├── services/
│   └── authService.js          # Authentication servisi
├── screens/
│   ├── LoginScreen.js          # Login ekranı
│   └── ProfileScreen.js        # Kullanıcı profil ekranı
├── package.json
└── README.md
```

## Kullanım

1. Uygulamayı başlattığınızda Login ekranı açılır
2. "Keycloak ile Giriş Yap" butonuna tıklayın
3. Keycloak login sayfasına yönlendirileceksiniz
4. Kullanıcı adı ve şifrenizi girin
5. Başarılı girişten sonra profil ekranında kullanıcı bilgilerinizi göreceksiniz
6. "Çıkış Yap" butonu ile oturumu sonlandırabilirsiniz

## Kullanılan Teknolojiler

- **React Native** - Mobil uygulama framework'ü
- **Expo** - React Native geliştirme platformu
- **expo-auth-session** - OAuth/OIDC authentication
- **expo-crypto** - Kriptografik işlemler (PKCE)
- **expo-web-browser** - Web browser entegrasyonu
- **@react-native-async-storage/async-storage** - Local storage

## Güvenlik

- ✅ PKCE (Proof Key for Code Exchange) kullanır
- ✅ Token'lar güvenli şekilde AsyncStorage'da saklanır
- ✅ Refresh token ile token yenileme
- ✅ Secure logout

## Sorun Giderme

### "Invalid redirect_uri" hatası

Keycloak client ayarlarında **Valid Redirect URIs** değerini kontrol edin. Development için `exp://localhost:8081/*` ekleyin.

### Token alınamadı hatası

1. Keycloak sunucu URL'inin doğru olduğundan emin olun
2. Realm ve Client ID'nin doğru olduğunu kontrol edin
3. Client'ın **public** access type'ına sahip olduğunu doğrulayın

### Uygulama açılmıyor

```bash
# Cache'i temizleyin
npm start -- --clear

# veya node_modules'ü yeniden yükleyin
rm -rf node_modules
npm install
```

## Lisans

MIT

## Notlar

- Bu uygulama development amaçlı bir örnektir
- Production kullanımı için ek güvenlik önlemleri alınmalıdır
- Token'lar için daha güvenli storage çözümleri (Keychain/Keystore) kullanılabilir
- Error handling ve loading durumları geliştirilebilir
