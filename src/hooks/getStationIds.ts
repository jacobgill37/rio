import AsyncStorage from "@react-native-async-storage/async-storage";

export const getStationIds = async (): Promise<string[]> => {
  try {
    const stationIds = await AsyncStorage.getItem("stationIds");
    return stationIds ? JSON.parse(stationIds) : [];
  } catch (error) {
    console.error("Error retrieving station IDs:", error);
    return [];
  }
};
