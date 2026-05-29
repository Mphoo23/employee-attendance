import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { EmployeeProvider, useEmployeeContext } from '../context/useEmployee';


SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  return (
    <EmployeeProvider>
      <LayoutContent />
    </EmployeeProvider>
  );
};

const LayoutContent = () => {
  const { isLoading } = useEmployeeContext();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(home)" />
    </Stack>
  );
};

export default RootLayout;