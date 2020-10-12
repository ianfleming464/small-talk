import React, { Component } from "react";
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";

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
      // initialising a user object in the state
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      isConnected: false,
    };

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
    });
    this.setState({
      messages,
    });
  };

  // add messages to firestore
  addMessages() {
    // logging the user object for debugging purposes
    console.log(this.state.user);

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
        this.saveMessages();
      }
    );
  }

  // LIFE CYCLE METHODS

  componentDidMount() {
    // this.getMessages();
    // check connection status and log info (from NetInfo docs)
    NetInfo.fetch().then((state) => {
      console.log("Connection type : ", state.type);
      console.log("Connected? : ", state.isConnected);
    });

    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        this.setState({ isConnected: true });
        // listen to authentication events - added try / catch block and template literal..because why not.
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            try {
              await firebase.auth().signInAnonymously();
            } catch (error) {
              console.log(`Unable to sign in: ${error.message}`);
            }
          }

          //update user state with currently active user data
          this.setState({
            uid: user.uid,
            user: {
              _id: user.uid,
              name: this.props.navigation.state.params.name,
              avatar: "",
            },
            loggedInText: "Wilkommen!",
          });
          // create a reference to the active user's documents (messages)
          this.referenceMessageUser = firebase.firestore().collection("messages");

          // .where("uid", "==", this.state.uid);
          // ----DOESN'T SEEM TO WORK...I think. This breaks the ability to have 2 users and removes avatar----

          // listen for collection changes for current user, order so newest at bottom
          this.unsubscribeMessageUser = this.referenceMessageUser
            .orderBy("createdAt", "desc")
            .onSnapshot(this.onCollectionUpdate);
        });
      } else {
        console.log("offline");
        this.setState({
          isConnected: false,
          loggedInText: "Offline mode enabled",
        });
        this.getMessages();
      }
    });
  }

  componentWillUnmount() {
    // using the && operator to eliminate 'not a function' error
    // stop listening to authentication
    this.authUnsubscribe && this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeMessageUser && this.unsubscribeMessageUser();
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

  // Asynchronous functions :
  //Loads messages from AsyncStorage
  getMessages = async () => {
    let messages = "";
    try {
      messages = (await AsyncStorage.getItem("messages")) || [];
      this.setState({
        messages: JSON.parse(messages),
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //Saves messages to AsyncStorage
  saveMessages = async () => {
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  };

  //Deletes messages from AsyncStorage - for development purposes
  // deleteMessages = async () => {
  //   try {
  //     await AsyncStorage.removeItem("messages");
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };

  //Render input toolbar only when online
  renderInputToolbar(props) {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color }}>
        <Text style={styles.userHi}>{this.state.loggedInText}</Text>

        <GiftedChat
          renderBubble={this.renderBubble}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
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
