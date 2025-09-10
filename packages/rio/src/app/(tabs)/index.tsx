import { useRadioBrowserApi } from "@/src/context/RadioBrowserApiContext";
import { getStationIds } from "@/src/hooks/getStationIds";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useFocusEffect } from "expo-router";
import { type Station } from "radio-browser-api";
import { useCallback, useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, StyleSheet } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

// This page should:
// - Get the saved station ids from AsyncStorage✅
// - Pull station data from the station data API (name, image, etc.) radio-browser ✅
// - Store data in cache to prevent unnecessary API calls
// - Allow the user to pause and play the station and switch to the next one
// - Call to AI API to get the station id to play (will need to get API key from AsyncStorage)
// - Get stream url from station data cache
// - Get "Now Playing" info from station data API
// - Play the station - should update click counter on radio-browser API

export default function Index() {
  const radioBrowserApi = useRadioBrowserApi();
  const [stationIds, setStationIds] = useState<string[]>([]);
  const [stationData, setStationData] = useState<Station[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Station | null>(
    null
  );

  const fetchStationIds = async () => {
    const parsedStationIds = await getStationIds();
    setStationIds(parsedStationIds);
  };
  const fetchStationData = async () => {
    if (stationIds.length > 0) {
      const data = await radioBrowserApi.getStationsById(stationIds);
      setStationData(data);
    }
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchStationIds();
    await fetchStationData();
    setIsRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchStationIds();
    }, [])
  );

  useEffect(() => {
    fetchStationData();
  }, [stationIds]);

  const player = useAudioPlayer(stationData[0]?.urlResolved);
  const playerStatus = useAudioPlayerStatus(player);

  return (
    <ScrollView
      style={{
        flex: 1,
        margin: 16,
      }}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {stationData.map((station) => (
        <Text key={station.id}>{station.name}</Text>
      ))}
      <Card style={styles.card}>
        <Card.Title title="Start Playing" />
        <Card.Content>
          {playerStatus.playing && currentlyPlaying ? (
            <>
              <IconButton
                icon="pause"
                animated
                onPress={() => {
                  player.pause();
                  setCurrentlyPlaying(null);
                }}
              />
              <Text>
                Now playing: {currentlyPlaying.name}{" "}
                {currentlyPlaying.urlResolved}
              </Text>
              <Image
                source={{ uri: currentlyPlaying.favicon }}
                style={styles.image}
              />
            </>
          ) : (
            <IconButton
              icon="play"
              animated
              onPress={() => {
                player.play();
                setCurrentlyPlaying(stationData[0]);
              }}
            />
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    maxWidth: 1200,
    margin: 16,
  },
  image: {
    width: 40,
    height: 40,
  },
});
