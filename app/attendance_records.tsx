import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import * as XLSX from 'xlsx';
import { useEmployeeContext } from '../context/useEmployee';

const AttendanceRecords = () => {
  const router = useRouter();
  const { attendanceRecords, lateTime, getStatusStyle, employees, loggedInEmployee } = useEmployeeContext();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [reportResult, setReportResult] = useState<{ visible: boolean; success: boolean }>({ visible: false, success: false });
  const today = new Date().toISOString().split('T')[0];

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  

  const normalizeDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return dateStr.slice(0, 10);
  };

  const filteredRecords = useMemo(() => {
    return (attendanceRecords || []).filter((record) => {
      const normalizedRecordDate = normalizeDate(record.date);
      return normalizedRecordDate >= startDate && normalizedRecordDate <= endDate;
    });
  }, [attendanceRecords, startDate, endDate]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredRecords.forEach((r) => {
      const dateKey = normalizeDate(r.date);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(r);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredRecords]);

  const handleGenerateReport = async () => {
    if (filteredRecords.length === 0) {
      setReportResult({ visible: true, success: false });
      return;
    }

    const formatToAmPm = (isoString: string) => {
      if (!isoString) return "-";
      const date = new Date(isoString);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; 
      return `${hours}:${minutes} ${ampm}`;
    };

    try {
      const excelData = filteredRecords.map((r, i) => {
        const calculatedLate = lateTime(r);
        const currentEmp = employees.find(e => e.id === r.employeeId);
        return {
          No: i + 1,
          Name: r.name,
          Department: currentEmp ? currentEmp.department : r.department,
          Status: r.status,
          Date: r.date,
          CheckedInTime: formatToAmPm(r.checkInTime),
          CheckedOutTime: r.checkOutTime ? formatToAmPm(r.checkOutTime) : "-",
          Late: (r.status === 'Leave') ? " - " : (calculatedLate || " - "),
          WorkedHour: (r.status === 'Leave') ? " - " : r.workedHours,
        };
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance");
      
      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const uri = `${FileSystem.documentDirectory}Attendance_${startDate}_to_${endDate}.xlsx`;
      
      await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(uri);
      setReportResult({ visible: false, success: true });
    } catch (e) {
      console.error(e);
      setReportResult({ visible: true, success: false });
    }
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="chevron-back" size={24} color="#5B6EF7" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputCard}>
          <Text style={styles.label}>Select date range</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <TouchableOpacity style={styles.dateBox} onPress={() => setShowStartModal(true)}><Text style={styles.dateText}>{startDate}</Text></TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.dateLabel}>End Date</Text>
              <TouchableOpacity style={styles.dateBox} onPress={() => setShowEndModal(true)}><Text style={styles.dateText}>{endDate}</Text></TouchableOpacity>
            </View>
          </View>
          
          { loggedInEmployee?.role === 'admin' && (
            <TouchableOpacity style={styles.genBtn} onPress={handleGenerateReport}>
              <MaterialIcons name="bar-chart" size={18} color="white" />
              <Text style={styles.genBtnText}> Generate Report</Text>
            </TouchableOpacity>
          )}
        </View>

        {groupedRecords.map(([date, records]) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {records.map((r, i) => {
              const statusStyle = getStatusStyle(r.status);
              const currentEmp = employees.find(e => e.id === r.employeeId);
              const displayDept = currentEmp ? currentEmp.department : r.department;
              
              return (
                <View key={i} style={styles.card}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(r.name)}</Text></View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.name}>{r.name}</Text>
                    <Text style={styles.dept}>{displayDept}</Text>
                    <Text style={styles.dept}>{r.workedHours}</Text>
                  </View>
                  <View style={[styles.statusTag, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                    <Text style={[styles.statusTagText, { color: statusStyle.color }]}>{r.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <Modal visible={reportResult.visible && !reportResult.success} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setReportResult({...reportResult, visible: false})}>
          <View style={styles.resultModalBox}>
            <Feather name="alert-circle" size={24} color="#FF4D6D" />
            <Text style={styles.modalTitle}>Generation Failed</Text>
            <Text style={{textAlign: 'center', color: '#666', marginTop: 5}}>Unable to generate the report</Text>
            <TouchableOpacity style={styles.okBtn} onPress={() => setReportResult({...reportResult, visible: false})}><Text style={{color: 'white', fontWeight: 'bold'}}>OK</Text></TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={showStartModal} transparent><Pressable style={styles.modalBg} onPress={() => setShowStartModal(false)}><View style={styles.modalBox}><Calendar onDayPress={(d) => { setStartDate(d.dateString); setShowStartModal(false); }} maxDate={endDate} /></View></Pressable></Modal>
      <Modal visible={showEndModal} transparent><Pressable style={styles.modalBg} onPress={() => setShowEndModal(false)}><View style={styles.modalBox}><Calendar onDayPress={(d) => { setEndDate(d.dateString); setShowEndModal(false); }} minDate={startDate} maxDate={today} /></View></Pressable></Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FF' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, marginTop: 40, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#5B6EF7', flex: 1, textAlign: 'center' },
  container: { padding: 20 },
  inputCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EBEBEB' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 15 },
  dateLabel: { fontSize: 12, color: '#666', marginBottom: 5 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  dateBox: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EBEBEB' },
  dateText: { color: '#333' },
  genBtn: { backgroundColor: '#5B6EF7', padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  genBtnText: { color: 'white', fontWeight: '700', fontSize: 16, marginLeft: 8 },
  dateHeader: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB' },
  statusTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, minWidth: 70, justifyContent: 'center', alignItems: 'center' },
  statusTagText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F0F0FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#5B6EF7', fontWeight: 'bold' },
  name: { fontWeight: '700', fontSize: 14 },
  dept: { fontSize: 12, color: '#666' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, width: '90%' },
  resultModalBox: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 15 },
  okBtn: { backgroundColor: '#5B6EF7', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 12, marginTop: 20 }
});

export default AttendanceRecords;