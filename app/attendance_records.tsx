import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../context/useEmployee';

const AttendanceRecords = () => {
  const router = useRouter();
  const { attendanceRecords, lateTime } = useEmployeeContext();

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('-')) return new Date(dateStr);
    const [d, m, y] = dateStr.split('/');
    return new Date(`${y}-${m}-${d}`);
  };

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const date = parseDate(record.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });
  }, [attendanceRecords, startDate, endDate]);

  const groupedRecords = useMemo(() => {
    const groups: Record<string, any[]> = {};
    filteredRecords.forEach((r) => {
      if (!groups[r.date]) groups[r.date] = [];
      groups[r.date].push(r);
    });
    return Object.entries(groups).sort(
      (a, b) => parseDate(b[0]).getTime() - parseDate(a[0]).getTime()
    );
  }, [filteredRecords]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#7664FF', '#7664FF']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Updated Header Structure */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.header}>Attendance Report</Text>
            <View style={{ width: 40 }} />
          </View>

          <Text style={styles.subText}>Select date range</Text>

          <View style={styles.row}>
            <TouchableOpacity style={styles.dateBox} onPress={() => setShowStartModal(true)}>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>Start: {startDate}</Text>
                <Ionicons name="chevron-down" size={20} color="#7664FF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateBox} onPress={() => setShowEndModal(true)}>
              <View style={styles.dateRow}>
                <Text style={styles.dateText}>End: {endDate}</Text>
                <Ionicons name="chevron-down" size={20} color="#7664FF" />
              </View>
            </TouchableOpacity>
          </View>

          {groupedRecords.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={60} color="white" />
              <Text style={styles.emptyText}>No Attendance Data</Text>
            </View>
          ) : (
            groupedRecords.map(([date, records]) => (
              <View key={date}>
                <Text style={styles.dateHeader}>
                  <FontAwesome name="calendar" size={16} /> {date}
                </Text>
                {records.map((r, i) => (
                  <View key={i} style={styles.card}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{r.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.info}>
                      <Text style={styles.name}>{r.name}</Text>
                      <Text style={styles.department}>{r.department}</Text>
                      <Text style={styles.time}>{lateTime(r)}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{r.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>

        <Modal visible={showStartModal} transparent animationType="fade">
          <View style={styles.modalBg}><View style={styles.modalBox}><Calendar onDayPress={(day) => { setStartDate(day.dateString); setShowStartModal(false); }} /></View></View>
        </Modal>
        <Modal visible={showEndModal} transparent animationType="fade">
          <View style={styles.modalBg}><View style={styles.modalBox}><Calendar onDayPress={(day) => { setEndDate(day.dateString); setShowEndModal(false); }} /></View></View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default AttendanceRecords;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#7664FF' },
  gradient: { flex: 1 },
  container: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  subText: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: 20, fontSize: 13 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  dateBox: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 12, elevation: 3 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateText: { fontSize: 13, fontWeight: '600', color: '#7664FF' },
  dateHeader: { color: '#FFFFFF', fontWeight: '800', marginTop: 18, marginBottom: 10, fontSize: 15 },
  card: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  avatar: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#EEF3FF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '800', color: '#7664FF', fontSize: 16 },
  info: { flex: 1, marginLeft: 10 },
  name: { fontWeight: '800', fontSize: 14, color: '#222' },
  department: { fontSize: 12, color: '#666', marginTop: 2 },
  time: { fontSize: 11, color: '#999', marginTop: 2 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#7664FF' },
  statusText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  emptyCard: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: 'white', marginTop: 10, fontSize: 16, fontWeight: '600' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, width: '90%', elevation: 8 }
});