import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { db } from '../src/config/firebase';

const EnrollEmployee = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [emp_name, setEmpName] = useState('');
  const [emp_id, setEmpId] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  
  const [alertModal, setAlertModal] = useState({ visible: false, title: '', message: '', isSuccess: false });

  const onSubmit = async () => {
    if (loading) return;
    try {
      if (!emp_name.trim() || !emp_id.trim()) {
        return setAlertModal({ visible: true, title: 'Error', message: 'Please fill in required fields', isSuccess: false });
      }

      setLoading(true);

      const q = query(collection(db, 'employees'), where('id', '==', emp_id.trim()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setAlertModal({ visible: true, title: 'Error', message: 'Employee ID already exists', isSuccess: false });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'employees'), {
        id: emp_id.trim(),
        name: emp_name.trim(),
        department: department.trim(),
        position: position.trim(),
        phoneno: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        gender: gender.trim().toLowerCase(),
        AttendanceStatus: null,
      });

      setAlertModal({ visible: true, title: 'Success', message: 'Employee Added Successfully', isSuccess: true });
    } catch (error) {
      console.log(error);
      setAlertModal({ visible: true, title: 'Error', message: 'Failed to add employee', isSuccess: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.safeArea}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#5B6EF7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Enroll Employee</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Employee Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#5B6EF7" style={styles.icon} />
              <TextInput value={emp_name} onChangeText={setEmpName} placeholder="Enter full name" placeholderTextColor="#aaa" style={styles.input} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Employee ID</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="pricetag-outline" size={20} color="#5B6EF7" style={styles.icon} />
              <TextInput value={emp_id} onChangeText={setEmpId} placeholder="e.g., 101" placeholderTextColor="#aaa" keyboardType="numeric" style={styles.input} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => setModalVisible(true)}>
              <Ionicons name="people-outline" size={20} color="#5B6EF7" style={styles.icon} />
              <Text style={{ flex: 1, padding: 14, color: gender ? '#333' : '#999' }}>
                {gender || 'Select Gender'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#5B6EF7" style={{ paddingRight: 12 }} />
            </TouchableOpacity>
          </View>

          <Modal visible={modalVisible} transparent animationType="fade">
            <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)} activeOpacity={1}>
              <View style={styles.modalContent}>
                <Text style={{ fontWeight: 'bold', marginBottom: 15, fontSize: 16 }}>Select Gender</Text>
                <FlatList 
                  data={[{ label: 'Male', icon: 'male-outline' }, { label: 'Female', icon: 'female-outline' }, { label: 'Other', icon: 'male-female-outline' }]}
                  keyExtractor={(item) => item.label}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalOption} onPress={() => { setGender(item.label); setModalVisible(false); }}>
                      <Ionicons name={item.icon as any} size={20} color="#5B6EF7" style={{ marginRight: 10 }} />
                      <Text style={{ fontSize: 16 }}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableOpacity>
          </Modal>

       
          <Modal visible={alertModal.visible} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{alertModal.title}</Text>
                <Text style={styles.modalMessage}>{alertModal.message}</Text>
                
                <TouchableOpacity 
                  style={styles.modalConfirmBtn} 
                  onPress={() => {
                    setAlertModal({ ...alertModal, visible: false });
                    if (alertModal.isSuccess) router.back();
                  }}
                >
                  <Text style={styles.modalConfirmText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Department</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="business-outline" size={20} color="#5B6EF7" style={styles.icon} />
              <TextInput value={department} onChangeText={setDepartment} placeholder="e.g., Engineering" placeholderTextColor="#aaa" style={styles.input} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Position</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="briefcase-outline" size={20} color="#5B6EF7" style={styles.icon} />
              <TextInput value={position} onChangeText={setPosition} placeholder="e.g., Manager" placeholderTextColor="#aaa" style={styles.input} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#5B6EF7" style={styles.icon} />
              <TextInput value={phone} onChangeText={setPhone} placeholder="Enter phone number" placeholderTextColor="#aaa" keyboardType="phone-pad" style={styles.input} />
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#5B6EF7" style={styles.icon} />
              <TextInput value={email} onChangeText={setEmail} placeholder="example@email.com" placeholderTextColor="#aaa" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
            </View>
          </View>

          <Text style={styles.label}>Home Address</Text>
          <TextInput value={address} onChangeText={setAddress} placeholder="Enter residential address" placeholderTextColor="#aaa" multiline style={styles.textArea} />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={onSubmit} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Saving...' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default EnrollEmployee;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, marginTop: 40, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#5B6EF7' },
  scrollContainer: { padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', borderRadius: 15, padding: 20 },
  modalOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 15, color: '#666', marginBottom: 25, textAlign: 'center', lineHeight: 22 },
  modalConfirmBtn: { 
    backgroundColor: '#5B6EF7', 
    paddingVertical: 14,        
    borderRadius: 12,           
    alignItems: 'center',       
    marginTop: 10
  },
  modalConfirmText: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#fff'              
  },
  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB' },
  icon: { paddingLeft: 12 },
  input: { flex: 1, padding: 14, color: '#333' },
  textArea: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, height: 100, borderWidth: 1, borderColor: '#EBEBEB', textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', gap: 15, marginTop: 20, marginBottom: 40 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  cancelText: { fontWeight: '700', color: '#6B7280' },
  submitBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#5B6EF7', alignItems: 'center' },
  submitText: { fontWeight: '700', color: '#fff' },
});