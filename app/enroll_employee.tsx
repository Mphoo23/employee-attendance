import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import { db } from '../src/config/firebase';

const EnrollEmployee = () => {
  const router = useRouter();

  const [emp_name, setEmpName] = useState('');
  const [emp_id, setEmpId] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (loading) return;

    try {
      if (!emp_name.trim()) {
        Alert.alert('Error', 'Enter employee name');
        return;
      }

      if (!emp_id.trim()) {
        Alert.alert('Error', 'Enter employee ID');
        return;
      }

      if (isNaN(Number(emp_id))) {
        Alert.alert('Error', 'Employee ID must be number only');
        return;
      }

      if (!department.trim()) {
        Alert.alert('Error', 'Enter department');
        return;
      }

      if (!position.trim()) {
        Alert.alert('Error', 'Enter position');
        return;
      }

      setLoading(true);

      const q = query(
        collection(db, 'employees'),
        where('id', '==', emp_id.trim())
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        Alert.alert('Error', 'Employee ID already exists');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'employees'), {
        id: emp_id.trim(),
        name: emp_name.trim(),
        department: department.trim(),
        position: position.trim(),
        AttendanceStatus: null,
      });

      Alert.alert('Success', 'Employee Added Successfully');

      setEmpName('');
      setEmpId('');
      setDepartment('');
      setPosition('');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const onReset = () => {
    setEmpName('');
    setEmpId('');
    setDepartment('');
    setPosition('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* BACK BUTTON (FIXED) */}
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>

        {/* HEADER */}
        <Text style={styles.headerText}>Enroll Employee</Text>
        <Text style={styles.subText}>Fill employee information</Text>

        {/* FORM */}
        <View style={styles.formContainer}>
          <Text style={styles.text}>Employee name</Text>
          <TextInput
            value={emp_name}
            onChangeText={setEmpName}
            style={styles.input}
          />
          <Text style={styles.text}>Employee ID</Text>
          <TextInput
            value={emp_id}
            onChangeText={setEmpId}
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={styles.text}>Department</Text>
          <TextInput
            value={department}
            onChangeText={setDepartment}
            style={styles.input}
          />
          <Text style={styles.text}>Position</Text>
          <TextInput
            value={position}
            onChangeText={setPosition}
            style={styles.input}
          />
          
          <View style={styles.button}>
          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? 'Saving...' : 'Register'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        </View>
        

      </View>
    </SafeAreaView>
  );
};

export default EnrollEmployee;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7F5AF0',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    position: 'relative', // ✅ IMPORTANT FIX
  },

  /* ✅ FIXED BACK BUTTON */
  backIcon: {
    position: 'absolute',
    top: 20,
    left: 15,

    width: 46,
    height: 46,
    borderRadius: 23,

    backgroundColor: 'rgba(255,255,255,0.25)',

    justifyContent: 'center',
    alignItems: 'center',

    zIndex: 999,     // ✅ FIX TOUCH ISSUE
    elevation: 10,   // ✅ ANDROID FIX
  },

  headerText: {
    fontSize: 30,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginTop: 10,
  },

  subText: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
    opacity: 0.9,
  },

  formContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 22,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },

  input: {
    backgroundColor: '#F5F7FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E9FF',
  },
  text:{
    fontSize: 15,
    paddingVertical: 4,
  },

 button: {
  flexDirection: 'row',
  gap: 20,
  marginTop: 10,
 },

  submitButton: {
  flex: 1,
  backgroundColor: '#5B8CFF',
  paddingVertical: 15,
  borderRadius: 18,
  alignItems: 'center',
},

  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  resetButton: {
  flex: 1,
  backgroundColor: '#FF4D6D',
  paddingVertical: 15,
  borderRadius: 18,
  alignItems: 'center',
},
  resetText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});