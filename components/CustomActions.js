import PropTypes from "prop-types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// relevant communications imports
import { MapView } from "react-native-maps";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

// import firebase
const firebase = require("firebase");
require("firebase/firestore");

export default class CustomActions extends React.Component {
  constructor() {
    super();
  }

  // how the ActionSheet reacts
  onActionPress = () => {
    const options = ["Choose From Library", "Take Picture", "Send Location", "Cancel"];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            // links pickImage function to ActionSheet selection
            return this.pickImage();
          case 1:
            // links takePhoto function to ActionSheet selection
            return this.takePhoto();
          case 2:
            // links getLocation function to ActionSheet selection
            return this.getLocation();
          default:
        }
      }
    );
  };

  // function to select image from user's gallery
  pickImage = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status === "granted") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      }).catch((error) => console.log(error));

      if (!result.cancelled) {
        const imageUrl = await this.uploadImage(result.uri);
        this.props.onSend({ image: imageUrl });
      }
    }
  };

  // function to take photo
  takePhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
    if (status === "granted") {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      }).catch((error) => console.log(error));
      if (!result.cancelled) {
        const imageUrl = await this.uploadImage(result.uri);
        this.props.onSend({ image: imageUrl });
      }
    }
  };

  // function to get user's location
  getLocation = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status === "granted") {
      let result = await Location.getCurrentPositionAsync({}).catch((error) => console.log(error));
      const longitude = JSON.stringify(result.coords.longitude);
      const latitude = JSON.stringify(result.coords.latitude);
      if (result) {
        this.props.onSend({
          location: {
            longitude: result.coords.longitude,
            latitude: result.coords.latitude,
          },
        });
      }
    }
  };

  // Upload image as blob (binary large object) to firestore
  async uploadImage(uri) {
    try {
      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          resolve(xhr.response);
        };
        xhr.onerror = (error) => {
          console.error(error);
          reject(new TypeError("Network Request Failed!"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });
      const getImageName = uri.split("/");
      const imageArrayLength = getImageName[getImageName.length - 1];
      const ref = firebase.storage().ref().child(`images/${imageArrayLength}`);
      const snapshot = await ref.put(blob);
      blob.close();
      const imageURL = await snapshot.ref.getDownloadURL();
      return imageURL;
    } catch (error) {
      console.log(error.message);
    }
  }

  render() {
    return (
      <TouchableOpacity
        // ActionSheet button is now accessible as per the docs
        accessible={true}
        accessibilityLabel="Tap me"
        accessibilityHint="Select whether to pick an image from your gallery, take a photo, send your location, or cancel request"
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};
