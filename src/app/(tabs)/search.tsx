import { useRadioBrowserApi } from "@/src/context/RadioBrowserApiContext";
import { getStationIds } from "@/src/hooks/getStationIds";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Station } from "radio-browser-api";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Chip,
  Divider,
  Icon,
  Searchbar,
  Text,
} from "react-native-paper";

// This page should:
// - Take the user input from the search bar
// - Call the radio-browser API to get the station data
// - Allow the users to select a station(s) from the list
// - Save that station id to AsyncStorage

type SearchResultProps = {
  station: Station;
  setSavedStationIds: (ids: string[]) => void;
};

const SearchResult = ({ station, setSavedStationIds }: SearchResultProps) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleAddToList = async (stationId: string) => {
    try {
      const parsedStationIds = await getStationIds();

      if (!parsedStationIds.includes(stationId)) {
        parsedStationIds.push(stationId);

        await AsyncStorage.setItem(
          "stationIds",
          JSON.stringify(parsedStationIds)
        );

        setIsSaved(true);
        setSavedStationIds(parsedStationIds);
      }
    } catch (error) {
      console.error("Error saving station ID:", error);
      Alert.alert("Error", "Failed to save station ID. Please try again.");
    }
  };

  const handleRemoveFromList = async (stationId: string) => {
    try {
      const parsedStationIds = await getStationIds();

      const updatedStationIds = parsedStationIds.filter(
        (id: string) => id !== stationId
      );

      await AsyncStorage.setItem(
        "stationIds",
        JSON.stringify(updatedStationIds)
      );

      setIsSaved(false);
      setSavedStationIds(updatedStationIds);
    } catch (error) {
      console.error("Error removing station ID:", error);
      Alert.alert("Error", "Failed to remove station ID. Please try again.");
    }
  };

  useEffect(() => {
    const checkIfSaved = async () => {
      const savedStationIds = await AsyncStorage.getItem("stationIds");
      const parsedStationIds = savedStationIds
        ? JSON.parse(savedStationIds)
        : [];
      setIsSaved(parsedStationIds.includes(station.id));
    };

    checkIfSaved();
  }, [station.id]);

  return (
    <Card style={styles.stationCard}>
      <Card.Title
        title={station.name}
        titleVariant="labelLarge"
        titleNumberOfLines={0}
      />
      <Card.Content>
        <View style={styles.addToListContainer}>
          {station.favicon ? (
            <Image source={{ uri: station.favicon }} style={styles.image} />
          ) : (
            <Icon source="radio" size={40} />
          )}
          {isSaved ? (
            <Button
              mode="outlined"
              onPress={() => handleRemoveFromList(station.id)}
              style={styles.addToListButton}
            >
              Remove from station list
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => handleAddToList(station.id)}
              style={styles.addToListButton}
            >
              Add to station list
            </Button>
          )}
        </View>
        <Divider style={styles.divider} />
        <View style={styles.chipContainer}>
          {station.tags.map((tag) => (
            <Chip key={tag} style={styles.chip} compact>
              {tag}
            </Chip>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const Search = () => {
  const radioBrowserApi = useRadioBrowserApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [searchSent, setSearchSent] = useState(false);
  const [savedStationIds, setSavedStationIds] = useState<string[]>([]);

  const handleSearch = async () => {
    try {
      const strippedQuery = searchQuery.trim();
      const results = await radioBrowserApi.searchStations({
        name: strippedQuery,
        countryCode: "GB",
      });
      setStations(results);
      setSearchSent(true);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch stations. Please try again.");
      console.error(error);
    }
  };

  return (
    <ScrollView>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchbar}
      />
      <>
        {searchQuery.length > 0 && (
          <Button
            onPress={() => {
              setStations([]);
              setSearchQuery("");
              setSearchSent(false);
            }}
            mode="contained"
            style={styles.clearResultsButton}
          >
            Clear results
          </Button>
        )}
        {searchSent && (
          <Card style={styles.card} mode="contained">
            <Card.Title title="Search Results" titleVariant="bodyLarge" />
            <Card.Content>
              {stations.length > 0 ? (
                stations.map((station: Station) => (
                  <SearchResult
                    key={station.id}
                    station={station}
                    setSavedStationIds={setSavedStationIds}
                  />
                ))
              ) : (
                <Text>No stations found</Text>
              )}
            </Card.Content>
          </Card>
        )}
      </>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  addToListButton: {
    marginHorizontal: 8,
  },
  addToListContainer: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    maxWidth: 1200,
    margin: 16,
  },
  stationCard: {
    margin: 8,
  },
  stationCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  chip: {
    margin: 4,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  clearResultsButton: {
    marginHorizontal: 16,
    marginVertical: 8,
    maxWidth: 150,
  },
  divider: {
    marginVertical: 12,
  },
  image: {
    width: 40,
    height: 40,
  },
  searchbar: {
    margin: 16,
    maxWidth: 800,
  },
});

export default Search;
