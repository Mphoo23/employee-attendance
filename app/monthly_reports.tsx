import { useEmployeeContext } from '@/context/useEmployee';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MYANMAR_HOLIDAYS_2026 = [
  '2026-01-01', '2026-01-02', '2026-01-04', '2026-02-12', '2026-02-13',
  '2026-02-16', '2026-02-17', '2026-03-02', '2026-03-27', '2026-04-11',
  '2026-04-12', '2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16',
  '2026-04-17', '2026-04-18', '2026-04-19', '2026-04-30', '2026-05-01',
  '2026-05-27', '2026-07-19', '2026-07-29', '2026-10-25', '2026-10-26',
  '2026-10-27', '2026-11-08', '2026-11-23', '2026-11-24', '2026-12-04',
  '2026-12-25',
];

const avatarColors = ['#DBEAFE', '#FCE7F3', '#DCFCE7', '#FEF3C7', '#E9D5FF'];

const MonthlyEmployeeReport = () => {
  const router = useRouter();
  const { employees, attendanceRecords } = useEmployeeContext();
  const [searchText, setSearchText] = useState('');
  const [userRole, setUserRole] = useState('');
  const [loggedInId, setLoggedInId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        const loggedInEmp = await AsyncStorage.getItem('loggedInEmployee');
        if (role) setUserRole(role);
        if (loggedInEmp) setLoggedInId(loggedInEmp);
      } catch (e) {
        console.error("Failed to load user data", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUserData();
  }, []);

  const currentMonth = 4; // May
  const currentYear = 2026;

  const totalWorkingDays = useMemo(() => {
    let workingDaysCount = 0;
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !MYANMAR_HOLIDAYS_2026.includes(dateString)) workingDaysCount++;
    }
    return workingDaysCount;
  }, []);

  const monthlyRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
  }, [attendanceRecords]);

  const employeeReports = useMemo(() => {
    if (isLoading) return [];
    return employees
      .filter((emp) => {
        const matchesSearch = emp.name.toLowerCase().includes(searchText.toLowerCase());
        if (userRole === 'admin') return matchesSearch;
        return searchText.length > 0 ? matchesSearch : String(emp.id) === String(loggedInId);
      })
      .map((employee) => {
        const empRecords = monthlyRecords.filter((r) => String(r.employeeId) === String(employee.id));
        const presentCount = empRecords.filter((r) => r.status === 'Present').length;
        const wfhCount = empRecords.filter((r) => r.status === 'WFH').length;
        const leaveCount = empRecords.filter((r) => r.status === 'Leave').length;
        const idleCount = Math.max(0, totalWorkingDays - (presentCount + wfhCount + leaveCount));
        const attendanceRate = totalWorkingDays > 0 ? Math.round(((presentCount + wfhCount) / totalWorkingDays) * 100) : 0;
        return { ...employee, presentCount, wfhCount, leaveCount, idleCount, attendanceRate };
      });
  }, [employees, monthlyRecords, searchText, totalWorkingDays, userRole, loggedInId, isLoading]);

  if (isLoading) return <SafeAreaView style={[styles.safeArea, { justifyContent: 'center' }]}><ActivityIndicator size="large" color="#fff" /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#fff" /></TouchableOpacity>
            <Text style={styles.header}>Monthly Report</Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.dateInfoContainer}>
            <Text style={styles.monthTitle}>May {currentYear}</Text>
            <View style={{ width: 10 }} />
            <Text style={styles.workingDaysBadge}>● {totalWorkingDays} Working Days</Text>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput placeholder="Search employee..." placeholderTextColor="#9CA3AF" value={searchText} onChangeText={setSearchText} style={styles.input} />
          </View>

          {searchText === '' && userRole !== 'admin' ? (
            <View style={styles.emptyPromptContainer}>
              <Ionicons name="search-circle-outline" size={32} color="#feffff" />
              <Text style={styles.emptyPromptText}>Please search name to see the data</Text>
            </View>
          ) : employeeReports.length === 0 ? (
            <Text style={styles.noDataText}>No report data available.</Text>
          ) : (
            employeeReports.map((employee, index) => (
              <View key={employee.id || index} style={styles.card}>
                <View style={styles.topRow}>
                  <View style={[styles.avatar, { backgroundColor: avatarColors[index % avatarColors.length] }]}><Text style={styles.avatarText}>{employee.name.charAt(0).toUpperCase()}</Text></View>
                  <View style={styles.info}><Text style={styles.name}>{employee.name}</Text><Text style={styles.department}>{employee.department}</Text></View>
                  <View style={styles.rateContainer}><Text style={styles.rateText}>{employee.attendanceRate}%</Text></View>
                </View>
                <View style={styles.statsContainer}>
                  {[ { label: 'Present', value: employee.presentCount, color: '#22C55E' }, { label: 'WFH', value: employee.wfhCount, color: '#3B82F6' }, { label: 'Leave', value: employee.leaveCount, color: '#F59E0B' }, { label: 'Idle', value: employee.idleCount, color: '#EF4444' } ].map((stat, i) => (
                    <View key={i} style={styles.statRow}><Text style={styles.statLabel}>{stat.label}</Text><Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text></View>
                  ))}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#7664FF' },
  container: { flex: 1 },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  dateInfoContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  workingDaysBadge: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  searchBox: { height: 50, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 20, elevation: 3 },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#333' },
  emptyPromptContainer: { marginTop: 80, alignItems: 'center', justifyContent: 'center' },
  emptyPromptText: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 16, fontWeight: '500', marginTop: 15 },
  noDataText: { color: 'white', textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '800', color: '#111827' },
  department: { fontSize: 12, color: '#666' },
  rateContainer: { alignItems: 'flex-end' },
  rateText: { fontSize: 18, fontWeight: '800', color: '#7664FF' },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  statRow: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '800' },
});

export default MonthlyEmployeeReport;