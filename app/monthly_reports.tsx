import { useEmployeeContext } from '@/context/useEmployee';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MonthlyEmployeeReport = () => {
  const router = useRouter();
  const { employees, attendanceRecords, getStatusStyle, publicHolidays, loggedInEmployee } = useEmployeeContext();
  
  const [searchText, setSearchText] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const BUSINESS_START_MONTH = 3;

  useEffect(() => { setIsLoading(false); }, []);

  const businessYearMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    let startYear = currentMonth < BUSINESS_START_MONTH ? currentYear - 1 : currentYear;
    
    for (let i = 0; i < 12; i++) {
      const d = new Date(startYear, BUSINESS_START_MONTH + i, 1);
      months.push(d);
    }
    return months;
  }, []);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const displayTitle = selectedDate.toLocaleString('default', { month: 'long'}) + ', ' + selectedDate.toLocaleString('default', { year: 'numeric' });

  const totalWorkingDays = useMemo(() => {
    let workingDaysCount = 0;
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !publicHolidays.includes(dateString)) workingDaysCount++;
    }
    return workingDaysCount;
  }, [currentMonth, currentYear, publicHolidays]);

  const monthlyRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
  }, [attendanceRecords, currentMonth, currentYear]);

  const employeeReports = useMemo(() => {
    if (isLoading) return [];
    return employees
      .filter((emp) => emp.name.toLowerCase().includes(searchText.toLowerCase()) || emp.department.toLowerCase().includes(searchText.toLowerCase()))
      .map((employee) => {
        const empRecords = monthlyRecords.filter((r) => String(r.employeeId) === String(employee.id));
        const presentCount = empRecords.filter((r) => r.status === 'Present').length;
        const wfhCount = empRecords.filter((r) => r.status === 'WFH').length;
        const leaveCount = empRecords.filter((r) => r.status === 'Leave').length;
        const idleCount = Math.max(0, totalWorkingDays - (presentCount + wfhCount + leaveCount));
        const attendanceRate = totalWorkingDays > 0 ? Math.round(((presentCount + wfhCount) / totalWorkingDays) * 100) : 0;
        return { ...employee, presentCount, wfhCount, leaveCount, idleCount, attendanceRate };
      });
  }, [employees, monthlyRecords, searchText, totalWorkingDays, isLoading]);

  const generateExcel = async () => {
    const header = "Name,Department,Present,WFH,Leave,Idle,Attendance Rate (%)\n";
    const rows = employeeReports.map(emp => 
      `${emp.name},${emp.department},${emp.presentCount},${emp.wfhCount},${emp.leaveCount},${emp.idleCount},${emp.attendanceRate}`
    ).join("\n");
    const csvContent = header + rows;
    const fileName = `Attendance_${displayTitle.replace(', ', '_')}.csv`;
    const fileUri = FileSystem.documentDirectory + fileName;
    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri);
    } catch (error) { console.error("Error generating CSV:", error); }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#333" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Attendance</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.inputCard}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput placeholder="Search by name or department..." style={styles.input} value={searchText} onChangeText={setSearchText} />
        </View>
        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowMonthModal(true)}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.dateText}>{displayTitle}</Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      
        {loggedInEmployee?.role === 'admin' && (
          <TouchableOpacity style={styles.genBtn} onPress={generateExcel}>
            <MaterialIcons name="bar-chart" size={18} color="white" />
            <Text style={styles.genBtnText}>Generate report</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.statsHeader}>
        <View>
          <Text style={styles.summaryTitle}>Employee Summaries</Text>
          <Text style={styles.subSummaryText}>Total Working Days: <Text style={{ fontWeight: 'bold' }}>{totalWorkingDays}</Text></Text>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Text style={[styles.totalText, { right : 15 }]}>Total : {employeeReports.length}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {employeeReports.length > 0 ? (
          employeeReports.map((emp) => (
            <View key={emp.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.avatar]}><Text style={styles.avatarText}>{emp.name.charAt(0)}</Text></View>
                <View style={{flex: 1, marginLeft: 10}}><Text style={styles.name}>{emp.name}</Text><Text style={styles.dept}>{emp.department}</Text></View>
                <Text style={styles.rate}>{emp.attendanceRate}%{"\n"}<Text style={{fontSize: 10, color: '#999'}}>Attendance</Text></Text>
              </View>
              <View style={styles.bottomStats}>
                {[
                  { l: 'Present', v: emp.presentCount }, 
                  { l: 'WFH', v: emp.wfhCount }, 
                  { l: 'Leave', v: emp.leaveCount }, 
                  { l: 'Idle', v: emp.idleCount }
                ].map(s => {
                  const style = getStatusStyle(s.l);
                  return (
                    <View key={s.l} style={{alignItems:'center'}}>
                      <View style={[styles.statBadge, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
                        <Text style={[styles.statLabel, { color: style.color, fontWeight: 'bold' }]}>{s.l}</Text>
                      </View>
                      <Text style={styles.statVal}>{s.v}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No attendance records</Text>
            <Text style={styles.emptySubtitle}>There are no attendance records for the selected date range.</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showMonthModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Select Business Month</Text>
            <ScrollView>
              {businessYearMonths.map((date, i) => (
                <TouchableOpacity key={i} style={styles.monthItem} onPress={() => { setSelectedDate(date); setShowMonthModal(false); }}>
                  <Text>{date.toLocaleString('default', { month: 'long'}) + ', ' + date.toLocaleString('default', { year: 'numeric' })}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowMonthModal(false)} style={styles.cancelBtn}><Text style={{color: 'red'}}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FF' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#5B6EF7', flex: 1, textAlign: 'center' },
  scrollContainer: { paddingBottom: 40 },
  inputCard: { backgroundColor: 'white', padding: 10, margin: 15, borderRadius: 16, borderWidth: 1, borderColor: '#EBEBEB' },
  searchBox: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 15, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  input: { flex: 1, marginLeft: 10, paddingVertical: 8 },
  dateSelector: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'white', marginVertical: 10, marginHorizontal: 15, paddingVertical: 13, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  dateText: { fontWeight: '600' },
  genBtn: { backgroundColor: '#5B6EF7', margin: 15, flexDirection: 'row', justifyContent: 'center', padding: 15, borderRadius: 12 },
  genBtnText: { color: 'white', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  statsHeader: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15, marginBottom: 15 },
  subSummaryText: { fontSize: 12, color: '#666', marginTop: 2 },
  summaryTitle: { fontWeight: 'bold', fontSize: 16 },
  totalText: { fontWeight: 'bold', color: '#5B6EF7' },
  card: { backgroundColor: 'white', marginHorizontal: 15, padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EEE' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F0F0FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#5B6EF7', fontWeight: 'bold' },
  name: { fontWeight: 'bold' },
  dept: { fontSize: 12, color: '#666' },
  rate: { textAlign: 'right', fontWeight: 'bold', color: '#5B6EF7', fontSize: 16 },
  bottomStats: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  statLabel: { fontSize: 9 },
  statBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, marginBottom: 6, alignItems: 'center' },
  statVal: { fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 50, padding: 20 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#374151', marginTop: 15 },
  emptySubtitle: { color: '#666', textAlign: 'center', marginTop: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 20, padding: 20, maxHeight: '70%' },
  modalHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  monthItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  cancelBtn: { marginTop: 20, alignItems: 'center', padding: 10 }
});

export default MonthlyEmployeeReport;