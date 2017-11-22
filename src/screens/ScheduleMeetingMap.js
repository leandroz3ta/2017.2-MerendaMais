import React from 'react';
import PropTypes from 'prop-types';
import { MapView } from 'expo';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import PopupDialog, {
  DialogTitle,
  DialogButton,
} from 'react-native-popup-dialog';
import Header from '../components/Header';

const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  principal: {
    flex: 1,
    backgroundColor: 'white',
  },
  button: {
    paddingVertical: 15,
    borderWidth: 3,
    borderRadius: 7,
    marginBottom: 1,
    backgroundColor: '#FF9500',
    justifyContent: 'flex-end',
  },
  buttonText: {
    textAlign: 'center',
    color: '#FFF',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 5,
    paddingTop: 10,
    paddingLeft: 10,
    height: height * 0.06,
    fontSize: width * 0.05,
    textAlignVertical: 'top',
  },
  textBox: {
    margin: 1.5,
    paddingLeft: 2,
    justifyContent: 'flex-start',
  },
  text: {
    fontSize: 15,
    paddingVertical: 3,
  },
  dialogButtonStyle: {
    marginVertical: -16,
  },

  footerPopUp: {
    backgroundColor: '#F9F9FB',
    borderColor: '#DAD9DC',
    borderTopWidth: 0.5,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

});


export default class ScheduleMeetingMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      meetingLocation: {},
      userLocation: {
        latitude: 0.0,
        longitude: 0.0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      region: {},
      error: null,
    };
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          userLocation: { ...this.state.userLocation, latitude: position.coords.latitude } });
        this.setState({
          userLocation: { ...this.state.userLocation, longitude: position.coords.longitude } });
        this.setState({ region: this.state.userLocation });
        this.setState({ meetingLocation: this.state.userLocation });
        this.showPopUp();
      },
      error => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  showPopUp() {
    this.popupMapsInstruction.show();
  }

  concludeMeetingLocation() {
    this.props.setMeetingLocationLatitude(this.state.meetingLocation.latitude);
    this.props.setMeetingLocationLongitude(this.state.meetingLocation.longitude);
    console.log('A Lat Long que eu to passando');
    console.log(this.state.meetingLocation.latitude);
    console.log(this.state.meetingLocation.longitude);
    Actions.pop();
  }

  render() {
    console.log('A Lat Long da store');
    console.log(this.props.schedule);
    return (
      <View style={styles.principal}>
        <Header
          title={'AGENDAR REUNIÃO'}
          subTitle={'ESCOLHA O LOCAL'}
          backButton
        />

        <PopupDialog
          ref={(popupMapsInstruction) => {
            this.popupMapsInstruction = popupMapsInstruction;
          }}
          dialogTitle={<DialogTitle title="Escolhendo local para Reunião" />}
          overlayPointerEvents="none"
          height="30%"
          width="85%"
        >
          <Text style={styles.text}> Para escolher o local da Reunião, segure e arraste
          o marcador até o local desejado. Ele começará em sua posição atual.
          É possível dar ou retirar zoom conforme o desejado.</Text>
          <View style={styles.footerPopUp}>
            <DialogButton
              buttonStyle={styles.dialogButtonStyle}
              text="Ok"
              onPress={() => this.popupMapsInstruction.dismiss()}
              key="dialogButton1"
            />
          </View>
        </PopupDialog>
        <MapView
          provider={MapView.PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={this.state.region}
          onRegionChange={region => this.setState({ region })}
        >
          <MapView.Marker
            coordinate={this.state.userLocation}
            draggable
            pinColor="orange"
            onDragEnd={e => this.setState({ meetingLocation: e.nativeEvent.coordinate })}
          />
        </MapView>
        <TouchableOpacity
          key="setMeetingLocationButton"
          style={styles.button}
          onPress={() => this.concludeMeetingLocation()}
        >
          <Text style={styles.buttonText}>Definir Local da Reunião</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const { func, number, shape } = PropTypes;

ScheduleMeetingMap.propTypes = {
  setMeetingLocationLongitude: func.isRequired,
  setMeetingLocationLatitude: func.isRequired,
  schedule: shape({
    meetingLatitude: number.isRequired,
    meetingLongitude: number.isRequired,
  }).isRequired,
};
