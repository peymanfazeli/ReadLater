import 'react-native-get-random-values';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {setupRTL} from './src/i18n';

setupRTL();

AppRegistry.registerComponent(appName, () => App);
