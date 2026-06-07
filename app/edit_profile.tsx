import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../context/useEmployee';
import { db } from '../src/config/firebase';

const EditProfile = () => {
  const router = useRouter();
  const { loggedInEmployee, setLoggedInEmployee } = useEmployeeContext();

  const [name, setName] = useState(loggedInEmployee?.name || '');
  const [phone, setPhone] = useState(loggedInEmployee?.phoneno || '');
  const [address, setAddress] = useState(loggedInEmployee?.address || '');
  const [email, setEmail] = useState(loggedInEmployee?.email || '');
  
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleUpdate = async () => {
    if (!loggedInEmployee?.firebaseId) return;

    if (phone.length < 8 || phone.length > 11) {
      Alert.alert("Invalid Input", "Phone number must be between 8 and 11 digits.");
      return;
    }

    setLoading(true);
    try {
      const employeeRef = doc(db, 'employees', loggedInEmployee.firebaseId);
      await updateDoc(employeeRef, { name, phoneno: phone, address, email });
      
      await setLoggedInEmployee({ ...loggedInEmployee, name, phoneno: phone, address, email } as any);
      
      setModalMessage("Profile updated successfully!");
      setModalVisible(true);
    } catch (error) {
      setModalMessage("Failed to update profile.");
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <Pressable style={styles.modalBtn} onPress={() => {
              setModalVisible(false);
              if (modalMessage.includes("success")) router.back();
            }}>
              <Text style={styles.btnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#5B6EF7" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Employee Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput 
                style={styles.input} 
                value={phone} 
                onChangeText={(text) => {
                  const cleanPhone = text.replace(/[^0-9]/g, '');
                  if (cleanPhone.length <= 11) setPhone(cleanPhone);
                }} 
                keyboardType="phone-pad" 
                maxLength={11} 
              />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={[styles.input, { height: 50 }]} value={email} onChangeText={setEmail} />
            </View>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Home Address</Text>
              <TextInput style={[styles.input, { height: 100 }]} value={address} onChangeText={setAddress} multiline />
            </View>
            <View style={styles.buttonRow}>
              <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
                  <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.updateBtn} onPress={handleUpdate} disabled={loading}>
                  <Text style={styles.btnText}>{loading ? "Updating..." : "Update Profile"}</Text>
              </Pressable>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FF' },
  header: { paddingTop: 10, paddingBottom: 20, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7FF' },
  headerTitle: { color: '#5B6EF7', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  scrollContainer: { padding: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 28, padding: 28, elevation: 8 },
  fieldContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, fontSize: 15 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  cancelBtn: { flex: 1, backgroundColor: '#F4F5FF', borderRadius: 16, padding: 16, alignItems: 'center' },
  updateBtn: { flex: 1, backgroundColor: '#5B6EF7', borderRadius: 16, padding: 16, alignItems: 'center' },
  cancelText: { color: '#5B6EF7', fontWeight: '700' },
  btnText: { color: '#FFF', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#FFF', padding: 25, borderRadius: 20, alignItems: 'center' },
  modalText: { fontSize: 16, marginBottom: 20, color: '#334155', textAlign: 'center' },
  modalBtn: { backgroundColor: '#5B6EF7', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 10 }
});

export default EditProfile;