import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../../context/useEmployee';

const OFFICE_LAT = 16.78006150706561;
const OFFICE_LNG = 96.13946223099434;
const OFFICE_RADIUS = 5000;

const Index = () => {
  const router = useRouter();
  const { 
    employees, markAttendance, hasCheckedInToday, getStatusStyle, 
    attendanceRecords, getInitials, publicHolidays, 
    calculateWorkHours, markCheckOut 
  } = useEmployeeContext();
 const isRestrictedDay = () => {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    const day = today.getDay(); 
    return day === 0 || day === 6 || publicHolidays.includes(dateString);

  };

  const [employeeName, setEmployeeName] = useState('Admin');
  const [employeeId, setEmployeeId] = useState('');
  const [initials, setInitials] = useState('AD');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCheckOutModalVisible, setIsCheckOutModalVisible] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [workHoursDisplay, setWorkHoursDisplay] = useState('');
  const [isInsideOffice, setIsInsideOffice] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInitializing, setIsInitializing] = useState(true);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [hasCheckedOutToday, setHasCheckedOutToday] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsInitializing(true);
      const storedData = await AsyncStorage.getItem('loggedInEmployee');
      const role = await AsyncStorage.getItem('userRole');
      if (role) setUserRole(role);
      
      const today = new Date().toISOString().split('T')[0];
      if (storedData) {
        const emp = JSON.parse(storedData);
        setEmployeeName(emp.name);
        setEmployeeId(emp.id);
        setInitials(getInitials(emp.name));
        
        const record = attendanceRecords.find(r => r.employeeId === emp.id && r.date === today);
        if (record) {
          setIsCheckedIn(true);
          setSelectedStatus(record.status);
          if (record.checkInTime) setCheckInTime(new Date(record.checkInTime));
        }

        const checkoutStatus = await AsyncStorage.getItem(`checkout_${emp.id}_${today}`);
        const savedHours = await AsyncStorage.getItem(`workHours_${emp.id}_${today}`);
        if (checkoutStatus === 'true') {
          setHasCheckedOutToday(true);
          setWorkHoursDisplay(savedHours || '');
        }
      }
      setIsInitializing(false);
    };
    fetchUserData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [attendanceRecords]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return { time: `${displayHours}:${displayMinutes}`, ampm };
  };

  const { time, ampm } = formatTime(currentTime);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  useEffect(() => {
    let watcher: Location.LocationSubscription | null = null;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      watcher = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5 },
        (loc) => {
          const dist = getDistance(loc.coords.latitude, loc.coords.longitude, OFFICE_LAT, OFFICE_LNG);
          setIsInsideOffice(dist <= OFFICE_RADIUS);
        }
      );
    })();
    return () => watcher?.remove();
  }, []);

  const handleCheckOutPress = async () => {
    if (!isCheckedIn || !checkInTime) return Alert.alert("Not Checked In", "You haven't checked in yet.");
    const calculated = calculateWorkHours(checkInTime.toISOString(), new Date().toISOString());
    setWorkHoursDisplay(`${calculated} hours`);
    setIsCheckOutModalVisible(true);
  };

  const confirmCheckOut = async () => {
    const today = new Date().toISOString().split('T')[0];
    const record = attendanceRecords.find(r => r.employeeId === employeeId && r.date === today);
    if (record?.firebaseId) {
      await markCheckOut(record.firebaseId, new Date(), workHoursDisplay);
      await AsyncStorage.setItem(`checkout_${employeeId}_${today}`, 'true');
      await AsyncStorage.setItem(`workHours_${employeeId}_${today}`, workHoursDisplay);
      setHasCheckedOutToday(true);
      setIsCheckOutModalVisible(false);
      Alert.alert("Success", "Checked out successfully!");
    } else {
      Alert.alert("Error", "Could not find attendance record.");
      setIsCheckOutModalVisible(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting || isCheckedIn) return;
    if (!selectedStatus) return Alert.alert("Select Status", "Please choose an attendance status.");
    setIsSubmitting(true);
    try {
      await markAttendance(employeeId, selectedStatus as any);
      setIsCheckedIn(true);
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to mark attendance.");
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <LinearGradient colors={['#F5F7FF', '#E8ECFF']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerContainer}>
          <View style={styles.initialsCircle}><Text style={styles.initialsText}>{initials}</Text></View>
          <View style={styles.titleWrapper}><Text style={styles.headerTitle}>Employee Attendance</Text></View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.greeting}>Hello, {employeeName} 👋</Text>
          <View style={styles.statusCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.statusLabel}>TODAY'S STATUS</Text>
              {isCheckedIn && (
                <View style={[styles.badge, { backgroundColor: getStatusStyle(selectedStatus).backgroundColor, borderColor: getStatusStyle(selectedStatus).borderColor }]}>
                  <Text style={{ color: getStatusStyle(selectedStatus).color, fontSize: 11, fontWeight: '600' }}>{selectedStatus}</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeDisplay}>{time} <Text style={{ fontSize: 20 }}>{ampm}</Text></Text>

            <View style={{flex: 1}}>
              {userRole === 'admin' && (
                (() => {
                  const today = new Date().toISOString().split('T')[0];
                  const todaysRecords = attendanceRecords.filter(r => r.date === today);
                  return (
                    <View style={[styles.adminContainer, { justifyContent: 'space-around', left: -7 }]}>
                      {['Present', 'WFH', 'Leave', 'Idle'].map((s) => (
                        <View key={s} style={{ alignItems: 'center' }}>
                          <Text style={[styles.adminLabel, { color: getStatusStyle(s).color, backgroundColor: getStatusStyle(s).backgroundColor, borderColor: getStatusStyle(s).borderColor }]}>
                            {s}
                          </Text>
                          <Text style={{ fontWeight: 'bold', color: getStatusStyle(s).color }}>
                            {s === 'Idle' ? employees.length - todaysRecords.length : todaysRecords.filter((r) => r.status === s).length}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })()
              )}
            </View>
            
            {userRole !== 'admin' && (
              <View style={styles.actionRow}>
                <Pressable 
                  style={[styles.checkInBtn, (isInitializing || isCheckedIn || isRestrictedDay()) && { backgroundColor: '#A0A0A0' }]} 
                  onPress={() => setIsModalVisible(true)} 
                  disabled={isInitializing || isCheckedIn}
                >
                  <Ionicons name="log-in-outline" size={20} color="white" />
                  <Text style={styles.btnText}>{isInitializing ? 'Loading...' : (isCheckedIn ? 'Checked In' : 'Check In')}</Text>
                </Pressable>
                <Pressable 
                  style={[styles.checkOutBtn, (hasCheckedOutToday ) && { backgroundColor: '#E0E0E0' }]} 
                  onPress={handleCheckOutPress} 
                  disabled={!isCheckedIn || hasCheckedOutToday|| isRestrictedDay()}
                >
                  <Text style={[styles.checkOutBtnText, (hasCheckedOutToday || isRestrictedDay()) && { color: '#999' }]}>Check Out</Text>
                </Pressable>
              </View>
            )}
          </View>
          <Text style={styles.sectionLabel}>Shortcut</Text>
          <Pressable style={styles.shortcutCard} onPress={() => router.push('/employee_list')}>
            <View style={styles.iconBox}><Ionicons name="people" size={22} color="#5B6EF7" /></View>
            <View style={{flex: 1}}><Text style={{fontWeight:'bold'}}>Employee List</Text></View>
            <Ionicons name="chevron-forward" size={20} />
          </Pressable>
        </ScrollView>

        <Modal visible={isModalVisible} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setIsModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Check In Status</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20}}>
                <Ionicons name="location-outline" size={18} color="#5B6EF7" />
                <Text style={{color: '#5B6EF7', marginLeft: 5}}>
                  {isInsideOffice ? 'Inside Office' : 'Outside Office'}
                </Text>
              </View>
              {(isInsideOffice ? ['Present', 'Leave'] : ['WFH', 'Leave']).map(opt => (
                <Pressable key={opt} style={[styles.radioItem, selectedStatus === opt && styles.radioSelected]} onPress={() => setSelectedStatus(opt)}>
                  <View style={styles.radioCircle}>
                    {selectedStatus === opt && <View style={styles.selectedDot} />}
                  </View>
                  <Text style={{fontWeight:'600', marginLeft: 10}}>{opt}</Text>
                </Pressable>
              ))}
              <View style={{flexDirection: 'row', justifyContent: 'space-between', gap: 20}}>
                <Pressable style={[styles.cancelBtn,{flex: 1, padding: 15}]} onPress={() => setIsModalVisible(false)}>
                  <Text style={{textAlign:'center', color: '#5B6EF7', fontWeight: '600'}}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.submitBtn, {flex: 1, opacity: isSubmitting ? 0.5 : 1}]} onPress={handleSubmit} disabled={isSubmitting}>
                  <Text style={{color: 'white', fontWeight:'bold'}}>{isSubmitting ? 'Submitting...' : 'Submit'}</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal visible={isCheckOutModalVisible} transparent animationType="fade">
          <Pressable style={styles.modalOverlay} onPress={() => setIsCheckOutModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <View style={styles.iconContainer}>
                <Ionicons name="log-out-outline" size={30} color="#5B6EF7" />
              </View>
              <Text style={[styles.modalTitle, {textAlign: 'center'}]}>Check Out Status</Text>
              <View style={styles.hoursBox}>
                <Text style={{textAlign: 'center', color: '#666', fontSize: 12}}>ACTUAL WORK HOURS</Text>
                <Text style={{textAlign: 'center', fontSize: 24, fontWeight: 'bold', color: '#5B6EF7'}}>{workHoursDisplay}</Text>
              </View>
              <Text style={{textAlign: 'center', marginBottom: 20, color: '#333'}}>Are you sure you want to check out?</Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', gap: 20}}>
                <Pressable style={[styles.cancelBtn,{flex: 1, padding: 15}]} onPress={() => setIsCheckOutModalVisible(false)}>
                  <Text style={{textAlign:'center', color: '#5B6EF7', fontWeight: '600'}}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.submitBtn, {flex: 1}]} onPress={confirmCheckOut}>
                  <Text style={{color: 'white', fontWeight:'bold'}}>OK</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 4, marginBottom: 5 },
  titleWrapper: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#5B6EF7' },
  initialsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8ECFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  initialsText: { fontWeight: 'bold', color: '#5B6EF7', fontSize: 16 },
  scrollContainer: { padding: 20 },
  greeting: { fontSize: 28, fontWeight: '400', marginBottom: 20 },
  statusCard: { backgroundColor: 'white', borderRadius: 20, padding: 25, borderWidth: 1, borderColor: '#EEE' },
  statusLabel: { fontSize: 12, fontWeight: '600', color: '#666', letterSpacing: 0.5 },
  timeDisplay: { fontSize: 48, fontWeight: '600', marginVertical: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  checkInBtn: { flex: 1, backgroundColor: '#5B6EF7', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 15, borderRadius: 12, gap: 5 },
  checkOutBtn: { flex: 1, backgroundColor: '#F0F0F8', justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  checkOutBtnText: { color: '#5B6EF7', fontWeight: 'bold' },
  btnText: { color: 'white', fontWeight: 'bold' },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginTop: 25, marginBottom: 10 },
  shortcutCard: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#EEE' },
  iconBox: { backgroundColor: '#F0F0F8', padding: 10, borderRadius: 12, marginRight: 15 },
  adminContainer: { flexDirection: 'row', gap: 5 },
  adminLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' , borderWidth: 1 , borderRadius: 8, paddingVertical: 4 ,paddingHorizontal: 8},
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 25 },
  radioItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 10 },
  radioSelected: { borderColor: '#5B6EF7', backgroundColor: '#F5F7FF' },
  hoursBox: { backgroundColor: '#EEF2FF', padding: 20, borderRadius: 10, marginVertical: 15 },
  iconContainer: { alignSelf: 'center', backgroundColor: '#F0F4FF', padding: 15, borderRadius: 30 },
  cancelBtn: { padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#5B6EF7', backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  submitBtn: { backgroundColor: '#5B6EF7', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#5B6EF7', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  selectedDot: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#5B6EF7' },
  badge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 15, borderWidth: 1, alignSelf: 'flex-start' },
});

export default Index;