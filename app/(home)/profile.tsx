import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../../context/useEmployee';

const Profile = () => {
  const router = useRouter();
  // Context ထဲမှ loading state ကိုပါ ထုတ်ယူပါ
  const { loggedInEmployee, setLoggedInEmployee, isLoading } = useEmployeeContext();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const loadRole = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (role) setUserRole(role);
    };
    loadRole();
  }, []);

  const logout = async () => {
    await setLoggedInEmployee(null);
    await AsyncStorage.removeItem('userRole');
    await AsyncStorage.removeItem('loggedInEmployee');
    router.replace('../login');
  };

  // Data ယူနေစဉ်တွင် Loading ပြပေးခြင်း
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#8A74FF', '#5B6EF7']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#ffffff" />
          </Pressable>
          <Text style={styles.header}>My Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.card}>
          {/* Static Avatar Placeholder - Upload functionality ဖယ်ရှားထားပါသည် */}
          <View style={styles.placeholder}>
            <Ionicons name="person" size={40} color="#7664FF" />
          </View>

          {/* User Data from Context */}
          <Text style={styles.name}>{loggedInEmployee?.name || 'User'}</Text>
          
          {/* Dynamic Role Display */}
          <Text style={styles.roleLabel}>
            {userRole === 'admin' ? 'Admin' : 'Employee'}
          </Text>
          
          <Text style={styles.employeeId}>
            ID: {loggedInEmployee?.id || 'N/A'}
          </Text>

          <Pressable onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Profile;

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, padding: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5B6EF7' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: { fontSize: 22, fontWeight: '800', color: '#ffffff' },
  card: { backgroundColor: '#fff', padding: 30, borderRadius: 25, alignItems: 'center' },
  placeholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#EFEFFF', justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 20, fontWeight: '700', marginTop: 15, color: '#1F2937' },
  roleLabel: { fontSize: 14, color: '#7664FF', fontWeight: '600', marginTop: 4 },
  employeeId: { marginTop: 4, fontSize: 14, color: '#6B7280', fontWeight: '500' },
  logoutBtn: { marginTop: 24, backgroundColor: '#7664FF', padding: 14, borderRadius: 15, width: '40%', alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700' },
});