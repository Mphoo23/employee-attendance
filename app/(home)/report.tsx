import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const Report = () => {
  
  const router = useRouter();
  const [userRole, setUserRole] = useState('');
  useEffect(() => {
    const loadUserData = async () => {
      const role = await AsyncStorage.getItem('userRole');
      const employeeData = await AsyncStorage.getItem('loggedInEmployee');
      if (role) setUserRole(role);
    
    };
    loadUserData();
  }, []); 
  return (
    <View style={styles.safeArea}>
      <LinearGradient
        colors={['#7F5AF0', '#5B8CFF']}
        style={styles.container}
      >
        <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 30 }}
>
  <Text style={styles.sectionTitle}>Report List</Text>

  <View style={styles.section}>
 {/* Daily Attendance Report */}
    <Pressable
      style={styles.bigCard}
      android_ripple={{ color: '#ddd' }}
      onPress={() => router.push('/daily_attendance_reports')}
    >
      <View style={styles.iconContainer}>
        {/* <MaterialIcons name="event-available" size={22} color="#5B8CFF" /> */}
        <AntDesign name="dashboard" size={22} color="#5B8CFF" />
      </View>
      <Text style={styles.cardText}>Daily Attendance Report</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </Pressable>
    {/* Attendance Report */}
    <Pressable
      style={styles.bigCard}
      android_ripple={{ color: '#ddd' }}
      onPress={() => router.push('/attendance_records')}
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="event-available" size={22} color="#5B8CFF" />
      </View>
      <Text style={styles.cardText}>Attendance Report</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </Pressable>

    {/* Summary Report */}
    {/* <Pressable
    onPress={()=>(router.push('/summary_report'))}
      style={styles.bigCard}
      android_ripple={{ color: '#ddd' }}
    
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="summarize" size={22} color="#5B8CFF" />
      </View>
      <Text style={styles.cardText}>Summary Report</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </Pressable> */}

    {/* Generate Reports */}
     {userRole === 'admin' && 
    <Pressable onPress={() => router.push('/generate_excel')}
      style={styles.bigCard}
      android_ripple={{ color: '#ddd' }}
      
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="auto-awesome" size={22} color="#5B8CFF" />
      </View>
      <Text style={styles.cardText}>Generate Reports</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </Pressable>}

    {/* Monthly Report */}
    <Pressable
      style={styles.bigCard}
      android_ripple={{ color: '#ddd' }}
      onPress={() => router.push('/monthly_reports')}
      
    >
      <View style={styles.iconContainer}>
        <MaterialIcons name="calendar-month" size={22} color="#5B8CFF" />
      </View>
      <Text style={styles.cardText}>Monthly Report</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </Pressable>

  </View>
</ScrollView>
      </LinearGradient>
    </View>
  );
};

export default Report;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:'#7F5AF0'
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 48
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    marginBottom: 22,
    letterSpacing: 0.3,
  },

  section: {
    gap: 16,
  },

  bigCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },

  iconContainer: {
    backgroundColor: '#EEF3FF',
    padding: 10,
    borderRadius: 999,
  },

  cardText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
});