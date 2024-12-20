import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AppState, AppStateStatus } from 'react-native';
import { serverAddress } from "@/components/Config";

// SplashScreen 자동 숨김 방지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // 앱 상태 변경 핸들러
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    try {
      console.log(`[AppState Change] New AppState: ${nextAppState}`);
      const userEmail = await AsyncStorage.getItem('userEmail');

      if (userEmail) {
        // console.log(`[AppState Change] User email found: ${userEmail}`);
        if (nextAppState === 'active') {
          // console.log('[AppState Change] App is now active. Updating status to "active".');
          await updateUserStatus(userEmail, 'active');
        } else if (nextAppState === 'background') {
          // console.log('[AppState Change] App is now in background. Updating status to "inactive".');
          await updateUserStatus(userEmail, 'inactive');
        }
      } else {
        console.warn('[AppState Change] No user email found in AsyncStorage.');
      }
    } catch (error) {
      console.error('[AppState Change] Error handling app state change:', error);
    }
  };

  // 사용자 상태 업데이트
  const updateUserStatus = async (userEmail: string, status: string) => {
    try {
      // console.log(`[User Status Update] Preparing to send "${status}" for user: ${userEmail}`);
      const response = await axios.post(`${serverAddress}/api/chat/updateUserStatus`, {
        userEmail,
        status,
      });
      // console.log(`[User Status Update] Status successfully updated to "${status}":`, response.data);
    } catch (error) {
      console.error(`[User Status Update] Failed to update status: ${error.message}`);
    }
  };

  useEffect(() => {
    // 앱 상태 변경 이벤트 리스너 등록
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 초기 상태 설정
    (async () => {
      try {
        const userEmail = await AsyncStorage.getItem('userEmail');
        if (userEmail) {
          // console.log(`[Initial State] User email found: ${userEmail}`);
          const initialState = AppState.currentState === 'active' ? 'active' : 'inactive';
          // console.log(`[Initial State] AppState is "${initialState}". Updating status.`);
          await updateUserStatus(userEmail, initialState);
        } else {
          console.warn('[Initial State] No user email found in AsyncStorage.');
        }
      } catch (error) {
        console.error('[Initial State] Error updating initial user status:', error);
      }
    })();

    return () => {
      // console.log('[Cleanup] Removing AppState event listener.');
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      // console.log('[SplashScreen] Fonts loaded. Hiding splash screen.');
      SplashScreen.hideAsync();
    } else {
      // console.log('[SplashScreen] Fonts not loaded yet.');
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
      <NavigationContainer>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack initialRouteName="(init)">
            <Stack.Screen name="(init)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(join)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </NavigationContainer>
  );
}
