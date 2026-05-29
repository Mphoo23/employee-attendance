import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../context/useEmployee';

const SummaryReport = () => {
  const router = useRouter();
  const { attendanceRecords } = useEmployeeContext();

  // Selected Date state for dynamic filtering matching your other views
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString('en-CA')
  );

  // Custom Dropdown Picker Visibility State
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  // Generate unique dates list for the dropdown box selector
  const uniqueDates = useMemo(() => {
    const dates = attendanceRecords.map((record) => String(record.date));
    const list = [...new Set(dates)].reverse();
    if (list.length > 0 && !list.includes(selectedDate)) {
      setSelectedDate(list[0]);
    }
    return list;
  }, [attendanceRecords]);

  // Dynamic summary report calculation based on picker selection
  const { present, WFH, leave, total } = useMemo(() => {
    let present = 0;
    let WFH = 0;
    let leave = 0;

    // Filter by chosen dropdown day
    const dynamicRecords = attendanceRecords.filter(
      (record) => record.date === selectedDate
    );

    dynamicRecords.forEach((record) => {
      if (record.status === 'Present') {
        present++;
      } else if (record.status === 'WFH') {
        WFH++;
      } else if (record.status === 'Leave') {
        leave++;
      }
    });

    return {
      present,
      WFH,
      leave,
      total: present + WFH + leave,
    };
  }, [attendanceRecords, selectedDate]);

  // Percentage calculations
  const attendanceRate = total > 0 ? (present / total) * 100 : 0;
  const WFHRate = total > 0 ? (WFH / total) * 100 : 0;
  const leaveRate = total > 0 ? (leave / total) * 100 : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#7F5AF0', '#5B8CFF']} style={styles.gradient}>
        
        {/* Header Block with Back Button, Centered Title, and Right Spacer */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerText}>Summary Report</Text>
            <Ionicons name="pie-chart" size={24} color="white" />
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subText}>
            Select a date to preview breakdown insights
          </Text>

          {/* Centered White Pill Custom Dropdown Box Selector (Matches image_ac7c4d.png) */}
          {uniqueDates.length !== 0 ? (
            <View style={styles.pickerCenteredWrapper}>
              <Pressable 
                style={styles.pickerTrigger}
                onPress={() => setIsPickerVisible(true)}
              >
                <Text style={styles.pickerTriggerText}>{selectedDate}</Text>
                <Ionicons name="chevron-down" size={20} color="#5B8CFF" style={styles.chevronIcon} />
              </Pressable>
            </View>
          ) : null}

          {/* TOTAL CARD */}
          <View style={styles.card}>
            <Text style={styles.title}>Total Attendance Records</Text>
            <Text style={styles.value}>{total}</Text>
          </View>

          {/* ANALYSIS CARD */}
          <View style={styles.card}>
            <Text style={styles.title}>Attendance Analysis</Text>
            
            <View style={styles.metricRow}>
              <Text style={styles.text}>✅ Present</Text>
              <Text style={[styles.badgeText, { color: '#4CAF50' }]}>{present}</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.text}>❌ WFH</Text>
              <Text style={[styles.badgeText, { color: '#F44336' }]}>{WFH}</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.text}>🟡 Leave</Text>
              <Text style={[styles.badgeText, { color: '#FF9800' }]}>{leave}</Text>
            </View>
          </View>

          {/* PERCENTAGE CARD */}
          <View style={styles.card}>
            <Text style={styles.title}>Percentage Distribution</Text>

            <View style={styles.metricRow}>
              <Text style={styles.text}>📈 Attendance Rate</Text>
              <Text style={styles.rateValue}>{attendanceRate.toFixed(1)}%</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.text}>📉 WFH Rate</Text>
              <Text style={styles.rateValue}>{WFHRate.toFixed(1)}%</Text>
            </View>

            <View style={styles.metricRow}>
              <Text style={styles.text}>🟡 Leave Rate</Text>
              <Text style={styles.rateValue}>{leaveRate.toFixed(1)}%</Text>
            </View>
          </View>

          {/* STATUS PERFORMANCE CARD */}
          <View style={styles.card}>
            <Text style={styles.title}>Performance Status</Text>

            {total === 0 ? (
              <Text style={styles.noDataStatus}>No Data Registered For This Day</Text>
            ) : attendanceRate >= 80 ? (
              <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                <Text style={styles.good}>🟢 Very Good Attendance</Text>
              </View>
            ) : attendanceRate >= 50 ? (
              <View style={[styles.statusBadge, { backgroundColor: '#FFF8E1' }]}>
                <Text style={styles.medium}>🟡 Average Attendance</Text>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: '#FFEBEE' }]}>
                <Text style={styles.bad}>🔴 Poor Attendance</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* DESIGN COMPLIANT DROPDOWN DIALOG (Matches image_ab8847.png) */}
      <Modal
        visible={isPickerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPickerVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setIsPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date</Text>
            
            <ScrollView style={{ width: '100%', maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {uniqueDates.map((date) => {
                const isSelected = date === selectedDate;
                return (
                  <Pressable
                    key={date}
                    style={[
                      styles.pickerItem,
                      isSelected && styles.pickerItemSelected
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      setIsPickerVisible(false);
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      isSelected && styles.pickerItemTextSelected
                    ]}>
                      {date}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#7F5AF0" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

    </SafeAreaView>
  );
};

export default SummaryReport;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#7F5AF0',
  },
  gradient: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
    paddingHorizontal: 20,
    width: '100%',
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
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,     
    elevation: 10,   
  },
  headerSpacer: {
    width: 46, 
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  subText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  pickerCenteredWrapper: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  
  /* REDESIGNED WHITE PILL PICKER TRIGGER (Matches image_ac7c4d.png) */
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 20,
    width: '60%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  pickerTriggerText: {
    color: '#333333',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  chevronIcon: {
    marginTop: 1,
  },

  /* CUSTOM MODAL OVERLAY AND CONTENT (Matches image_ab8847.png) */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '82%',
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111111',
    marginBottom: 16,
    letterSpacing: 0.1,
  },
  pickerItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginVertical: 4,
  },
  pickerItemSelected: {
    backgroundColor: '#F3EFFF',
  },
  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
  },
  pickerItemTextSelected: {
    color: '#7F5AF0',
    fontWeight: '700',
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    marginBottom: 12,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    color: '#7F5AF0',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  badgeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  rateValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  good: {
    color: '#4CAF50',
    fontSize: 15,
    fontWeight: '700',
  },
  medium: {
    color: '#FF9800',
    fontSize: 15,
    fontWeight: '700',
  },
  bad: {
    color: '#F44336',
    fontSize: 15,
    fontWeight: '700',
  },
  noDataStatus: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});