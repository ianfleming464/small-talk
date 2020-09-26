import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  ImageBackground,
  TouchableHighlight,
  TouchableOpacity,
  Platform,
} from "react-native";

// Opening screen (Start)
export default class Start extends React.Component {
  constructor(props) {
    super(props);
    // initialise state with name, color
    this.state = { name: "", color: "" };
  }

  render() {
    // array with color options to switch between
    const colorOptions = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

    return (
      <View style={styles.container}>
        <ImageBackground source={require("../assets/background-image.png")} style={styles.backgroundImage}>
          {/* App title */}
          <Text style={styles.title}>Small Talk</Text>

          {/* Container for input etc. */}
          <View style={styles.infoHolder}>
            {/* Enter your name */}
            <TextInput
              style={styles.input}
              // Set state to whatver is typed into input
              onChangeText={(name) => this.setState({ name })}
              value={this.state.name}
              placeholder="Your Name"
            />
            <View style={styles.textPromptBox}>
              <Text style={styles.colorPrompt}>Choose a Background Color:</Text>
            </View>
            <View style={styles.colorContainer}>
              {/* 4 choosable color options for chat screenbackground */}
              <TouchableOpacity
                onPress={() => this.setState({ color: colorOptions[0] })}
                style={[styles.colorSelector, { backgroundColor: colorOptions[0] }]}
              />
              <TouchableOpacity
                onPress={() => this.setState({ color: colorOptions[1] })}
                style={[styles.colorSelector, { backgroundColor: colorOptions[1] }]}
              />
              <TouchableOpacity
                onPress={() => this.setState({ color: colorOptions[2] })}
                style={[styles.colorSelector, { backgroundColor: colorOptions[2] }]}
              />
              <TouchableOpacity
                onPress={() => this.setState({ color: colorOptions[3] })}
                style={[styles.colorSelector, { backgroundColor: colorOptions[3] }]}
              />
            </View>

            {/* Button to navigate to chat screen */}
            <TouchableHighlight
              style={styles.button}
              onPress={() => this.props.navigation.navigate("Chat", { name: this.state.name, color: this.state.color })}
            >
              <Text style={styles.buttonText}>Start Chatting</Text>
            </TouchableHighlight>
          </View>
        </ImageBackground>
        {Platform.OS === "android" ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    );
  }
}

// Style sheet as per design brief
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    flex: 1,
    color: "#fff",
    fontSize: 62,
    fontWeight: "600",
    marginTop: 44,
    alignSelf: "center",
  },
  infoHolder: {
    // flex: 1,
    opacity: 0.9,
    width: "88%",
    height: "44%",
    backgroundColor: "#fff",
    marginBottom: 90,
    borderRadius: 3,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
  },
  input: {
    fontSize: 18,
    fontWeight: "300",
    borderWidth: 1,
    borderColor: "#757083",
    borderRadius: 5,
    width: "88%",
    height: 36,
    paddingHorizontal: 10,
    marginTop: 15,
  },
  textPromptBox: {
    alignSelf: "flex-start",
    flex: 1,
    width: "88%",
    paddingLeft: 24,
    paddingBottom: "2%",
    color: "black",
  },
  colorPrompt: {
    marginTop: 18,
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 100,
  },
  colorContainer: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "flex-start",
    width: "80%",
    justifyContent: "space-around",
    paddingLeft: 16,
    marginTop: "10%",
  },
  colorSelector: {
    position: "relative",
    height: 40,
    width: 40,
    borderRadius: 50,
    margin: 2,
    borderColor: "white",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#757083",
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 60,
    marginBottom: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
