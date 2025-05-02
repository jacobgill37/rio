import { RadioBrowserApiProvider } from "@/src/context/RadioBrowserApiContext";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import merge from "deepmerge";
import { Stack } from "expo-router";
import { StatusBar, useColorScheme } from "react-native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme,
} from "react-native-paper";

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});
const CombinedLightTheme = merge(LightTheme, MD3LightTheme);
const CombinedDarkTheme = merge(DarkTheme, MD3DarkTheme);

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const theme =
    colorScheme === "dark"
      ? { ...CombinedDarkTheme, fonts: NavigationDarkTheme.fonts }
      : { ...CombinedLightTheme, fonts: NavigationDefaultTheme.fonts };

  const paperTheme =
    colorScheme === "dark" ? CombinedDarkTheme : CombinedLightTheme;

  return (
    <RadioBrowserApiProvider>
      <ThemeProvider value={theme}>
        <PaperProvider theme={paperTheme}>
          <StatusBar
            barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
            backgroundColor={paperTheme.colors.background}
          />
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </PaperProvider>
      </ThemeProvider>
    </RadioBrowserApiProvider>
  );
}
