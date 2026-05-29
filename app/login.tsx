import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../context/useEmployee'; // Context ကို import လုပ်ပါ
import { db } from '../src/config/firebase';

const Login = () => {
  const router = useRouter();
  const { setLoggedInEmployee } = useEmployeeContext(); // Context မှ setLoggedInEmployee ကို ယူပါ
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    try {
      if (!username.trim() || !password.trim()) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
      setLoading(true);

      // Admin Login
      if (username.trim() === 'admin' && password.trim() === '123') {
        await AsyncStorage.setItem('userRole', 'admin');
        router.replace('/');
        return;
      }

      // Employee Login
      const snapshot = await getDocs(collection(db, 'employees'));
      const employees = snapshot.docs.map((doc) => ({
        firebaseId: doc.id,
        ...(doc.data() as any),
      }));

      const foundEmployee = employees.find(
        (emp: any) =>
          emp.name?.toLowerCase().trim() === username.toLowerCase().trim() &&
          emp.id?.toString() === password.trim()
      );

      if (foundEmployee) {
        await AsyncStorage.setItem('userRole', 'employee');
        // Context ကို update လုပ်ပါ (ဒီ function က AsyncStorage ထဲကိုပါ သိမ်းပေးမှာပါ)
        await setLoggedInEmployee(foundEmployee);
        router.replace('/');
        return;
      }

      Alert.alert('Login Failed', 'Invalid username or password');
    } catch (error) {
      console.log('LOGIN ERROR:', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* သင်၏ မူလ UI code အတိုင်းပဲ ထားပါ */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image source={require('../src/gic.png')} style={styles.logo} />
              <Text style={styles.titleColor}>Employee Attendance</Text>
            </View>

            <LinearGradient colors={['#7F5AF0', '#5B8CFF']} style={styles.cardGradient}>
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput value={username} onChangeText={setUsername} style={styles.input} autoCapitalize="none" placeholder="Enter your name" placeholderTextColor="#aaa" />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput value={password} onChangeText={setPassword} style={styles.input} keyboardType="numeric" secureTextEntry placeholder="Enter your password" placeholderTextColor="#aaa" />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  container: { width: '95%', maxWidth: 400, alignSelf: 'center' },
  logoContainer: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
  logo: { width: 60, height: 60, resizeMode: 'contain', marginBottom: 10 },
  titleColor: { fontSize: 26, fontWeight: '800', color: '#0534bf', textAlign: 'center' },
  cardGradient: {
    borderRadius: 30,
    padding: 30,
    shadowColor: '#5B8CFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  fieldContainer: { marginBottom: 20 },
  label: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#ffffff', 
    marginBottom: 7, 
    marginLeft: 4 
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 13,
    color: '#333',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 16,
    alignSelf: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: { 
    color: '#5B8CFF', 
    fontSize: 16, 
    fontWeight: '800',
    textAlign: 'center' 
  },
});