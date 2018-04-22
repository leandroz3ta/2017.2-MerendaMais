import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import stylesList from '../../Styles/ListStyles';
import ScheduleCard from '../../components/ScheduleCard';
import Button from '../../components/Button';

const styles = StyleSheet.create({
  principal: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 6,
    backgroundColor: 'white',
  }
});

buttonBox = StyleSheet.create({
  design: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 7,
    backgroundColor: '#DEDEDE',
    padding: 8,
    justifyContent: 'center',
    marginRight: 13,
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
  },
});

class StartExpiredInspection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  arrayScheduleList() {
    if (this.props.isLoading) {
      return (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#FF9500" />
      );
    } else if (this.props.listOfExpiredScheduleInAGroup.length === 0) {
      return (
        <View style={stylesList.noneScheduleTextBox}>
          <Text style={stylesList.noneScheduleText}>Nenhum Agendamento Expirado!</Text>
        </View>
      );
    }
    return (
      this.props.listOfExpiredScheduleInAGroup.map(visitSchedule => (
        <ScheduleCard
        visitSchedule={visitSchedule}
        counselor={this.props.counselor}
        data={this.getVisitData(visitSchedule)}
        keyProp={`EX${visitSchedule.codPostagem}`}
      >
        <View style={{ flex: 2 }}>
        <Button
          style={buttonBox}
          enabled={false}
          text="EXPIRADO"
          onPress={()=>{}}
        />
        </View>
      </ScheduleCard>
      ))
    );
  }
  
  verifyAgentInvited(visitSchedule) {
    if(visitSchedule.content.invitedAgent) { 
      return "Um agente foi convidado";
    }else {
      return "Agente não convidado";
    }
  }

  getVisitData(visitSchedule) {
    let data = [
      {
        label: 'Escola:',
        value: visitSchedule.content.schoolName
      },
      {
        label: 'Data:',
        value: visitSchedule.content.date
      },
      {
        label: 'Horário:',
        value: visitSchedule.content.time
      },
      {
        label: this.verifyAgentInvited(visitSchedule),
        value: ''
      },
      {
        label: 'Número de participantes:',
        value: Object.keys(visitSchedule.content.visitListOfInvitees).length,
      },
    ];
    return data;
  }

  render() {
    return (
      <View style={styles.principal}>
        <ScrollView style={styles.content}>
          {this.arrayScheduleList()}
        </ScrollView>
      </View>
    );
  }
}

StartExpiredInspection.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  listOfExpiredScheduleInAGroup: PropTypes.arrayOf(PropTypes.shape({
    codSchool: PropTypes.number,
    date: PropTypes.string,
    time: PropTypes.string,
  })).isRequired,
};

export default StartExpiredInspection;
