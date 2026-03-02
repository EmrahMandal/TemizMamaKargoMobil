import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Image,
  Platform,
} from 'react-native';
import authService from '../services/authService';

export default function LoginScreen({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await authService.login();

      if (result.success) {
        onLoginSuccess(result.userInfo);
      } else {
        Alert.alert('Hata', result.error || 'Giriş yapılamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Üst Banner */}
      <View style={styles.heroWrap}>
        <ImageBackground
          source={require('../assets/888.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />
        </ImageBackground>
      </View>

      {/* Eğik beyaz geçiş */}
      <View style={styles.diagonalWhite} />

      {/* Logo Badge */}
      <View style={styles.badge}>
        <Image
          source={require('../assets/temizexlogo.png')}
          style={styles.badgeLogo}
          resizeMode="contain"
        />
      </View>

      {/* Alt içerik */}
      <View style={styles.content}>
        <Text style={styles.title}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>
         Hesabınıza güvenli bağlantı ile giriş yapın.
        </Text>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.buttonInner}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.loginButtonText}>Bağlanıyor...</Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity> 

        <View style={styles.hintBox}>
          <Text style={styles.hintText}>
            Bu uygulama <Text style={styles.hintStrong}>Keycloak</Text> ile güvenli giriş kullanır.
          </Text>
        </View>

      </View>
    </View>
  );
}

const HERO_HEIGHT = 460;
const BADGE_SIZE = 110;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // HERO
  heroWrap: {
    height: HERO_HEIGHT,
    width: '100%',
    backgroundColor: '#eef2f7',
    overflow: 'hidden',
  },
  heroImage: {
    flex: 1,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },

  // Diagonal white section
  diagonalWhite: {
    position: 'absolute',
    top: HERO_HEIGHT - 40,
    left: -40,
    right: -40,
    height: 140,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '-7deg' }],
  },

  // Logo Badge
  badge: {
    position: 'absolute',
    top: HERO_HEIGHT - BADGE_SIZE / 2 - 30,
    alignSelf: 'center',
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.25,
    shadowRadius: 12,
    elevation: 8,

    borderWidth: 1,
    borderColor: '#f1f5f9',
  },

  badgeLogo: {
    width: BADGE_SIZE * 0.8,
    height: undefined,
    aspectRatio: 1, // yatay logo için ideal (gerekirse 2.5 yapabilirsin)
  },

  // Content
  content: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 22,
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
    maxWidth: 320,
  },

  // Button
  loginButton: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ef4444',
    borderRadius: 7,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: Platform.OS === 'ios' ? 0.20 : 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  loginButtonDisabled: {
    opacity: 0.9,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Hint
  hintBox: {
    marginTop: 14,
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#f8fafc',
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hintText: {
    color: '#64748b',
    fontSize: 11.5,
    lineHeight: 20,
    textAlign: 'center',
  },
  hintStrong: {
    color: '#334155',
    fontWeight: '600',
  },

  footer: {
    marginTop: 2,
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
});