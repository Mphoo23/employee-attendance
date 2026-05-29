import { useEmployeeContext } from '@/context/useEmployee';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

const DailyAR = () => {
  const router = useRouter();
  const { attendanceRecords, lateTime } = useEmployeeContext();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [showCalendar, setShowCalendar] = useState(false); // Toggle state

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => record.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#7F5AF0', '#5B8CFF']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* HEADER */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.header}>Daily Attendance Report</Text>
            <View style={{ width: 46 }} />
          </View>

          <Text style={styles.subText}>Select date</Text>

          {/* DATE SELECTOR BUTTONS */}
          <View style={styles.datePickerContainer}>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCalendar(!showCalendar)}>
              <Text style={styles.pickerText}>Date: {selectedDate}</Text>
              <Ionicons name="calendar-outline" size={20} color="#5B8CFF" />
            </TouchableOpacity>
          </View>

          {/* CONDITIONAL CALENDAR */}
          {showCalendar && (
            <View style={styles.calendarBox}>
              <Calendar
                onDayPress={(day: any) => {
                  setSelectedDate(day.dateString);
                  setShowCalendar(false); // Hide after selection
                }}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: '#7F5AF0' } }}
              />
            </View>
          )}

          {/* RECORDS */}
          {filteredRecords.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-text-outline" size={60} color="white" />
              <Text style={styles.emptyText}>No Attendance Data</Text>
            </View>
          ) : (
            filteredRecords.map((record, index) => (
              <View key={index} style={styles.card}>
                <View style={styles.info}>
                  <Text style={styles.name}>{record.name}</Text>
                  <Text style={styles.time}>{lateTime(record)}</Text>
                </View>
                <Text style={styles.statusText}>{record.status}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default DailyAR;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#7F5AF0' },
  gradient: { flex: 1 },
  container: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  header: { fontSize: 20, fontWeight: '700', color: 'white' },
  headerBackButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  subText: { textAlign: 'center', color: 'white', marginBottom: 10 },
  datePickerContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  pickerButton: { 
    backgroundColor: 'white', padding: 15, borderRadius: 12, flexDirection: 'row', 
    alignItems: 'center', justifyContent: 'space-between', width: '80%' 
  },
  pickerText: { color: '#5B8CFF', fontWeight: '600' },
  calendarBox: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  card: { backgroundColor: 'white', borderRadius: 20, padding: 14, flexDirection: 'row', marginBottom: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  time: { fontSize: 12, color: '#888' },
  statusText: { fontWeight: 'bold', color: '#7F5AF0' },
  emptyCard: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: 'white', marginTop: 10, fontSize: 16, fontWeight: '600' },
});