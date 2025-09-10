import Constants from "expo-constants";
import { RadioBrowserApi } from "radio-browser-api";
import React, {
  createContext,
  useContext,
  useMemo,
  type FC,
  type ReactNode,
} from "react";

const RadioBrowserApiContext = createContext<RadioBrowserApi | null>(null);

export const useRadioBrowserApi = () => {
  const context = useContext(RadioBrowserApiContext);

  if (!context) {
    throw new Error(
      "useRadioBrowserApi must be used within a RadioBrowserApiProvider"
    );
  }

  return context;
};

export const RadioBrowserApiProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {
  const radioBrowserApi = useMemo(() => {
    const appVersion = Constants.expoConfig?.version;
    const isDevelopment = Constants.expoConfig?.developmentClient;
    const appNameForApi = isDevelopment
      ? `rio/${appVersion}-dev`
      : `rio/${appVersion}`;

    return new RadioBrowserApi(appNameForApi, true);
  }, []);

  return (
    <RadioBrowserApiContext.Provider value={radioBrowserApi}>
      {children}
    </RadioBrowserApiContext.Provider>
  );
};
