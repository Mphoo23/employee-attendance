import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Keyboard, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View
} from 'react-native';
import { useEmployeeContext } from '../context/useEmployee';

const EditEmployee = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateEmployee } = useEmployeeContext();

  const getInitialData = () => {
    try {
      if (params.employeeData && typeof params.employeeData === 'string') {
        return JSON.parse(params.employeeData);
      }
    } catch (e) { console.error("Parse Error:", e); }
    return {};
  };

  const employeeData = getInitialData();

  const [loading, setLoading] = useState(false);
  const [emp_name, setEmpName] = useState(employeeData.name || '');
  const [emp_id, setEmpId] = useState(employeeData.id || '');
  const [phone, setPhone] = useState(employeeData.phoneno || '');
  const [position, setPosition] = useState(employeeData.position || '');
  const [gender, setGender] = useState(employeeData.gender || '');
  const [email, setEmail] = useState(employeeData.email || '');
  const [address, setAddress] = useState(employeeData.address || '');
  const [department, setDepartment] = useState(employeeData.department || '');

  useEffect(() => {
    if (employeeData && Object.keys(employeeData).length > 0) {
      setEmpName(employeeData.name || '');
      setEmpId(employeeData.id || '');
      setPhone(employeeData.phoneno || '');
      setPosition(employeeData.position || '');
      setGender(employeeData.gender || '');
      setEmail(employeeData.email || '');
      setAddress(employeeData.address || '');
      setDepartment(employeeData.department || '');
    }
  }, [params.employeeData]);

  const onUpdate = async () => {
    const idToUpdate = employeeData.firebaseId;
    if (!idToUpdate) return;
    
    setLoading(true);
    await updateEmployee(idToUpdate, {
      name: emp_name.trim(),
      department: department.trim(),
      position: position.trim(),
      phoneno: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      gender: gender.trim().toLowerCase(),
    });
    setLoading(false);
    router.back();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#5B6EF7" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Employee</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <InputField label="Employee Name" value={emp_name} onChangeText={setEmpName} icon="person-outline" />
          <InputField label="Employee ID" value={emp_id} onChangeText={setEmpId} icon="pricetag-outline" keyboardType="numeric" />
          <InputField label="Department" value={department} onChangeText={setDepartment} icon="business-outline" />
          <InputField label="Position" value={position} onChangeText={setPosition} icon="briefcase-outline" />
          <InputField label="Phone Number" value={phone} onChangeText={setPhone} icon="call-outline" keyboardType="phone-pad" />
          <InputField label="Email Address" value={email} onChangeText={setEmail} icon="mail-outline" keyboardType="email-address" />
          
          <Text style={styles.label}>Home Address</Text>
          <TextInput value={address} onChangeText={setAddress} placeholder="Enter address" multiline style={styles.textArea} />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} disabled={loading}>
              <Text style={styles.cancelText}>{'Cancel'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={onUpdate} disabled={loading}>
              <Text style={styles.submitText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const InputField = ({ label, value, onChangeText, icon, keyboardType = 'default' }: any) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputContainer}>
      <Ionicons name={icon} size={20} color="#5B6EF7" style={{ marginLeft: 10 }} />
      <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} style={styles.input} />
    </View>
  </View>
);

export default EditEmployee;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FF' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7FF' },
  headerTitle: { color: '#5B6EF7', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  scrollContainer: { padding: 20, paddingBottom: 50 },
  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB' },
  input: { flex: 1, padding: 14, color: '#333' },
  textArea: { backgroundColor: '#FFF', borderRadius: 12, padding: 14, height: 100, borderWidth: 1, borderColor: '#EBEBEB', textAlignVertical: 'top', marginBottom: 15 },
  buttonRow: { flexDirection: 'row', gap: 15, marginTop: 20, marginBottom: 40 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', alignItems: 'center', backgroundColor: '#FFF' },
  cancelText: { fontWeight: '700', color: '#6B7280' },
  submitBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#5B6EF7', alignItems: 'center' },
  submitText: { fontWeight: '700', color: '#fff', fontSize: 16 },
});