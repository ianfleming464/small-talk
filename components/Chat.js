import React from "react";
import { StyleSheet, View, Platform, KeyboardAvoidingView } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";

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
      // hard-coded messages for testing purposes
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

        // System message to inform user they have successfully entered chat
        {
          _id: 2,
          // Template literal to add user name from state
          text: `${this.props.navigation.state.params.name} has entered the chat`,
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

  // function to change color of user speech bubble
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#292929",
          },
        }}
      />
    );
  }

  render() {
    return (
      <View style={[styles.container, { backgroundColor: this.props.navigation.state.params.color }]}>
        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
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

// Style sheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // default color if none selected on start screen, overridden by above code color selected.
    backgroundColor: "#fff",
    justifyContent: "center",
  },
});
