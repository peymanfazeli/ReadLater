import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  CreateMessage: undefined;
  RevealMessage: {messageId: string};
};

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Home'
>;
export type CreateMessageScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateMessage'
>;
export type RevealMessageScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'RevealMessage'
>;
