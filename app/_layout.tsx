import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { EmployeeProvider, useEmployeeContext } from '../context/useEmployee';

SplashScreen.preventAutoHideAsync();
//Hello
const RootLayout = () => {
  return (
    <EmployeeProvider>
      <LayoutContent />
    </EmployeeProvider>
  );
};

const LayoutContent = () => {
  const { isLoading, setLoggedInEmployee } = useEmployeeContext();
  const router = useRouter(); 

  useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('loggedInEmployee');
        if (savedUser) {
          setLoggedInEmployee(JSON.parse(savedUser));
        
          router.replace('/(home)'); 
        }
      } catch (error) {
        console.error("Session load error:", error);
      }
    };

    if (!isLoading) {
      checkSession().finally(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [isLoading]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(home)" />
      </Stack>
    </GestureHandlerRootView>
  );
};

export default RootLayout;