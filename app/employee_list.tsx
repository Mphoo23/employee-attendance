import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEmployeeContext } from '../context/useEmployee';

const EmployeeList = () => {
  const router = useRouter();
  const { employees, deleteEmployee, loggedInEmployee } = useEmployeeContext();

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const openDeleteModal = (emp: any) => {
    setSelectedEmployee(emp);
    setModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.firebaseId);
    }
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F6F7FF' }}>

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="#5B6EF7" />
        </Pressable>

        <Text style={styles.headerTitle}>Employee List</Text>

        <View style={{ width: 26 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          placeholder="Search employees..."
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, marginLeft: 8 }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: 15, paddingBottom: 120 }}>
        <Text style={styles.sectionTitle}>
          MEMBERS ({filteredEmployees.filter(e => e.name !== 'Admin').length})
        </Text>

        {filteredEmployees.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
            No employees found matching your search.
          </Text>
        )}

        {filteredEmployees.map((emp) => {
          if (emp.name === 'Admin') return null;

          return (
            <View key={emp.firebaseId} style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={styles.avatar}>
                  <Text style={{ color: '#5B6EF7', fontWeight: 'bold' }}>
                    {emp.name.charAt(0)}
                  </Text>
                </View>

                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.name}>{emp.name}</Text>
                  <Text style={styles.dept}>{emp.department}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{emp.position}</Text>
                  </View>
                </View>
              </View>

              {loggedInEmployee?.role === 'admin' && (
                <View style={{ flexDirection: 'row', gap: 20 }}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/edit_employee',
                        params: {
                          employeeData: JSON.stringify({
                            firebaseId: emp.firebaseId, 
                            name: emp.name,
                            id: emp.id,
                            phoneno: emp.phoneno,
                            position: emp.position,
                            gender: emp.gender,
                            email: emp.email,
                            address: emp.address,
                            department: emp.department
                          })
                        }
                      })
                    }
                  >
                    <MaterialCommunityIcons name="account-edit-outline" size={20} color="#666" />
                  </Pressable>

                  <Pressable onPress={() => openDeleteModal(emp)}>
                    <Ionicons name="trash-outline" size={18} color="#FF4D6D" />
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {loggedInEmployee?.role === 'admin' && (
        <Pressable style={styles.fab} onPress={() => router.push('/enroll_employee')}>
          <Ionicons name="person-add" size={18} color="white" />
        </Pressable>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="warning" size={40} color="#FF4D6D" />
            <Text style={{ fontSize: 16, marginVertical: 15 }}>
              Delete {selectedEmployee?.name}?
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
                <Text style={{ color: 'white' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EmployeeList;

const styles = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7FF' },
  headerTitle: { color: '#5B6EF7', fontSize: 20, fontWeight: '700', flex: 1, textAlign: 'center' },
  searchBox: { flexDirection: 'row', backgroundColor: 'white', margin: 15, paddingVertical: 5, paddingHorizontal: 12, borderRadius: 12, alignItems: 'center', elevation: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#666', marginBottom: 10 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
  avatar: { width: 45, height: 45, borderRadius: 22, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  name: { fontWeight: '700', fontSize: 14 },
  dept: { fontSize: 12, color: '#999' },
  badge: { marginTop: 4, backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, color: '#5B6EF7', fontWeight: '600' },
  fab: { position: 'absolute', bottom: 100, right: 20, backgroundColor: '#5B6EF7', width: 50, height: 50, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: 'white', padding: 20, borderRadius: 16, width: '80%', alignItems: 'center' },
  cancelBtn: { flex: 1, backgroundColor: '#EEE', padding: 10, borderRadius: 10, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: '#FF4D6D', padding: 10, borderRadius: 10, alignItems: 'center' },
});