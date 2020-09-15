import React from "react";
import { StyleSheet, View, Platform, KeyboardAvoidingView, Navigator } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      // initialise state with empty array for messages
      messages: [],
    };
  }

  // add user's name to navbar
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.name,
    };
  };

  componentDidMount() {
    this.setState({
      // hard-coded message for testing purposes
      messages: [
        {
          _id: 1,
          text: "Hello developer",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "React Native",
            avatar: "https://placeimg.com/140/140/any",
          },
        },
        {
          _id: 2,
          text: "Gemma enetered the chat",
          createdAt: new Date(),
          system: true,
        },
      ],
    });
  }

  // function to display messages by appending new messages to the state, hence displaying them
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: this.props.navigation.state.params.color }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
        />
        {Platform.OS === "android" ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    );
  }
}
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     // default color if none selected on start screen, overridden by above code color selected.
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
