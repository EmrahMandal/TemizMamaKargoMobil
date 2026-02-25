import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import authService from './services/authService';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const loggedIn = await authService.isLoggedIn();
      if (loggedIn) {
        const cachedUserInfo = await authService.getCachedUserInfo();
        setUserInfo(cachedUserInfo);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Login durumu kontrol edilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setUserInfo(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUserInfo(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      {isLoggedIn ? (
        <ProfileScreen userInfo={userInfo} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
