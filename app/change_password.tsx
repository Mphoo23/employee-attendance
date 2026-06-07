import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEmployeeContext } from '../context/useEmployee';

const ChangePassword = () => {
  const router = useRouter();
  const { loggedInEmployee, updatePassword, setLoggedInEmployee } = useEmployeeContext();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [onModalClose, setOnModalClose] = useState<() => void>(() => {});

  const showAlert = (message: string, callback?: () => void) => {
    setModalMessage(message);
    setOnModalClose(() => callback || (() => setModalVisible(false)));
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    const isAuthorized = currentPassword === loggedInEmployee?.id || currentPassword === loggedInEmployee?.password;

    if (!isAuthorized) {
      showAlert("Incorrect current password.");
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      showAlert("Password must be at least 8 characters long (Capital letter, number and special character)");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("New passwords do not match.");
      return;
    }

    if (loggedInEmployee?.firebaseId) {
      const success = await updatePassword(loggedInEmployee.firebaseId, newPassword);
      if (success) {
        await setLoggedInEmployee({ ...loggedInEmployee, password: newPassword });
        showAlert("Password updated successfully!", () => {
          setModalVisible(false);
          router.back();
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
  
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
        
            <Text style={styles.modalText}>{modalMessage}</Text>
            <Pressable style={styles.modalBtn} onPress={onModalClose}>
              <Text style={styles.btnText}>OK</Text>
            </Pressable>
          </Pressable>
         </Pressable>
      </Modal>

      <View style={styles.headerContainer}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#5B6EF7" />
        </Pressable>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} secureTextEntry={!showCurrent} value={currentPassword} onChangeText={setCurrentPassword} />
          <Pressable onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
            <Ionicons name={showCurrent ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
          </Pressable>
        </View>

        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} secureTextEntry={!showNew} value={newPassword} onChangeText={setNewPassword} />
          <Pressable onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
            <Ionicons name={showNew ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
          </Pressable>
        </View>

        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} secureTextEntry={!showConfirm} value={confirmPassword} onChangeText={setConfirmPassword} />
          <Pressable onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
            <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
          </Pressable>
        </View>

        <Pressable style={styles.updateBtn} onPress={handleUpdate}>
          <Text style={styles.btnText}>Update Password</Text>
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FF' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 10,  alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#5B6EF7', flex: 1, textAlign: 'center' },
  card: { backgroundColor: '#FFF', margin: 20, padding: 20, borderRadius: 20, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#374151', marginTop: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 15, backgroundColor: '#FFFFFF' },
  input: { flex: 1, paddingVertical: 15 },
  eyeIcon: { padding: 5, marginLeft: 10 },
  updateBtn: { backgroundColor: '#5B6EF7', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 25 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
  cancelBtn: { padding: 15, alignItems: 'center', marginTop: 10 },
  cancelText: { color: '#6B7280', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: 'white', padding: 25, borderRadius: 20, alignItems: 'center' },
  modalText: { fontSize: 16, textAlign: 'center', marginBottom: 20, color: '#333' },
  modalBtn: { backgroundColor: '#5B6EF7', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 10 },
});