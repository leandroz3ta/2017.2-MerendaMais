import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet,
  TouchableOpacity,
  Text,
  View,
  ScrollView,
  Dimensions,
  BackHandler,
  Alert,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Actions } from 'react-native-router-flux';
import { logInfo, logWarn } from '../../../logConfig/loggers';
import ShowToast from '../../components/Toast';
import { POSTS_LINK_NUVEM_CIVICA,
  APP_IDENTIFIER,
  INSPECTION_POSTING_TYPE_CODE,
  FINISH_INSPECTION,
  LEAVING_INSPECTION,
  INTERNAL_ERROR,
  UNAUDITED,
  YES,
  NO } from '../../constants/generalConstants';
import { convertingJSONToString } from '../../actions/counselorActions';
import { errorGenerator } from '../../actions/schedulingVisitActions';
import Header from '../../components/Header';
import ButtonWithActivityIndicator from '../../components/ButtonWithActivityIndicator';

const { width } = Dimensions.get('window');

const FILE_NAME = 'MainReportsScreen.js';

const styles = StyleSheet.create({

  buttonContainer: {
    paddingVertical: 15,
    borderWidth: 1,
    borderRadius: 7,
    marginHorizontal: 15,
    marginVertical: 13,
    backgroundColor: '#FF9500',
    justifyContent: 'flex-end',
  },

  buttonText: {
    textAlign: 'center',
    color: '#FFF',
  },

  content: {
    backgroundColor: 'white',
    flex: 1,
  },

  text: {
    flex: 1,
    width: width * 0.7,
    paddingLeft: 10,
    color: 'blue',
    fontSize: 20,
  },

  statusView: {
    flexDirection: 'row',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  loading: {
    marginTop: 15,
    marginBottom: 25,
  },
});

// Component to each clickable text that goes to checklists.
const GoToChecklistClickableText = props => (
  <View style={styles.statusView}>
    <TouchableOpacity
      onPress={() => props.onPress()}
      key={props.goToChecklistKey}
    >
      <Text style={styles.text}>{props.goToChecklistText}</Text>
    </TouchableOpacity>

    <View>
      {props.isCompleted ? (
        <MaterialIcons
          name="check"
          size={28}
          style={{ paddingRight: 23 }}
          color="green"
        />
      ) : (<Text />)
      }
    </View>
  </View>
);

// Used to return a readable response for the questions.
const getResponseOfQuestion = (item) => {
  // Verify if the item was marked to return if the check was Yes or No.
  if (item.status) {
    if (item.markedYes) {
      return YES;
    } else if (item.markedNo) {
      return NO;
    }
  }

  // If the item wasn't marked it means that it was unaudited.
  return UNAUDITED;
};

/* Used to return the inspection result for default inspection results in JSON formart for
Nuvem. The default format is: Array of question itens in JSON format, a Observation Text
and a status tha indicate if it was concluded. */
const mountDefaultJsonOfInspectionResult = (
  defaultChecklist,
  defaultTextObservation,
  defaultConcludedStatus) => {
  const defaultContentJSON = {
    binaryQuestions: {},
    textObservation: defaultTextObservation,
    wasConcluded: defaultConcludedStatus,
  };

  defaultChecklist.forEach((item) => {
    defaultContentJSON.binaryQuestions[item.question] =
      {
        question: item.question,
        answer: getResponseOfQuestion(item),
      };
  });

  return defaultContentJSON;
};

export default class MainReportsScreen extends React.Component {
  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => Actions.StartPendingInspection());
  }

  async addContentsOnInspectionPostInNuvem(codPostagem, contentsListOfInspectionResults) {
    // Header to create a new content in inpection post.
    const headerToInspectionContent = {
      headers: {
        appToken: this.props.counselor.token,
      },
    };

    // Used to await all promises return after proceed with the function.
    const allLinksOfContents = [];

    try {
      contentsListOfInspectionResults.forEach((content) => {
        // Body to create a new content in inpection post.
        const bodyToInspectionContent = {
          JSON: convertingJSONToString(content),
          texto: 'Nome da Lista de Verificação',
        };

        console.log(bodyToInspectionContent.JSON);

        const response = axios.post(`${POSTS_LINK_NUVEM_CIVICA}${codPostagem}/conteudos`,
          bodyToInspectionContent,
          headerToInspectionContent);

        allLinksOfContents.push(response.headers.location);

        logInfo(FILE_NAME, 'addContentsOnInspectionPostInNuvem', `${JSON.stringify(response.data)}`);
      });

      await Promise.all(allLinksOfContents);
    } catch (error) {
      logWarn(FILE_NAME, 'addContentsOnInspectionPostInNuvem', `Request result in an ${error}`);

      throw errorGenerator('addContentsOnInspectionPostInNuvem', error.response.status);
    }
  }

  generateContentsListOfInspectionResults() {
    const contentsListOfInspectionResults = [];

    // Used to mount the JSON result to school surroundings inspection.
    const resultOfSchoolSurroundingsInspection =
      mountDefaultJsonOfInspectionResult(
        this.props.report.schoolSurroundings,
        this.props.report.schoolSurroundingsObservation,
        this.props.report.statusSchoolSurroundings,
      );

    // Put the school surroundings JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfSchoolSurroundingsInspection);

    // Used to mount the JSON result to Food Stock inspection.
    const resultOfFoodStock =
      mountDefaultJsonOfInspectionResult(
        this.props.report.foodStock,
        this.props.report.foodStockObservation,
        this.props.report.statusFoodStock,
      );

    // Put the Food Stock JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfFoodStock);

    // Used to mount the JSON result to Documentation inspection.
    const resultOfDocumentation =
      mountDefaultJsonOfInspectionResult(
        this.props.report.doc,
        this.props.report.docObservation,
        this.props.report.statusDoc,
      );

    // Put the Documentation JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfDocumentation);

    // Used to mount the JSON result to Food Quality inspection.
    const resultOfFoodQuality =
      mountDefaultJsonOfInspectionResult(
        this.props.report.foodQuality,
        this.props.report.foodQualityObservation,
        this.props.report.statusFoodQuality,
      );

    // Adding additional information in this inspection result that isn't in a default form.
    resultOfFoodQuality.additionalData = {
      acceptedMenu: this.props.report.acceptedMenu,
      refusedMenu: this.props.report.refusedMenu,
    };

    // Put the Food Quality JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfFoodQuality);

    // Used to mount the JSON result to Food Handler inspection.
    const resultOfFoodHandler =
      mountDefaultJsonOfInspectionResult(
        this.props.report.foodHandler,
        this.props.report.foodHandlerObservation,
        this.props.report.statusFoodHandler,
      );

    // Put the Food Handler JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfFoodHandler);

    // Used to mount the JSON result to refectory inspection.
    const resultOfRefectory =
      mountDefaultJsonOfInspectionResult(
        this.props.report.refectory,
        this.props.report.refectoryObservation,
        this.props.report.statusRefectory,
      );

    // Put the refectory JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfRefectory);

    // Used to mount the JSON result to water Sewer Supply inspection.
    const resultOfWaterSewerSupply =
      mountDefaultJsonOfInspectionResult(
        this.props.report.waterSewerSupply,
        this.props.report.waterSewerSupplyObservation,
        this.props.report.statuSwaterSewerSupply,
      );

    // Put the water Sewer Supply JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfWaterSewerSupply);

    // Used to mount the JSON result to kitchen inspection.
    const resultOfKitchen =
      mountDefaultJsonOfInspectionResult(
        this.props.report.kitchen,
        this.props.report.kitchenObservation,
        this.props.report.statusKitchen,
      );

    // Put the kitchen JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfKitchen);

    // Used to mount the JSON result to food Preparation inspection.
    const resultOfFoodPreparation =
      mountDefaultJsonOfInspectionResult(
        this.props.report.foodPreparation,
        this.props.report.foodPreparationObservation,
        this.props.report.statusFoodPreparation,
      );

    // Put the food Preparation JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfFoodPreparation);

    // Mounting the JSON result to other Observations of inspection. That one isn't in default form.
    const resultOfOtherObservation = {
      textObservation: this.props.report.otherObservation,
      wasConcluded: this.props.report.statusReportObservation,
    };

    // Put the other Observations JSON result in the contents array that will be send to Nuvem.
    contentsListOfInspectionResults.push(resultOfOtherObservation);

    return contentsListOfInspectionResults;
  }

  async createInspectionPostInNuvem() {
    // Header to create a new inpection post.
    const headerToInspection = {
      headers: {
        appIdentifier: APP_IDENTIFIER,
        appToken: this.props.counselor.token,
      },
    };

    // Body to create a new inpection post.
    const bodyToInspection = {
      autor: {
        codPessoa: this.props.counselor.nuvemCode,
      },
      codGrupoDestino: this.props.counselor.codGrupoDestino,
      postagemRelacionada: {
        codPostagem: this.props.scheduleVisit.currentVisit.codPostagem,
      },
      tipo: {
        codTipoPostagem: INSPECTION_POSTING_TYPE_CODE,
      },
    };

    try {
      const response = await axios.post(POSTS_LINK_NUVEM_CIVICA,
        bodyToInspection,
        headerToInspection);

      logInfo(FILE_NAME, 'createInspectionPostInNuvem', `${JSON.stringify(response.data)}`);

      // Getting codPostagem returned in a link inside headers.
      const auxCodPostagem = response.headers.location.substr(response.headers.location.indexOf('postagens/'));
      const codPostagem = auxCodPostagem.substr(10);

      logInfo(FILE_NAME, 'createInspectionPostInNuvem', `Post code of inspection created: ${codPostagem}`);

      return codPostagem;
    } catch (error) {
      logWarn(FILE_NAME, 'createInspectionPostInNuvem', `Request result in an ${error}`);

      throw errorGenerator('createInspectionPostInNuvem', error.response.status);
    }
  }

  // Prepare the results of inspection in blocks of information to send in post contents to Nuvem.
  async prepareAndSendInspectionResultsToNuvem() {
    try {
      const codPostagem = await this.createInspectionPostInNuvem();

      const contentsListOfInspectionResults = this.generateContentsListOfInspectionResults();

      await this.addContentsOnInspectionPostInNuvem(codPostagem, contentsListOfInspectionResults);

      logInfo(FILE_NAME, 'prepareAndSendInspectionResultsToNuvem',
        `List of JSONs with checklist contents: ${JSON.stringify(contentsListOfInspectionResults, null, 2)}`);
    } catch (error) {
      const errorJson = JSON.parse(error.message);

      switch (errorJson.name) {
        case 'createInspectionPostInNuvem':
          ShowToast.Toast(INTERNAL_ERROR);
          logWarn(FILE_NAME, 'prepareAndSendInspectionResultsToNuvem',
            `Error with status: ${errorJson.status}`);
          break;
        case 'addContentsOnInspectionPostInNuvem':
          ShowToast.Toast(INTERNAL_ERROR);
          logWarn(FILE_NAME, 'prepareAndSendInspectionResultsToNuvem',
            `Error with status: ${errorJson.status}`);
          break;
        default:
          ShowToast.Toast(INTERNAL_ERROR);
          logWarn(FILE_NAME, 'prepareAndSendInspectionResultsToNuvem',
            `Unknown Error -> status: ${errorJson.status}`);
          break;
      }
    }
  }

  // // Get the most current version of the schedule being inspected.
  // updateCurrentVersionOfScheduleInspected() {
  //   console.log(this.props.scheduleVisit);
  //   // TODO(Allan Nobre).
  // }
  //
  // // Change the post at Nuvem Cívica to inform that this counselor realized this visit.
  // changeCounselorRealizedVisitStatus() {
  //   const newContentJSON = this.props.scheduleVisit.currentVisit.content;
  //   newContentJSON.visitListOfInvitees[this.props.counselor.nuvemCode].realizedVisit = true;
  //
  //   const newContentString = convertingJSONToString(newContentJSON);
  //
  //   const putScheduleHeader = {
  //     headers: {
  //       appToken: this.props.counselor.token,
  //     },
  //   };
  //
  //   const putScheduleBody = {
  //     JSON: newContentString,
  //     texto: 'Agendamento',
  //     valor: 0,
  //   };
  //
  //   axios.put(`${POSTS_LINK_NUVEM_CIVICA}
  //   ${this.props.scheduleVisit.currentVisit.codPostagem}/conteudos/
  //   ${this.props.scheduleVisit.currentVisit.codConteudoPost}`,
  //   putScheduleBody, putScheduleHeader)
  //     .then((response) => {
  //       logInfo(FILE_NAME, 'changeCounselorRealizedVisitStatus', response.data);
  //     })
  //     .catch((error) => {
  //       logWarn(FILE_NAME, 'changeCounselorRealizedVisitStatus', error);
  //     });
  // }

  // Make the final requests to finalize the inspect.
  async finishVisit() {
    this.props.syncIsLoading();

    await this.prepareAndSendInspectionResultsToNuvem();

    // this.updateCurrentVersionOfScheduleInspected();

    // this.changeCounselorRealizedVisitStatus();

    this.props.syncIsNotLoading();
  }

  render() {
    return (
      <View style={styles.content}>
        <Header
          title={'Listas de verificação'}
          backButton
          backTo={() => Alert.alert(
            'SAIR DA FISCALIZAÇÃO',
            LEAVING_INSPECTION,
            [
              { text: 'Cancelar' },
              { text: 'Voltar', onPress: () => Actions.StartPendingInspection() },
            ],
          )}
        />
        <ScrollView>
          <View pointerEvents={this.props.clickableView} >
            <GoToChecklistClickableText
              goToChecklistKey="Arredores da Escola"
              goToChecklistText="Arredores da Escola"
              onPress={() => Actions.schoolSurroundingsCheckoutScreen()}
              isCompleted={this.props.report.statusSchoolSurroundings}
            />

            <GoToChecklistClickableText
              goToChecklistKey="Estoque de Alimentos"
              goToChecklistText="Estoque de Alimentos"
              onPress={() => Actions.stockFoodCheckoutScreen()}
              isCompleted={this.props.report.statusFoodStock}
            />

            <GoToChecklistClickableText
              goToChecklistKey="Documentação"
              goToChecklistText="Documentação"
              onPress={() => Actions.DocCheckoutScreen()}
              isCompleted={this.props.report.statusDoc}
            />

            <GoToChecklistClickableText
              goToChecklistKey="Qualidade da Alimentação"
              goToChecklistText="Qualidade da Alimentação"
              onPress={() => Actions.foodQualityCheckoutScreen()}
              isCompleted={this.props.report.statusFoodQuality}
            />

            <GoToChecklistClickableText
              goToChecklistKey="Manipuladores de Alimentos"
              goToChecklistText="Manipuladores de Alimentos"
              onPress={() => Actions.foodHandlerCheckoutScreen()}
              isCompleted={this.props.report.statusFoodHandler}
            />

            <GoToChecklistClickableText
              goToChecklistKey="Refeitório"
              goToChecklistText="Refeitório"
              onPress={() => Actions.refectoryCheckoutScreen()}
              isCompleted={this.props.report.statusRefectory}
            />

            <GoToChecklistClickableText
              goToChecklistKey="Abastecimento de Água e Esgoto"
              goToChecklistText="Abastecimento de Água e Esgoto"
              onPress={() => Actions.waterSewerSupplyCheckoutScreen()}
              isCompleted={this.props.report.statusWaterSewerSupply}
            />

            <GoToChecklistClickableText
              goToChecklistKey="Cozinha"
              goToChecklistText="Cozinha"
              onPress={() => Actions.kitchenCheckoutScreen()}
              isCompleted={this.props.report.statusKitchen}
            />

            <GoToChecklistClickableText
              goToChecklistKey="Preparação e Distribuição de Alimentos"
              goToChecklistText="Preparação e Distribuição de Alimentos"
              onPress={() => Actions.foodPreparationCheckoutScreen()}
              isCompleted={this.props.report.statusFoodPreparation}
            />

            <GoToChecklistClickableText
              goToChecklistKey="+ Outras informações"
              goToChecklistText="+ Outras informações"
              onPress={() => Actions.ReportObservationScreen()}
              isCompleted={this.props.report.statusReportObservation}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.buttonContainer}
            >
              <Text style={styles.buttonText}>Anexar fotos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.buttonContainer}
            >
              <Text style={styles.buttonText}>Gerar Relatório Final</Text>
            </TouchableOpacity>

            <ButtonWithActivityIndicator
              activityIndicatorStyle={styles.loading}
              onPress={() => Alert.alert(
                'ENCERRAR FISCALIZAÇÃO',
                FINISH_INSPECTION,
                [
                  { text: 'Cancelar' },
                  { text: 'Finalizar', onPress: () => this.finishVisit() },
                ],
              )}
              isLoading={this.props.isLoading}
              buttonKey="FinishInspectionButton"
              buttonText="Encerrar Fiscalização"
              buttonStyle={styles.buttonContainer}
            />

          </View>
        </ScrollView>
      </View>
    );
  }
}

const { shape, string, number, bool, func } = PropTypes;

MainReportsScreen.propTypes = {
  isLoading: bool.isRequired,
  clickableView: string.isRequired,
  syncIsLoading: func.isRequired,
  syncIsNotLoading: func.isRequired,
  counselor: shape({
    token: string.isRequired,
    nuvemCode: number.isRequired,
  }).isRequired,
  scheduleVisit: shape({
    currentVisit: shape({
    }).isRequired,
  }).isRequired,
  report: shape({

  }).isRequired,
};

GoToChecklistClickableText.propTypes = {
  isCompleted: bool.isRequired,
  goToChecklistText: string.isRequired,
  onPress: func.isRequired,
  goToChecklistKey: string.isRequired,
};
