import { useRadioBrowserApi } from "@/src/context/RadioBrowserApiContext";
import { getStationIds } from "@/src/hooks/getStationIds";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useFocusEffect } from "expo-router";
import { type Station } from "radio-browser-api";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

// This page should:
// - Get the saved station ids from AsyncStorage
// - Pull station data from the station data API (name, image, etc.) radio-browser
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

  useFocusEffect(
    useCallback(() => {
      const fetchStationIds = async () => {
        const parsedStationIds = await getStationIds();
        setStationIds(parsedStationIds);
      };
      const fetchStationData = async () => {
        const data = await radioBrowserApi.getStationsById(stationIds);
        setStationData(data);
      };

      fetchStationIds();
      fetchStationData();
    }, [stationIds, stationData])
  );

  const player = useAudioPlayer(stationData[0]?.urlResolved);

  const playerStatus = useAudioPlayerStatus(player);

  return (
    <View
      style={{
        flex: 1,
        margin: 16,
      }}
    >
      {stationData.map((station) => (
        <Text key={station.id}>{station.name}</Text>
      ))}
      <Card>
        <Card.Title title="Start Playing" />
        <Card.Content>
          {playerStatus.playing ? (
            <>
              <IconButton
                icon="pause"
                animated
                onPress={() => player.pause()}
              />
              <Text>
                Now playing: {stationData[0].name} {stationData[0].urlResolved}
              </Text>
            </>
          ) : (
            <IconButton icon="play" animated onPress={() => player.play()} />
          )}
        </Card.Content>
      </Card>
    </View>
  );
}
