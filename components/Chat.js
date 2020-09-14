import React from "react";
import { StyleSheet, Text, View, Button, Navigator } from "react-native";

export default class Chat extends React.Component {
  // add user's name to navbar
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.name,
    };
  };
  render() {
    // use chosen background color
    return <View style={[styles.container, { backgroundColor: this.props.navigation.state.params.color }]}></View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
