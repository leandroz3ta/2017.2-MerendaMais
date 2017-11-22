import { connect } from 'react-redux';
import ScheduleMeetingMap from '../screens/ScheduleMeetingMap';
import { setMeetingLocationLatitude, setMeetingLocationLongitude } from '../actions/schedulingActions';


const mapStateToProps = state => ({
  schedule: state.schedule,
});

const mapDispatchToProps = dispatch => ({
  setMeetingLocationLatitude: latitude =>
    dispatch(setMeetingLocationLatitude(latitude)),
  setMeetingLocationLongitude: longitude =>
    dispatch(setMeetingLocationLongitude(longitude)),
});


const ScheduleMeetingMapContainer =
connect(mapStateToProps, mapDispatchToProps)(ScheduleMeetingMap);

export default ScheduleMeetingMapContainer;
