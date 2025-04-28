// import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { View } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

export default function Index() {
  const player = useAudioPlayer(
    "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service"
  );

  // This page should:
  // - Get the saved station ids from AsyncStorage
  // - Pull station data from the station data API (name, image, etc.) radio-browser
  // - Store data in cache to prevent unnecessary API calls
  // - Allow the user to pause and play the station and switch to the next one
  // - Call to AI API to get the station id to play (will need to get API key from AsyncStorage)
  // - Get stream url from station data cache
  // - Get "Now Playing" info from station data API
  // - Play the station

  const playerStatus = useAudioPlayerStatus(player);

  return (
    <View
      style={{
        flex: 1,
        margin: 16,
      }}
    >
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
              <Text>Now playing: </Text>
            </>
          ) : (
            <IconButton icon="play" animated onPress={() => player.play()} />
          )}
        </Card.Content>
      </Card>
    </View>
  );
}
