import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {CompositeScreenProps} from '@react-navigation/native';
import type {DrawerScreenProps} from '@react-navigation/drawer';

export type RootStackParamList = {
  Home: undefined;
  CreateMessage: undefined;
  RevealMessage: {messageId: string};
  Login: undefined;
  Settings: undefined;
};

export type HomeDrawerParamList = {
  HomeMain: undefined;
};

export type HomeScreenProps = CompositeScreenProps<
  DrawerScreenProps<HomeDrawerParamList, 'HomeMain'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type CreateMessageScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateMessage'
>;
export type RevealMessageScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'RevealMessage'
>;
export type LoginScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Login'
>;
export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;
