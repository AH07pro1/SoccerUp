import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CreateSessionScreen from '../screens/CreateSessionScreen';

type RootStackParamList = {
  Home: undefined;
  CreateSession: { itemId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
