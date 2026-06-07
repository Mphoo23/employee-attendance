import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEmployeeContext } from '../../context/useEmployee';

const Profile = () => {
  const router = useRouter();
  const { loggedInEmployee, setLoggedInEmployee, isLoading, getInitials } = useEmployeeContext();
  const [initials, setInitials] = useState('AD');
  const [userRole, setUserRole] = useState('');
  const [logoutModalVisible, setLogoutModalVisible] = useState(false); // Modal State

  const ADMIN_PROFILE = {
    id: 'Ad123',
    phoneno: '09972425310',
    department: 'HR',
    gender: 'Others',
    email: 'hrmyanmar@gicjp.com',
    address: '123 Main St, Yangon, Myanmar',
    name: 'Admin',
    position: 'admin'
  };

  const displayData = userRole === 'admin' ? ADMIN_PROFILE : {
    id: loggedInEmployee?.id || 'N/A',
    phoneno: loggedInEmployee?.phoneno || 'N/A',
    department: loggedInEmployee?.department || 'N/A',
    gender: loggedInEmployee?.gender || 'N/A',
    email: loggedInEmployee?.email || 'N/A',
    address: loggedInEmployee?.address || 'N/A',
    name: loggedInEmployee?.name || 'Admin',
    position: loggedInEmployee?.position || 'admin'
  };

  useEffect(() => {
    const loadUserData = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (role) setUserRole(role);
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const fetchInitials = async () => {
      const storedData = await AsyncStorage.getItem('loggedInEmployee');
      if (storedData) {
        const emp = JSON.parse(storedData);
        setInitials(getInitials(emp.name));
      }
    };
    fetchInitials();
  }, []);

  const logout = async () => {
    await setLoggedInEmployee(null);
    await AsyncStorage.removeItem('loggedInEmployee');
    router.replace('../login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B6EF7" />
      </View>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>

      <Modal visible={logoutModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setLogoutModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalBtnRow}>
              <Pressable style={styles.modalCancelBtn} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalConfirmBtn} onPress={logout}>
                <Text style={styles.modalConfirmText}>Logout</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>


      <View style={styles.header}>
        <View style={{ position: 'absolute', left: 20 }}>
          <View style={styles.initialsCircle}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
        </View>

        <Text style={styles.headerTitle}>My Profile</Text>
        
        {userRole !== 'admin' && (
          <Pressable onPress={() => router.push('../edit_profile')} style={{ position: 'absolute', right: 25 }}> 
            <MaterialCommunityIcons name="pencil-outline" size={20} color="#5B6EF7" />
          </Pressable>
        )}
      </View>

      <View style={styles.profileHeaderFixed}>
        <View style={styles.avatarPlaceholder}>
          {loggedInEmployee?.photoUrl ? (
            <Image source={{ uri: loggedInEmployee.photoUrl }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={35} color="#5B6EF7" />
          )}
        </View>
        <Text style={styles.name}>{displayData.name}</Text>
        <Text style={styles.roleLabel}>{displayData.position}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <View style={styles.detailsContainer}>
            <InfoRow label="Employee ID" value={displayData.id} />
            <InfoRow label="Phone Number" value={displayData.phoneno} />
            <InfoRow label="Department" value={displayData.department} />
            <InfoRow label="Gender" value={displayData.gender} />
            <InfoRow label="Email Address" value={displayData.email} />
            <InfoRow label="Home Address" value={displayData.address} />
          </View>
          
          {userRole !== 'admin' && (
            <Pressable 
              onPress={() => router.push('../change_password')}
              style={({ pressed }) => [styles.actionBtn, { backgroundColor: pressed ? '#E5E7EB' : '#5B6EF7' }]}
            >
              {({ pressed }) => (
                <>
                  <Ionicons name="lock-closed-outline" size={18} color={pressed ? '#5B6EF7' : '#FFFFFF'} />
                  <Text style={[styles.actionText, { color: pressed ? '#5B6EF7' : '#FFFFFF' }]}>Change Password</Text>
                </>
              )}
            </Pressable>
          )}
          
          <Pressable 
            onPress={() => setLogoutModalVisible(true)} 
            style={({ pressed }) => [styles.actionBtn, { backgroundColor: pressed ? '#E5E7EB' : '#5B6EF7' }]}
          >
            {({ pressed }) => (
              <>
                <Ionicons name="log-out-outline" size={18} color={ pressed ? '#5B6EF7' : '#FFFFFF' } />
                <Text style={[styles.actionText, { color: pressed ? '#5B6EF7' : '#FFFFFF' }]}>Logout</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FF' },
  header: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 20, marginTop: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  initialsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8ECFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  initialsText: { fontWeight: 'bold', color: '#5B6EF7', fontSize: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#5B6EF7' },
  profileHeaderFixed: { alignItems: 'center', paddingVertical: 10 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', borderRadius: 40 },
  name: { fontSize: 18, fontWeight: '700', color: '#111827' },
  roleLabel: { fontSize: 14, color: '#4B5563', marginBottom: 10 },
  card: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 },
  detailsContainer: { width: '100%', alignItems: 'flex-start' },
  infoRow: { width: '100%', marginBottom: 20 },
  label: { fontSize: 15, color: '#5B6EF7', fontWeight: '800', letterSpacing: 0.5 },
  value: { fontSize: 13, color: '#374151', marginTop: 4 },
  actionBtn: { width: '100%', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionText: { fontWeight: '700', fontSize: 16, marginLeft: 8 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: 'white', padding: 25, borderRadius: 20, alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 15, marginBottom: 20, color: '#4B5563' },
  modalBtnRow: { flexDirection: 'row', width: '100%', gap: 10 },
  modalCancelBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  modalCancelText: { fontWeight: '600', color: '#6B7280' },
  modalConfirmBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: '#5B6EF7', alignItems: 'center' },
  modalConfirmText: { fontWeight: '600', color: '#FFFFFF' }
});