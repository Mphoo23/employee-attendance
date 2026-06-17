import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../context/useEmployee';
import { db } from '../src/config/firebase';

const Login = () => {
  const router = useRouter();
  const { setLoggedInEmployee } = useEmployeeContext();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;
    try {
      if (!username.trim() || !password.trim()) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }
      setLoading(true);
      if (
  username.trim().toLowerCase() === 'admin' &&
  password.trim() === 'ad123'
) {
  const adminUser = {
    id: 'admin',
    name: 'Admin',
    role: 'admin',
  };

  await AsyncStorage.setItem(
    'loggedInEmployee',
    JSON.stringify(adminUser)
  );

  await setLoggedInEmployee(adminUser as any);
  router.replace('/');

  return;
}

      const snapshot = await getDocs(collection(db, 'employees'));
      const employees = snapshot.docs.map((doc) => ({
        firebaseId: doc.id,
        ...(doc.data() as any),
      }));

      const foundEmployee = employees.find((emp: any) => {
        const nameMatch = emp.name?.toLowerCase().trim() === username.toLowerCase().trim();
        const passwordMatch = emp.password
          ? emp.password === password.trim()
          : emp.id?.toString() === password.trim();
        return nameMatch && passwordMatch;
      });

      if (foundEmployee) {
        // Persist session if "Remember me" is checked
        if (rememberMe) {
          await AsyncStorage.setItem('loggedInEmployee', JSON.stringify(foundEmployee));
        }

        await setLoggedInEmployee(foundEmployee as any);
        router.replace('/');
        return;
      }
      
      Alert.alert('Login Failed', 'Invalid username or password');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerContainer}>
            <Image source={require('../src/gic.png')} style={styles.logo} />
            <Text style={styles.mainTitle}>Employee Attendance</Text>
            <Text style={styles.mainSubtitle}>Sign in to manage your attendance</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" style={styles.prefixIcon} />
                <TextInput value={username} onChangeText={setUsername} style={styles.inputField} autoCapitalize="none" placeholder="Enter your name" placeholderTextColor="#94A3B8" />
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#94A3B8" style={styles.prefixIcon} />
                <TextInput value={password} onChangeText={setPassword} style={styles.inputField} secureTextEntry={!showPassword} placeholder="••••••" placeholderTextColor="#94A3B8" />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#94A3B8" />
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
              <Ionicons name={rememberMe ? "checkbox" : "square-outline"} size={22} color={rememberMe ? "#5B6EF7" : "#94A3B8"} />
              <Text style={styles.checkboxText}> Remember this device</Text>
            </Pressable>

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login →'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FF' },
  keyboardView: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 60, height: 60, marginBottom: 15 },
  mainTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A' },
  mainSubtitle: { fontSize: 14, color: '#64748B', marginTop: 5 },
  card: { backgroundColor: '#FFF', borderRadius: 28, padding: 28, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  fieldContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F5FF', borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  prefixIcon: { marginRight: 10 },
  inputField: { flex: 1, paddingVertical: 16, fontSize: 15, color: '#0F172A' },
  eyeIcon: { padding: 8 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkboxText: { color: '#64748B', fontSize: 14, marginLeft: 8 },
  button: { backgroundColor: '#5B6EF7', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 17, fontWeight: '800' }
});