import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../src/config/firebase';

export type AttendanceStatus = 'Present' | 'WFH' | 'Leave';
export type UserRole = 'admin' | 'employee';
export type Employee = {
  firebaseId?: string;
  id: string;
  role: UserRole;
  name: string;
  position: string;
  department: string;
  phoneno: string;
  email: string;
  address: string;
  gender: string;
  AttendanceStatus?: AttendanceStatus | null;
  photoUrl?: string;
  password?: string;
};

export type AttendanceRecord = {
  firebaseId?: string;
  employeeId: string;
  name: string;
  department: string;
  status: AttendanceStatus;
  date: string;
  time: string;
  checkInTime: string;
  checkOutTime?: string;
  workedHours?: string;
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
  lateTime: (record: AttendanceRecord) => string | null;
  hasCheckedInToday: (employeeId: string) => Promise<boolean>;
  updatePassword: (firebaseId: string, newPassword: string) => Promise<boolean>;
  getStatusStyle: (status: string) => { backgroundColor: string; borderColor: string; color: string };
  getInitials: (name: string) => string;
  updateEmployee: (firebaseId: string, updatedData: Partial<Employee>) => Promise<void>;
  publicHolidays: string[];
  calculateWorkHours: (checkIn: string, checkOut: string) => string;
  markCheckOut: (firebaseId: string, checkOutTime: Date, workedHours: string) => Promise<void>;
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: React.ReactNode }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loggedInEmployee, setLoggedInEmployeeState] = useState<Employee | null>(null);

  const loadEmployee = async () => {
    setIsLoading(true);
    try {
      const savedEmployee = await AsyncStorage.getItem('loggedInEmployee');
      if (savedEmployee) {
        setLoggedInEmployeeState(JSON.parse(savedEmployee));
      }
    } catch (e) {
      console.error("Failed to load session", e);
    } finally {
      setIsLoading(false);
    }
  };

  const setLoggedInEmployee = async (employee: Employee | null) => {
    if (employee) {
      await AsyncStorage.setItem('loggedInEmployee', JSON.stringify(employee));
      setLoggedInEmployeeState(employee);
    } else {
      await AsyncStorage.removeItem('loggedInEmployee');
      setLoggedInEmployeeState(null);
    }
  };

  useEffect(() => {
    loadEmployee();
    const unsubEmp = onSnapshot(collection(db, 'employees'), (snap) => {
      setEmployees(snap.docs.map((d) => ({ firebaseId: d.id, ...(d.data() as Employee) })));
    });

    const unsubAtt = onSnapshot(collection(db, 'attendanceRecords'), (snap) => {
      setAttendanceRecords(snap.docs.map((d) => ({ firebaseId: d.id, ...(d.data() as AttendanceRecord) })));
    });

    return () => {
      unsubEmp();
      unsubAtt();
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const addEmployee = async (employee: Employee) => {
    try {
      const q = query(collection(db, 'employees'), where('id', '==', employee.id));
      const snap = await getDocs(q);
      if (!snap.empty) { Alert.alert('Error', 'Employee ID already exists'); return; }
      await addDoc(collection(db, 'employees'), { ...employee, createdAt: new Date().toISOString() });
    } catch (error) { console.log(error); }
  };

  const deleteEmployee = async (firebaseId: string) => {
    try { await deleteDoc(doc(db, 'employees', firebaseId)); } catch (error) { console.log(error); }
  };

  const clearEmployees = async () => {
    try {
      const snap = await getDocs(collection(db, 'employees'));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, 'employees', d.id))));
      Alert.alert('Success', 'All employees cleared');
    } catch (error) { console.log(error); Alert.alert('Error', 'Failed to clear employees'); }
  };

  const hasCheckedInToday = async (employeeId: string): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const q = query(collection(db, 'attendanceRecords'), where('employeeId', '==', employeeId), where('date', '==', today));
    const snap = await getDocs(q);
    return !snap.empty;
  };

  const markAttendance = async (id: string, status: AttendanceStatus) => {
    const alreadyCheckedIn = await hasCheckedInToday(id);
    if (alreadyCheckedIn) { Alert.alert('Notice', 'You have already checked in for today.'); return; }
    const employee = employees.find((e) => e.id === id);
    if (!employee) return;
    const now = new Date();
    await addDoc(collection(db, 'attendanceRecords'), {
      employeeId: id,
      name: employee.name,
      department: employee.department,
      status,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      checkInTime: now.toISOString(),
    });
  };

  const lateTime = (record: AttendanceRecord): string => {
    if (!record.checkInTime) return " - ";
    const checkIn = new Date(record.checkInTime);
    const officialStartTime = new Date(checkIn);
    officialStartTime.setHours(9, 0, 0, 0);
    if (checkIn <= officialStartTime) return " - ";
    const diffMs = checkIn.getTime() - officialStartTime.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);
    return diffMins >= 60 ? `${Math.floor(diffMins / 60)}h ${diffMins % 60}m late` : `${diffMins} mins late`;
  };

  const updatePassword = async (firebaseId: string, newPassword: string) => {
    try { await updateDoc(doc(db, 'employees', firebaseId), { password: newPassword }); return true; } 
    catch (error) { console.error(error); Alert.alert("Error", "Could not update password."); return false; }
  };

  const updateEmployee = async (firebaseId: string, updatedData: Partial<Employee>) => {
    try { await updateDoc(doc(db, 'employees', firebaseId), updatedData); } catch (error) { console.log(error); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Present': return { backgroundColor: '#E0FBE2', borderColor: '#A8E6CF', color: '#166534' };
      case 'WFH': return { backgroundColor: '#FFF9C4', borderColor: '#FBC02D', color: '#854D0E' };
      case 'Leave': return { backgroundColor: '#FFEBEE', borderColor: '#EF9A9A', color: '#991B1B' };
      default: return { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', color: '#374151' };
    }
  };

  const publicHolidays = ['2026-01-01', '2026-01-04', '2026-02-12', '2026-03-02', '2026-03-27', '2026-04-13', '2026-04-14', '2026-04-15', '2026-04-16', '2026-04-17', '2026-04-30', '2026-05-01', '2026-07-19', '2026-07-29', '2026-10-25', '2026-10-26', '2026-10-27', '2026-11-23', '2026-11-24', '2026-12-04', '2026-12-25'];

  const calculateWorkHours = (checkInTimeISO: string, checkOutTimeISO: string) => {
    const checkIn = new Date(checkInTimeISO);
    const checkOut = new Date(checkOutTimeISO);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, totalHours > 4 ? totalHours - 0.75 : totalHours).toFixed(1);
  };

  const markCheckOut = async (firebaseId: string, checkOutTime: Date, workedHours: string) => {
    try {
      await updateDoc(doc(db, 'attendanceRecords', firebaseId), { checkOutTime: checkOutTime.toISOString(), workedHours });
    } catch (error) { console.error(error); Alert.alert("Error", "Failed to record checkout."); }
  };

  const value = useMemo(() => ({
    employees, attendanceRecords, isLoading, loggedInEmployee, loadEmployee,
    setLoggedInEmployee, addEmployee, clearEmployees, deleteEmployee,
    markAttendance, lateTime, hasCheckedInToday, updatePassword,
    updateEmployee, getStatusStyle, getInitials, publicHolidays, 
    calculateWorkHours, markCheckOut
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