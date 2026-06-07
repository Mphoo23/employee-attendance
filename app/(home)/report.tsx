import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useEmployeeContext } from '../../context/useEmployee';

const Report = () => {
  const router = useRouter();
  const { getInitials } = useEmployeeContext();
  const [initials, setInitials] = useState('AD');
 

  useEffect(() => {
    const fetchInitials = async () => {
      const storedData = await AsyncStorage.getItem('loggedInEmployee');
      if (storedData) {
        const emp = JSON.parse(storedData);
        setInitials(getInitials(emp.name));
      }
    };
    fetchInitials();
  }, []);

  return (
    <View style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.initialsCircle}>
          <Text style={styles.initialsText}>{initials}</Text>
        </View>
        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitle}>Report Lists</Text>
        </View>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
       
        <View style={styles.section}>
          <Pressable style={styles.card} onPress={() => router.push('/attendance_records')}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="calendar-month" size={20} color="#5B6EF7" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Attendance Report</Text>
              <Text style={styles.cardSub}>Reports for a selected date range</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>

          <Pressable style={styles.card} onPress={() => router.push('/monthly_reports')}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-number-outline" size={18} color="#5B6EF7" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>Monthly Attendance</Text>
              <Text style={styles.cardSub}>Review monthly attendance reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default Report;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F7FF' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 53, marginBottom: 5 },
  titleWrapper: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#5B6EF7' },
  initialsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8ECFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  initialsText: { fontWeight: 'bold', color: '#5B6EF7', fontSize: 16 },
  
  scrollContainer: { padding: 20 },
  searchBar: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB' },
  textInput: { flex: 1, marginLeft: 10, fontSize: 16, color: '#333' },
  section: { gap: 15 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EBEBEB' },
  iconContainer: { backgroundColor: '#F3F4FF', padding: 12, borderRadius: 12 },
  textContainer: { flex: 1, marginLeft: 15 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  cardSub: { fontSize: 13, color: '#888', marginTop: 2 },
});