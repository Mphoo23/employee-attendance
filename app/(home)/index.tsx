import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../../context/useEmployee';

const Index = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userRole, setUserRole] = useState('');
  const [employee, setEmployee] = useState<any>(null);
  const { employees, attendanceRecords } = useEmployeeContext();

  useEffect(() => {
    const loadUserData = async () => {
      const role = await AsyncStorage.getItem('userRole');
      const employeeData = await AsyncStorage.getItem('loggedInEmployee');
      if (role) setUserRole(role);
      if (employeeData) setEmployee(JSON.parse(employeeData));
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toLocaleDateString('en-CA');
  const todayRecords = useMemo(() => {
    return attendanceRecords.filter((record) => record.date === today);
  }, [attendanceRecords]);

  const presentCount = todayRecords.filter((record) => record.status === 'Present').length;
  const WFHCount = todayRecords.filter((record) => record.status === 'WFH').length;
  const leaveCount = todayRecords.filter((record) => record.status === 'Leave').length;
  const idleCount = employees.length - todayRecords.length;

  return (
    <LinearGradient colors={['#8A74FF', '#5B6EF7']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* HEADER */}
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <Image 
                  source={require('../../src/gic2.png')} 
                  style={[styles.logo, { tintColor: 'white' }]} 
                />
                <Text style={styles.headerText}>Employee Attendance</Text>
              </View>
              <Text style={styles.roleText}>
                {userRole === 'admin' ? 'Admin Only' : `${employee?.name || 'User'}`}
              </Text>
              
              <View style={styles.dateTimeRow}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={15} color="white" />
                  <Text style={styles.dateText}>{currentTime.toLocaleDateString()}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={15} color="white" />
                  <Text style={styles.dateText}>
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>

            {/* DASHBOARD GRID */}
            <View style={styles.dashboardContainer}>
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Ionicons name="checkmark-done" size={18} color="#4CAF50" />
                  <Text style={styles.cardLabel}>Present</Text>
                </View>
                <Text style={styles.cardNumber}>{presentCount}</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <AntDesign name="home" size={18} color="#FF5A5F" />
                  <Text style={styles.cardLabel}>WFH</Text>
                </View>
                <Text style={styles.cardNumber}>{WFHCount}</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <MaterialIcons name="report-problem" size={18} color="#FFB020" />
                  <Text style={styles.cardLabel}>Leave</Text>
                </View>
                <Text style={styles.cardNumber}>{leaveCount}</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Ionicons name="pause-circle" size={18} color="#5B8CFF" />
                  <Text style={styles.cardLabel}>Idle</Text>
                </View>
                <Text style={styles.cardNumber}>{idleCount}</Text>
              </View>
            </View>

            {/* SHORTCUTS */}
            <Text style={styles.sectionTitle}>Shortcuts</Text>
            <View style={styles.section}>
              {userRole === 'employee' && (
                <Pressable onPress={() => router.push('/mark_attendance')} style={styles.bigCard}>
                  <View style={styles.iconContainer}>
                    <Entypo name="bookmarks" size={18} color="#5B8CFF" />
                  </View>
                  <Text style={styles.cardText}>Mark Attendance</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </Pressable>
              )}
              <Pressable onPress={() => router.push('/employee_list')} style={styles.bigCard}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people-sharp" size={18} color="#5B8CFF" />
                </View>
                <Text style={styles.cardText}>Employee List</Text>
                <Ionicons name="chevron-forward" size={16} color="#999" />
              </Pressable>
              {userRole === 'admin' && (
                <Pressable onPress={() => router.push('/enroll_employee')} style={styles.bigCard}>
                  <View style={styles.iconContainer}>
                    <Entypo name="add-user" size={18} color="#5B8CFF" />
                  </View>
                  <Text style={styles.cardText}>Enroll Employee</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Index;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 28 },
  headerContainer: { marginBottom: 24, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerText: { fontSize: 20, fontWeight: '800', color: 'white' },
  logo: { width: 60, height: 60, resizeMode: 'contain' },
  roleText: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999, color: 'white', fontSize: 13, fontWeight: '700' },
  dateTimeRow: { flexDirection: 'row', gap: 16, marginTop: 14 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { color: 'white', fontSize: 12, fontWeight: '600' },
  dashboardContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 22 },
  card: { width: '48%', backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 18, paddingVertical: 14, marginBottom: 12, alignItems: 'center', elevation: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardLabel: { marginLeft: 6, fontSize: 13, fontWeight: '600', color: '#666' },
  cardNumber: { marginTop: 10, fontSize: 22, fontWeight: '800', color: '#222' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: 'white', marginBottom: 12 },
  section: { gap: 10 },
  bigCard: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16, paddingVertical: 11, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', elevation: 4 },
  iconContainer: { backgroundColor: '#EEF3FF', padding: 8, borderRadius: 999 },
  cardText: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '700', color: '#333' },
});