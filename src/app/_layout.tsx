import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../global.css';

// Keep the native splash screen visible while fonts/resources are loading
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide the native splash screen immediately, as index.tsx serves as our animated premium splash
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="home" />
        <Stack.Screen name="digilocker/index" />
        <Stack.Screen name="digilocker/verify" />
        <Stack.Screen name="digilocker/documents" />
        <Stack.Screen name="digilocker/details" />
        <Stack.Screen name="grievances/index" />
        <Stack.Screen name="grievances/report" />
        <Stack.Screen name="grievances/track" />
        <Stack.Screen name="schemes/questionnaire" />
        <Stack.Screen name="schemes/processing" />
        <Stack.Screen name="schemes/recommendations" />
        <Stack.Screen name="schemes/details" />
        <Stack.Screen name="appointments/select-department" />
        <Stack.Screen name="appointments/choose-service" />
        <Stack.Screen name="appointments/book" />
        <Stack.Screen name="appointments/confirmation" />
        <Stack.Screen name="appointments/my-appointments" />
        <Stack.Screen name="activity" />
        <Stack.Screen name="assistant" />
      </Stack>
    </ThemeProvider>
  );
}
