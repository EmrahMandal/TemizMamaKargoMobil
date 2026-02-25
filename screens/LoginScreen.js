import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
      <View style={styles.content}>
        <Text style={styles.title}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>
          Devam etmek için Keycloak ile giriş yapın
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
        ) : (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Keycloak ile Giriş Yap</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.infoText}>
          Güvenli kimlik doğrulama için Keycloak kullanıyoruz
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 20,
  },
  infoText: {
    marginTop: 30,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
