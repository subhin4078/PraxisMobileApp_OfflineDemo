import "@/global.css";
import { Toast } from "@/src/components/Toast";
import { BgmAudioAssets } from "@/src/constants/assets/audioAssets";
import { useToast } from "@/src/hooks/useToast";
import i18n from "@/src/i18n";
import queryClient from "@/src/lib/queryClient";
import { useSettingsStore } from "@/src/stores/useSettingsStore";
import { playPageBgm } from "@/src/utils/bgm";
import { installGlobalButtonSfx } from "@/src/utils/sfx";
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  useFonts,
} from "@expo-google-fonts/fredoka";
import { Huninn_400Regular } from "@expo-google-fonts/huninn";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const { message, type, toastKey, hide } = useToast();

  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Huninn_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    installGlobalButtonSfx();
    void (async () => {
      await useSettingsStore.getState().hydrate();
      void playPageBgm({
        key: "home",
        source: BgmAudioAssets.home,
        isLooping: true,
        loopDelayMs: 8000,
        volume: 1,
      });
    })();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider
          value={colorScheme === "light" ? DefaultTheme : DarkTheme}
        >
          <StatusBar style={colorScheme === "light" ? "dark" : "light"} />
          <SafeAreaProvider>
            <View className="flex-1 bg-background">
              {message && (
                <Toast
                  key={toastKey}
                  message={message}
                  type={type}
                  onDismiss={hide}
                />
              )}
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  animationDuration: 220,
                  gestureEnabled: true,
                }}
              >
                <Stack.Screen name="index" options={{ animation: "none" }} />
                <Stack.Screen
                  name="other/welcome"
                  options={{ gestureEnabled: false, animation: "fade" }}
                />
                <Stack.Screen
                  name="(tabs)"
                  options={{ gestureEnabled: false, animation: "fade" }}
                />
                <Stack.Screen name="other/shop" />
                <Stack.Screen name="battle/index" />
                <Stack.Screen name="daily-exercise" />
                <Stack.Screen name="auth" />
              </Stack>
            </View>
          </SafeAreaProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
