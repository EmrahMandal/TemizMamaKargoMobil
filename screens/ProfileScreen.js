import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import authService from '../services/authService';

export default function ProfileScreen({ userInfo: initialUserInfo, onLogout }) {
  const [userInfo, setUserInfo] = useState(initialUserInfo);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!initialUserInfo) {
      loadUserInfo();
    }
  }, []);

  const loadUserInfo = async () => {
    setLoading(true);
    try {
      const cachedUserInfo = await authService.getCachedUserInfo();
      if (cachedUserInfo) {
        setUserInfo(cachedUserInfo);
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const result = await authService.logout();
            setLoading(false);
            if (result.success) {
              onLogout();
            } else {
              Alert.alert('Hata', 'Çıkış yapılamadı');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {userInfo?.name?.charAt(0)?.toUpperCase() ||
             userInfo?.preferred_username?.charAt(0)?.toUpperCase() ||
             'U'}
          </Text>
        </View>
        <Text style={styles.welcomeText}>Hoş Geldin!</Text>
        <Text style={styles.nameText}>
          {userInfo?.name || userInfo?.preferred_username || 'Kullanıcı'}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Kullanıcı Bilgileri</Text>

        {userInfo?.email && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>E-posta:</Text>
            <Text style={styles.infoValue}>{userInfo.email}</Text>
          </View>
        )}

        {userInfo?.preferred_username && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kullanıcı Adı:</Text>
            <Text style={styles.infoValue}>{userInfo.preferred_username}</Text>
          </View>
        )}

        {userInfo?.given_name && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Ad:</Text>
            <Text style={styles.infoValue}>{userInfo.given_name}</Text>
          </View>
        )}

        {userInfo?.family_name && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Soyad:</Text>
            <Text style={styles.infoValue}>{userInfo.family_name}</Text>
          </View>
        )}

        {userInfo?.email_verified !== undefined && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>E-posta Doğrulandı:</Text>
            <Text style={styles.infoValue}>
              {userInfo.email_verified ? '✓ Evet' : '✗ Hayır'}
            </Text>
          </View>
        )}

        {userInfo?.sub && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Kullanıcı ID:</Text>
            <Text style={[styles.infoValue, styles.smallText]}>
              {userInfo.sub}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.debugSection}>
        <Text style={styles.sectionTitle}>Tüm Bilgiler (Debug)</Text>
        <View style={styles.debugBox}>
          <Text style={styles.debugText}>
            {JSON.stringify(userInfo, null, 2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  smallText: {
    fontSize: 12,
  },
  debugSection: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  debugBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    maxHeight: 300,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
