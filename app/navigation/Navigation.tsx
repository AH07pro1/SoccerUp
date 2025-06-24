import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import CreateSessionScreen from '../screens/CreateSessionScreen';
import DrillListScreen from '../screens/DrillListScreen';
import CreateDrillScreen from '../screens/CreateDrillScreen';  // <-- import it
import DrillDetailScreen from '../screens/DrillDetailScreen';  // <-- import it
type RootStackParamList = {
  Home: undefined;
  CreateSession: { itemId: number };
  DrillList: undefined;
  CreateDrill: undefined;  // <-- add param type
  DrillDetail: { drill: any };  // <-- add param type
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
        <Stack.Screen name="DrillList" component={DrillListScreen} />
        <Stack.Screen name="CreateDrill" component={CreateDrillScreen} />
        <Stack.Screen name="DrillDetail" component={DrillDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
