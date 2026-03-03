import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StatusBar,
  Platform,
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import authService from '../services/authService';

export default function ProfileScreen({ userInfo: initialUserInfo, onLogout }) {
  const [userInfo, setUserInfo] = useState(initialUserInfo);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinizden emin misiniz?', [
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
    ]);
  };

  const displayName = userInfo?.name || userInfo?.preferred_username || 'Kullanıcı';
  const avatarLetter =
    userInfo?.name?.charAt(0)?.toUpperCase() ||
    userInfo?.preferred_username?.charAt(0)?.toUpperCase() ||
    'U';

  const MenuTile = ({ label, icon }) => (
    <TouchableOpacity style={styles.tile} activeOpacity={0.85}>
      <Text style={styles.tileIcon}>{icon}</Text>
      <Text style={styles.tileText}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Platform.OS === 'android' ? '#0066cc' : undefined}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>

            <View style={styles.nameBlock}>
              <Text style={styles.welcomeText}>Hoş Geldin!</Text>
              <Text style={styles.nameText} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <MaterialIcons name="logout" size={21} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="more-vert" size={21} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Popup Menu */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuVisible(false)}>
          <View style={styles.popupMenu}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.popupItem}
              onPress={() => {
                setMenuVisible(false);
                // Şimdilik işlem yok
              }}
            >
              <Text style={styles.popupItemText}>Şifre Değiştir</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* BODY */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.pageTitle}>Anasayfa</Text>

        <View style={styles.grid}>
          <MenuTile label="Araç Özetleri" icon="🚚" />
          <MenuTile label="Gelen Kutusu" icon="💬" />
          <MenuTile label="Depo" icon="🏢" />

          <MenuTile label="Dağıtıma Al" icon="📦" />
          <MenuTile label="Araç Kontrol" icon="✅" />
          <MenuTile label="Depo Toplama" icon="🧾" />

          <MenuTile label="Eve Git" icon="🏠" />
          <MenuTile label="Şirkete Git" icon="🏬" />
          <MenuTile label="İletişim Talebi" icon="✉️" />

          <MenuTile label="SSS" icon="❓" />
          <MenuTile label="Gönderiler" icon="🛒" />
        </View>
      </ScrollView>

      {/* ✅ FOOTER: ScrollView DIŞINDA ve absolute => kesin en altta */}
      <View style={styles.footerContainer}>
        <Text style={styles.footer}>
          © {new Date().getFullYear()}  Temizmama Express 
        </Text>
      </View>
    </View>
  );
}

const FOOTER_H = 44;

const styles = StyleSheet.create({
  screen: {
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
    paddingTop: 54,
  },
  headerRow: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0066cc',
  },
  nameBlock: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  nameText: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSpacer: {
    height: 16,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    marginTop: 18,
  },

  // BODY content: footer kapatmasın diye paddingBottom ekledik
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: FOOTER_H + 14, // ✅ footer yüksekliği kadar boşluk
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    marginLeft: 4,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  tile: {
    width: '31.5%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  tileIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  tileText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '700',
    textAlign: 'center',
  },

  // ✅ Sabit footer (gerçek en alt)
  footerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: FOOTER_H,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  footer: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },

  // Popup
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 48,
    paddingRight: 12,
  },
  popupMenu: {
    width: 180,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  popupItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  popupItemText: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
});