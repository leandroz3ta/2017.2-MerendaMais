import axios from 'axios';
import Communications from 'react-native-communications';
import { Actions } from 'react-native-router-flux';
import { Alert } from 'react-native';
import { logInfo, logWarn } from '../../logConfig/loggers';
import { convertingJSONToString } from './counselorActions';
import { APP_IDENTIFIER, POSTS_LINK_NUVEM_CIVICA, POSTING_TYPE_CODE, SEND_EMAIL_ALERT_TITLE, SEND_EMAIL_ALERT_BODY } from '../constants';

const FILE_NAME = 'SchedulingActions.js';

// Treating request errors
const treatingPostsError = (error) => {
  if (error.response.status === 401) {
    logWarn(FILE_NAME, 'treatingPostsError',
      `Unauthorized according to the Nuvem - Error code received in request - ${error.response.status}`);
  } else if (error.response.status === 403) {
    logWarn(FILE_NAME, 'treatingPostsError',
      `Forbidden according to the Nuvem - Error code received in request - ${error.response.status}`);
  } else if (error.response.status === 404) {
    logWarn(FILE_NAME, 'treatingPostsError',
      `Not Found according to the Nuvem - Error code received in request - ${error.response.status}`);
  } else {
    logWarn(FILE_NAME, 'treatingPostsError',
      `Unknown error - Error code received in request - ${error.response.status}`);
  }
};


/*const sendEmailAlert = (
  Alert.alert(
    SEND_EMAIL_ALERT_TITLE,
    SEND_EMAIL_ALERT_BODY,
    [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim',
        onPress: () => Communications.email(
          // To, cc, bcc, subject, email text
          ['email1@email.com', 'emailN@email.com'],
          null,
          null,
          'Subject',
          'Email Body text'),
      },
    ],
    { cancelable: false }),
  Actions.mainScreen()
);
*/

const schedulingVisit = (visitData) => {
  const headerToSchedulingVisit = {
    headers: {
      appIdentifier: APP_IDENTIFIER,
      appToken: visitData.appToken,
    },
  };

  const stringVisit = convertingJSONToString(visitData.visit);

  const bodyToSchedulingVisit = {
    conteudo: {
      JSON: stringVisit,
      texto: 'Agendamento',
    },
    postagem: {
      autor: {
        codPessoa: visitData.nuvemCode,
      },
      tipo: {
        codTipoPostagem: POSTING_TYPE_CODE,
      },
    },
  };

  axios.post(POSTS_LINK_NUVEM_CIVICA, bodyToSchedulingVisit, headerToSchedulingVisit)
    .then((response) => {
      logInfo(FILE_NAME, 'schedulingVisit',
        `Scheduling made in Nuvem cívica: ${JSON.stringify(response.data, null, 2)}`);
      // sendEmailAlert();
    })
    .catch((error) => {
      logWarn(FILE_NAME, 'schedulingVisit',
        `Request result in an ${error}`);

      treatingPostsError(error);
    });
};

const asyncSchedulingVisit = visitData => () => {
  logInfo(FILE_NAME, 'asyncSchedulingVisit',
    `Scheduling visit data: ${JSON.stringify(visitData, null, 2)}`);

  schedulingVisit(visitData);
};

export default asyncSchedulingVisit;
