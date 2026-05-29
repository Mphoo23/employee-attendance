import Ionicons from '@expo/vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as XLSX from 'xlsx';
import { useEmployeeContext } from '../context/useEmployee';

const GenerateExcel = () => {
  const router = useRouter();
  const { attendanceRecords, lateTime } = useEmployeeContext();

  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [endDate, setEndDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const normalize = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const [d, m, y] = dateStr.split('/');
      return `${y}-${m}-${d}`;
    }
    return dateStr.slice(0, 10);
  };

  const filteredRecords = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (attendanceRecords || []).filter((record) => {
      const rDate = new Date(normalize(record.date));
      return rDate >= start && rDate <= end;
    });
  }, [attendanceRecords, startDate, endDate]);

  const generateExcel = async () => {
    try {
      if (filteredRecords.length === 0) {
        Alert.alert('No Data', 'No records found');
        return;
      }

      const excelData = filteredRecords.map((r, i) => ({
        No: i + 1,
        Name: r.name,
        Department: r.department,
        Status: r.status,
        Date: r.date,
        Time: r.time,
        Late: lateTime(r),
      }));

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

      const base64 = XLSX.write(wb, {
        type: 'base64',
        bookType: 'xlsx',
      });

      const fileUri =
        FileSystem.documentDirectory +
        `Attendance_${startDate}_to_${endDate}.xlsx`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: 'base64',
      });

      await Sharing.shareAsync(fileUri);

      Alert.alert('Success', 'Excel generated successfully');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to generate file');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#7664FF', '#7664FF']}
        style={styles.gradient}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerText}>Generate Reports</Text>
            <Ionicons
              name="calendar-outline"
              size={26}
              color="white"
            />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.container}>
          <Ionicons
            name="document-text-outline"
            size={80}
            color="#7664FF"
            style={{ marginBottom: 8 }}
          />

          <Text style={styles.subtitle}>
            Select start and end date to export attendance records
          </Text>

          <Pressable
            style={styles.pickerTrigger}
            onPress={() => setShowStart(true)}
          >
            <Text style={styles.pickerTriggerText}>
              Start: {startDate}
            </Text>

            <Ionicons
              name="calendar"
              size={20}
              color="#7664FF"
            />
          </Pressable>

          <Pressable
            style={styles.pickerTrigger}
            onPress={() => setShowEnd(true)}
          >
            <Text style={styles.pickerTriggerText}>
              End: {endDate}
            </Text>

            <Ionicons
              name="calendar"
              size={20}
              color="#7664FF"
            />
          </Pressable>

          <TouchableOpacity
            style={styles.button}
            onPress={generateExcel}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color="white"
            />
            <Text style={styles.buttonText}>
              Generate Excel
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <Modal visible={showStart} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={(day) => {
                setStartDate(day.dateString);
                setShowStart(false);
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal visible={showEnd} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Calendar
              onDayPress={(day) => {
                setEndDate(day.dateString);
                setShowEnd(false);
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GenerateExcel;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7664FF',
  },

  gradient: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },

  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },

  headerBackButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerSpacer: {
    width: 46,
  },

  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10,
    alignItems: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 20,
  },

  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F4',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    width: '100%',
    marginBottom: 12,
  },

  pickerTriggerText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },

  // ✅ SMALLER BUTTON
  button: {
    marginTop: 10,
    backgroundColor: '#7664FF',
    width: '60%',
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
  },
});