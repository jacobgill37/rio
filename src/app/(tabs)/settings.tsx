import { StyleSheet, View } from "react-native";
import { List } from "react-native-paper";

const Settings = () => {
  return (
    <View>
      <List.Section>
        <List.Item
          title="Item 1"
          description="Item 1 description"
          left={(props) => <List.Icon {...props} icon="cog" />}
        />
        <List.Item
          title="Item 2"
          description="Item 2 description"
          left={(props) => <List.Icon {...props} icon="folder" />}
        />
        <List.Item
          title="Item 3"
          description="Item 3 description"
          left={(props) => <List.Icon {...props} icon="folder" />}
        />
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Settings;
