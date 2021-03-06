import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";
// relevant communications imports
import { MapView } from "react-native-maps";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

// import firebase
const firebase = require("firebase");
require("firebase/firestore");

/**
 * @class CustomActions
 * @requires react
 * @requires react-native
 * @requires prop-types
 * @requires react-native-maps
 * @requires expo-permissions
 * @requires expo-image-picker
 * @requires expo-location
 * @requires firebase
 * @requires firebase/firestore
 */

export default class CustomActions extends React.Component {
  constructor() {
    super();
  }

  /**
   * action sheet for when user presses Touchable Opacity
   */

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

  /**
   * allows users to select and forward an image from their gallery
   * @function pickImage
   */

  pickImage = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    try {
      if (status === "granted") {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  /**
   * allows user to take a photo and send it
   * @function takePhoto
   */

  takePhoto = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL, Permissions.CAMERA);
    try {
      if (status === "granted") {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));
        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch {
      console.log(error.message);
    }
  };

  /**
   * get the user's current location
   * @function getLocation
   */

  getLocation = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    try {
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
    } catch {
      console.log(error.message);
    }
  };

  /**
   * uploads user's image as to firestore
   *@function uploadImage
   */

  uploadImage = async (uri) => {
    try {
      // Upload image as blob (binary large object) to firestore
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
  };

  render() {
    return (
      /**
       *TouchableOpacity brings up action sheet
       */

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
