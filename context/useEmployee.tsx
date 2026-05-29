import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Alert } from 'react-native';
import { db } from '../src/config/firebase';

export type AttendanceStatus = 'Present' | 'WFH' | 'Leave';

export type Employee = {
  firebaseId?: string;
  id: string;
  name: string;
  position: string;
  department: string;
  AttendanceStatus?: AttendanceStatus | null;
  photoUrl?: string;
};

export type AttendanceRecord = {
  firebaseId?: string;
  employeeId: string;
  name: string;
  department: string;
  status: AttendanceStatus;
  date: string;
  time: string;
};

type EmployeeContextType = {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  isLoading: boolean;
  loggedInEmployee: Employee | null;
  loadEmployee: () => Promise<void>;
  setLoggedInEmployee: (employee: Employee | null) => Promise<void>;
  addEmployee: (employee: Employee) => Promise<void>;
  clearEmployees: () => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  markAttendance: (id: string, status: AttendanceStatus) => Promise<void>;
  lateTime: (record: AttendanceRecord) => string;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: React.ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInEmployee, setLoggedInEmployeeState] = useState<Employee | null>(null);

  // ✅ LOAD LOGGED IN EMPLOYEE
  const loadEmployee = async () => {
    setIsLoading(true); 
    try {
      const data = await AsyncStorage.getItem('loggedInEmployee');
      if (data) {
        setLoggedInEmployeeState(JSON.parse(data));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); 
    }
  };

  // ✅ SET LOGGED IN EMPLOYEE
  const setLoggedInEmployee = async (employee: Employee | null) => {
    try {
      if (employee) {
        await AsyncStorage.setItem('loggedInEmployee', JSON.stringify(employee));
        setLoggedInEmployeeState(employee);
      } else {
        await AsyncStorage.removeItem('loggedInEmployee');
        setLoggedInEmployeeState(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ✅ LOAD ON START
  useEffect(() => {
    loadEmployee();
  }, []);

  // ✅ REALTIME FIRESTORE
  useEffect(() => {
    const unsubEmp = onSnapshot(collection(db, 'employees'), (snap) => {
      setEmployees(snap.docs.map((d) => ({ firebaseId: d.id, ...(d.data() as Employee) })));
      setIsLoading(false);
    });

    const unsubAtt = onSnapshot(collection(db, 'attendanceRecords'), (snap) => {
      setAttendanceRecords(snap.docs.map((d) => ({ firebaseId: d.id, ...(d.data() as AttendanceRecord) })));
    });

    return () => {
      unsubEmp();
      unsubAtt();
    };
  }, []);

  // ✅ ADD EMPLOYEE
  const addEmployee = async (employee: Employee) => {
    try {
      const q = query(collection(db, 'employees'), where('id', '==', employee.id));
      const snap = await getDocs(q);
      if (!snap.empty) { Alert.alert('Error', 'Employee ID already exists'); return; }
      await addDoc(collection(db, 'employees'), { ...employee, createdAt: new Date().toISOString() });
      Alert.alert('Success', 'Employee added');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to add employee');
    }
  };

  // ✅ DELETE EMPLOYEE
  const deleteEmployee = async (firebaseId: string) => {
    try {
      await deleteDoc(doc(db, 'employees', firebaseId));
      Alert.alert('Deleted', 'Employee removed');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to delete employee');
    }
  };

  // ✅ CLEAR EMPLOYEES
  const clearEmployees = async () => {
    try {
      const snap = await getDocs(collection(db, 'employees'));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, 'employees', d.id))));
      Alert.alert('Success', 'All employees cleared');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to clear employees');
    }
  };

  // ✅ MARK ATTENDANCE
  const markAttendance = async (id: string, status: AttendanceStatus) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    await addDoc(collection(db, 'attendanceRecords'), {
      employeeId: id,
      name: employee.name,
      department: employee.department,
      status,
      date: today,
      time,
    });
    Alert.alert('Success', `${employee.name} marked ${status}`);
  };

  // ✅ LATE LOGIC
  const lateTime = (record: AttendanceRecord) => {
    const officeMinutes = 9 * 60;
    const [h, m] = record.time.split(':').map(Number);
    const currentMinutes = h * 60 + m;
    if (record.status !== 'Present') return `Status: ${record.status}`;
    return currentMinutes > officeMinutes ? `Late Arrival - ${record.time}` : `On Time - ${record.time}`;
  };

  const value = useMemo(() => ({
    employees,
    attendanceRecords,
    isLoading,
    loggedInEmployee,
    loadEmployee,
    setLoggedInEmployee,
    addEmployee,
    clearEmployees,
    deleteEmployee,
    markAttendance,
    lateTime,
  }), [employees, attendanceRecords, isLoading, loggedInEmployee]);

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployeeContext = () => {
  const ctx = useContext(EmployeeContext);
  if (!ctx) throw new Error('Use inside provider');
  return ctx;
};