import React, { Component } from "react";
import { StyleSheet, View, Text, Platform, KeyboardAvoidingView } from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import CustomActions from "./CustomActions";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";

// import firebase
const firebase = require("firebase");
require("firebase/firestore");
/**
 * @class Chat
 * @requires react
 * @requires react-native
 * @requires react-native-gifted-chat
 * @requires react-native-community/async-storage
 * @requires react-native-community/netinfo
 * @requires CustomActions from './CustomActions'
 * @requires expo-permissions
 * @requires expo-image-picker
 * @requires expo-location
 * @requires react-native-maps
 * @requires firebase
 * @requires firestore
 */

// Chat screen
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
      image: null,
      location: null,
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

  /**
   * updates the state - when the firestore collection
   * is called, this function is called
   * @function onCollectionUpdate
   * @param {string} _id - message id
   * @param {string} text - message text
   * @param {date} createdAt - date and time sent
   * @param {object} user - user data
   * @param {string} image - image sent
   * @param {location} location - current user location
   */

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the data
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
        image: data.image || "",
        location: data.location || null,
      });
    });
    this.setState({
      messages,
    });
  };

  /**
   * Adds message to firestore reference database
   * @function addMessages
   * @param {string} _id - message id
   * @param {sting} text - message text
   * @param {date} createdAt - date and time of message
   * @param {object} user - user data
   * @param {string} uid - user id
   * @param {string} image - image
   * @param {location} location - current user location
   * adds all data to firestore
   */

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
      image: message.image || "",
      location: message.location || null,
    });
  }

  /**
   * Sends messages
   * @async
   * @function onSend
   * @param {string} messages - message content
   * @return {state} GiftedChat
   */

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

  /**
   * sets default data for a user if none is provided
   * @function setUser
   * @param {string} _id - default user id
   * @param {string} name - default name
   * @param {string} avatar - default avatar
   */

  setUser = (_id, name = "Guest", avatar = "https://placeimg.com/140/140/any") => {
    this.setState({
      user: {
        _id: _id,
        name: name,
        avatar: avatar,
      },
    });
  };

  // LIFE CYCLE METHODS

  /**
   * NetInfo checks if user is online, sets state accordingly and functions in either on- or
   * offline mode
   * firebase uses anonymous authentication
   * subscribes authenticated user to firestore collection
   * retrieves messages in firestore
   */

  componentDidMount() {
    // check connection status and log info (from NetInfo docs)
    NetInfo.fetch().then((state) => {
      console.log("Connection type : ", state.type);
      console.log("Connected? : ", state.isConnected);
    });

    NetInfo.fetch().then((state) => {
      if (state.isConnected) {
        this.setState({ isConnected: true });
        // listen to authentication events
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            try {
              await firebase.auth().signInAnonymously();
            } catch (error) {
              console.log(`Unable to sign in: ${error.message}`);
            }
          }
          if (!this.props.navigation.state.params.name) {
            this.setUser(user.uid);
            this.setState({
              uid: user.uid,
              loggedInText: "Willkommen",
            });
          } else {
            this.setUser(user.uid, this.props.navigation.state.params.name, user.avatar);
            this.setState({
              uid: user.uid,
              loggedInText: `Willkommen ${this.props.navigation.state.params.name}`,
            });
          }

          // create a reference to the active user's documents (messages)
          this.referenceMessageUser = firebase.firestore().collection("messages");

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

  // asynchronous functions :

  /**
   * loads all messages from AsyncStorage
   * @async
   * @function getMessages
   * @param {string} messages - obtains messages saved to local storage
   * @return {state} - returns messages from storage
   */

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

  /**
   * Saves messages to AsyncStorage
   * @async
   * @function saveMessages
   * @param {string} messages - saves messages to local storage
   * @return {AsyncStorage}
   */

  saveMessages = async () => {
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * deletes messages from AsyncStorage ---
   *  note: for development purposes - not currently used in app!
   * @async
   * @function deleteMessages
   * @param {string} messages - locally saved messages
   * @return {AsyncStorage} - the data will deleted from storage
   */

  deleteMessages = async () => {
    try {
      await AsyncStorage.removeItem("messages");
    } catch (error) {
      console.log(error.message);
    }
  };

  // Gifted Chat functions:

  /**
   * sets the background colour of user speech bubble
   * @function renderBubble
   */

  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#292929",
          },
          left: {
            backgroundColor: "#dcdfe3",
          },
        }}
      />
    );
  }

  /**
   *render input toolbar only when online
   *@function renderInputToolbar
   */

  renderInputToolbar(props) {
    if (this.state.isConnected === false) {
    } else {
      return <InputToolbar {...props} />;
    }
  }

  /**
   * renders CustomActions component (ActionSheet and aassociated linked communications functions)
   * @function renderCustomActions
   * @returns {CustomActions}
   */

  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  /**
   * renders map view for sending / receiving location details
   * @function renderCustomView
   * @returns {MapView}
   */

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    /**
     * uses the name and background colour as selected on start screen
     */
    return (
      <View style={{ flex: 1, backgroundColor: this.props.navigation.state.params.color }}>
        <Text style={styles.userHi}>{this.state.loggedInText}</Text>

        <GiftedChat
          renderBubble={this.renderBubble}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
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
