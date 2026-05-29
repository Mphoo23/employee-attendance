import { useEmployeeContext } from '@/context/useEmployee';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MarkAttendance = () => {
  const { employees, markAttendance, loggedInEmployee } =
    useEmployeeContext();

  const router = useRouter();

  const empId = loggedInEmployee?.id || '';
  const empName = loggedInEmployee?.name || '';

  const [status, setStatus] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [isInsideOffice, setIsInsideOffice] = useState(false);

  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Error');
  const [alertMessage, setAlertMessage] = useState('');

  const OFFICE_LAT = 16.78006150706561;
  const OFFICE_LNG = 96.13946223099434;
  const OFFICE_RADIUS = 5000;

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371000;

    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;

    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) ** 2;

    return (
      R *
      (2 *
        Math.atan2(
          Math.sqrt(a),
          Math.sqrt(1 - a)
        ))
    );
  };

  useEffect(() => {
    let watcher: Location.LocationSubscription | null =
      null;

    const start = async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') return;

      watcher =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.BestForNavigation,
            timeInterval: 3000,
            distanceInterval: 5,
          },
          (loc) => {
            const dist = getDistance(
              loc.coords.latitude,
              loc.coords.longitude,
              OFFICE_LAT,
              OFFICE_LNG
            );

            setIsInsideOffice(
              dist <= OFFICE_RADIUS
            );
          }
        );
    };

    start();

    return () => watcher?.remove();
  }, []);

  const triggerAlert = (
    title: string,
    message: string
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const handleSubmit = async () => {
    if (!status) {
      triggerAlert(
        'Error',
        'Select attendance status'
      );
      return;
    }

    if (
      status === 'Leave' &&
      !leaveReason.trim()
    ) {
      triggerAlert(
        'Error',
        'Enter leave reason'
      );
      return;
    }

    const employee = employees.find(
      (e: any) => e.id === empId
    );

    if (!employee) {
      triggerAlert(
        'Error',
        'Employee not found'
      );
      return;
    }

    await markAttendance(
      employee.id,
      status as any
    );

    triggerAlert(
      'Success',
      `${employee.name} marked ${status}`
    );

    setStatus('');
    setLeaveReason('');
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#7664FF',
      }}
    >
      <LinearGradient
        colors={['#7664FF', '#7664FF']}
        style={{ flex: 1 }}
      >
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color="white"
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Mark Attendance
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.employeeCard}>
            <View style={styles.avatarContainer}>
              <Ionicons
                name="person"
                size={42}
                color="white"
              />
            </View>

            <Text style={styles.employeeName}>
              {empName}
            </Text>

            <Text style={styles.employeeId}>
              Employee ID: {empId}
            </Text>

            <View style={styles.locationBadge}>
              <Ionicons
                name={
                  isInsideOffice
                    ? 'flag'
                    : 'home'
                }
                size={16}
                color="white"
              />

              <Text
                style={
                  styles.locationBadgeText
                }
              >
                {isInsideOffice
                  ? 'Inside Office'
                  : 'Outside Office'}
              </Text>
            </View>
          </View>

          {/* DROPDOWN + BUTTON ROW */}
          <View style={styles.actionRow}>
            <Pressable
              style={styles.pickerTrigger}
              onPress={() =>
                setIsPickerVisible(true)
              }
            >
              <Text
                style={[
                  styles.pickerTriggerText,
                  !status &&
                    styles.placeholderText,
                ]}
              >
                {status ||
                  'Select Attendance'}
              </Text>

              <Ionicons
                name="chevron-down"
                size={18}
                color="#7664FF"
              />
            </Pressable>

            <Pressable
              style={styles.submitBtn}
              onPress={handleSubmit}
            >
              <Text
                style={styles.submitBtnText}
              >
                Submit
              </Text>
            </Pressable>
          </View>

          {status === 'Leave' && (
            <TextInput
              placeholder="Leave Reason"
              placeholderTextColor="#A0A5BA"
              value={leaveReason}
              onChangeText={setLeaveReason}
              style={[
                styles.input,
                styles.leaveInput,
              ]}
              multiline
            />
          )}
        </View>
      </LinearGradient>

      {/* PICKER MODAL */}
      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setIsPickerVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setIsPickerVisible(false)
          }
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select Status
            </Text>

            {(isInsideOffice
              ? ['Present', 'Check Out', 'Leave']
              : ['WFH', 'Leave']
            ).map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.pickerItem,
                  status === item &&
                    styles.pickerItemSelected,
                ]}
                onPress={() => {
                  setStatus(item);
                  setIsPickerVisible(false);
                }}
              >
                <View
                  style={styles.dropdownRow}
                >
                  <Ionicons
                    name={
                      item === 'Present'
                        ? 'flag'
                        : item ===
                          'Check Out'
                        ? 'log-out-outline'
                        : item === 'WFH'
                        ? 'home'
                        : 'calendar'
                    }
                    size={18}
                    color={
                      status === item
                        ? '#7664FF'
                        : '#555'
                    }
                  />

                  <Text
                    style={[
                      styles.pickerItemText,
                      status === item &&
                        styles.pickerItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ALERT MODAL */}
      <Modal
        animationType="fade"
        transparent
        visible={isAlertVisible}
        onRequestClose={() =>
          setIsAlertVisible(false)
        }
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>
              {alertTitle}
            </Text>

            <Text style={styles.alertMessage}>
              {alertMessage}
            </Text>

            <View
              style={
                styles.alertButtonContainer
              }
            >
              <Pressable
                style={styles.alertButton}
                onPress={() =>
                  setIsAlertVisible(false)
                }
              >
                <Text
                  style={
                    styles.alertButtonText
                  }
                >
                  OK
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MarkAttendance;

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },

  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.18)',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  employeeCard: {
    backgroundColor:
      'rgba(255,255,255,0.12)',
    borderRadius: 28,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },

  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.18)',
    marginBottom: 18,
  },

  employeeName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },

  employeeId: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    marginTop: 6,
    fontWeight: '500',
  },

  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor:
      'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    marginTop: 18,
  },

  locationBadgeText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 13,
  },

  /* ROW */
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  pickerTrigger: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pickerTriggerText: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },

  placeholderText: {
    color: '#A0A5BA',
  },

  submitBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitBtnText: {
    color: '#7664FF',
    fontSize: 15,
    fontWeight: '700',
  },

  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginTop: 14,
    borderRadius: 16,
    fontSize: 16,
    color: '#1E293B',
  },

  leaveInput: {
    height: 100,
    textAlignVertical: 'top',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 16,
  },

  pickerItem: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 4,
  },

  pickerItemSelected: {
    backgroundColor: '#F3EFFF',
  },

  pickerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginLeft: 12,
  },

  pickerItemTextSelected: {
    color: '#7664FF',
    fontWeight: '700',
  },

  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  alertOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  alertBox: {
    width: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    elevation: 5,
  },

  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 10,
  },

  alertMessage: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 24,
    lineHeight: 22,
  },

  alertButtonContainer: {
    alignItems: 'flex-end',
  },

  alertButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  alertButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#7664FF',
  },
});