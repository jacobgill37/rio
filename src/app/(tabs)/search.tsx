import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Searchbar } from "react-native-paper";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <View>
      <Searchbar
        placeholder="Search"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={{ margin: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default Search;
