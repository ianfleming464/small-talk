import React from "react";
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from "react-native";
import { GiftedChat, Bubble } from "react-native-gifted-chat";

// import firebase
const firebase = require("firebase");
require("firebase/firestore");

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      // initialise state with empty array for messages
      messages: [],
      uid: 0,
      loggedInText: "Please wait.. Logging in..",
    };

    // // firebase configuration info
    // const firebaseConfig = {
    //   apiKey: "AIzaSyBEecY0UoANWySp5FwDMTxrP_Qun8HwN2I",
    //   authDomain: "small-talk-7344b.firebaseapp.com",
    //   databaseURL: "https://small-talk-7344b.firebaseio.com",
    //   projectId: "small-talk-7344b",
    //   storageBucket: "small-talk-7344b.appspot.com",
    //   messagingSenderId: "240094343140",
    //   appId: "1:240094343140:web:f2c6c55c531ef7657e61f1",
    //   measurementId: "G-2FXLH8647Q",
    // };

    // initialize firebase
    if (!firebase.apps.length) {
      firebase.initializeApp({
        apiKey: "AIzaSyBEecY0UoANWySp5FwDMTxrP_Qun8HwN2I",
        authDomain: "small-talk-7344b.firebaseapp.com",
        databaseURL: "https://small-talk-7344b.firebaseio.com",
        projectId: "small-talk-7344b",
        storageBucket: "small-talk-7344b.appspot.com",
        messagingSenderId: "240094343140",
        appId: "1:240094343140:web:f2c6c55c531ef7657e61f1",
        measurementId: "G-2FXLH8647Q",
      });
    }

    // creating a reference to messages collection
    this.referenceMessages = firebase.firestore().collection("messages");
    this.referenceMessageUser = null;

    // ...end of constructor
  }
  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
      // this.setState({
      //   messages,
    });
    this.setState({
      messages,
    });
  };

  // add messages to firestore
  addMessages() {
    const message = this.state.messages[0];
    this.referenceMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: message.user,
      uid: this.state.uid,
    });
  }

  // message to empty array
  onSend(messages = []) {
    this.setState(
      (previousState) => ({
        messages: GiftedChat.append(previousState.messages, messages),
      }),
      () => {
        this.addMessages();
      }
    );
  }

  // function to retrieve user info (GiftedChat user object - see docs)
  get user() {
    return {
      name: this.props.navigation.state.params.name,
      _id: this.state.uid,
      id: this.state.uid,
    };
  }

  // LIFE CYCLE METHODS

  componentDidMount() {
    // listen to authentication events
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      }

      //update user state with currently active user data
      this.setState({
        uid: user.uid,
        loggedInText: "Wilkommen!",
      });

      // create a reference to the active user's documents (messages)
      this.referenceMessageUser = firebase.firestore().collection("messages");
      // .where("uid", "==", this.state.uid);
      // ----DOESN'T SEEM TO WORK...I think

      // listen for collection changes for current user, order so newest at bottom
      this.unsubscribeMessageUser = this.referenceMessageUser.orderBy("createdAt", "desc").onSnapshot(this.onCollectionUpdate);
    });
    this.setState({
      messages: [
        {
          _id: 2,
          text: this.props.navigation.state.params.name + " entered the chat",
          createdAt: new Date(),
          system: true,
        },
      ],
    });
  }

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeMessageUser();
  }

  // add user's name to navbar
  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.name,
    };
  };

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
      <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color }}>
        <Text style={styles.userHi}>{this.state.loggedInText}</Text>

        <GiftedChat
          renderBubble={this.renderBubble.bind(this)}
          messages={this.state.messages}
          onSend={(messages) => this.onSend(messages)}
          user={this.state.user}
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
    width: "100%",
    alignItems: "center",
  },
  userHi: {
    fontSize: 12,
    color: "#fff",
    alignSelf: "center",
    opacity: 0.5,
    marginTop: 25,
  },
});
