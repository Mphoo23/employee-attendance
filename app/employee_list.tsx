import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useEmployeeContext } from '../context/useEmployee';

const EmployeeList = () => {
  const router = useRouter();

  const {
    employees,
    clearEmployees,
    deleteEmployee,
  } = useEmployeeContext();

  const [role, setRole] = useState<string | null>(null);

  // MODAL STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'delete' | 'clear' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  useEffect(() => {
    const getRole = async () => {
      const savedRole = await AsyncStorage.getItem('userRole');
      setRole(savedRole);
    };

    getRole();
  }, []);

  const openClearModal = () => {
    setModalType('clear');
    setSelectedEmployee(null);
    setModalVisible(true);
  };

  const openDeleteModal = (employee: any) => {
    setModalType('delete');
    setSelectedEmployee(employee);
    setModalVisible(true);
  };

  const confirmAction = () => {
    if (modalType === 'clear') {
      clearEmployees();
    } else if (modalType === 'delete' && selectedEmployee) {
      deleteEmployee(selectedEmployee.firebaseId);
    }

    setModalVisible(false);
    setSelectedEmployee(null);
    setModalType(null);
  };

  return (
    <View style={styles.safeArea}>
      <LinearGradient
        colors={['#7F5AF0', '#5B8CFF']}
        style={styles.container}
      >

        {/* HEADER */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </Pressable>

          <Text style={styles.headerTitle}>
            Employee List
          </Text>

          {role === 'admin' ? (
            <Pressable
              style={styles.clearButton}
              onPress={openClearModal}
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </Pressable>
          ) : (
            <View style={{ width: 42 }} />
          )}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>

          {employees.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={50} color="#7F5AF0" />
              <Text style={styles.emptyText}>No employees found</Text>
            </View>
          ) : (
            employees.map((employee) => (
              <View key={employee.firebaseId} style={styles.employeeCard}>

                <View style={styles.leftSide}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                      {employee.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>
                      {employee.name}
                    </Text>

                    <Text style={styles.employeePosition}>
                      {employee.position}
                    </Text>

                    <Text style={styles.employeeDepartment}>
                      {employee.department}
                    </Text>
                  </View>
                </View>

                {role === 'admin' && (
                  <Pressable
                    style={styles.deleteBtn}
                    onPress={() => openDeleteModal(employee)}
                  >
                    <Ionicons name="trash" size={18} color="#FF4D6D" />
                  </Pressable>
                )}

              </View>
            ))
          )}

        </ScrollView>

        {/* ================= MODAL ================= */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>

              <Ionicons
                name="warning"
                size={45}
                color="#FF4D6D"
                style={{ marginBottom: 10 }}
              />

              <Text style={styles.modalText}>
                {modalType === 'clear'
                  ? 'Are you sure you want to delete ALL employees?'
                  : `Remove all about ${selectedEmployee?.name}?`}
              </Text>

              <View style={styles.modalButtons}>

                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteBtnModal}
                  onPress={confirmAction}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>

              </View>

            </View>
          </View>
        </Modal>

      </LinearGradient>
    </View>
  );
};

export default EmployeeList;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: { flex: 1, 
    backgroundColor: '#7F5AF0'
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 45,
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  clearButton: {
    width: 42,
    height: 42,
    borderRadius: 20,
    backgroundColor: '#FF4D6D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatarContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5B5FEF',
  },

  employeeInfo: {
    marginLeft: 14,
  },

  employeeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },

  employeePosition: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  employeeDepartment: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },

  deleteBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF1F3',
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
  },

  emptyText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },

  /* ================= MODAL ================= */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },

  modalText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 15,
    color: '#333',
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    alignItems: 'center',
  },

  cancelText: {
    fontWeight: '600',
    color: '#333',
  },

  deleteBtnModal: {
    flex: 1,
    padding: 12,
    backgroundColor: '#FF4D6D',
    borderRadius: 12,
    alignItems: 'center',
  },

  deleteText: {
    fontWeight: '700',
    color: '#fff',
  },
});