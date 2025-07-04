// app/navigation/Navigation.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Tabs from './Tabs';
import CreateSessionScreen from '../screens/CreateSessionScreen';
import CreateDrillScreen from '../screens/CreateDrillScreen';
import DrillDetailScreen from '../screens/DrillDetailScreen';
import DrillListScreen from '../screens/DrillListScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import PlaySessionScreen from '../screens/PlaySessionScreen';
import SessionCompleteScreen from '../screens/SessionCompleteScreen';

export type RootStackParamList = {
  Tabs: undefined;
  CreateSession: { itemId: number };
  CreateDrill: undefined;
  DrillDetail: { drill: any };
  DrillList: undefined;
  SessionDetail: { session: any };
  PlaySession: { session: any };
  SessionComplete: { totalDrills: number; totalTimeSeconds: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Tabs">
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="CreateSession" component={CreateSessionScreen} />
        <Stack.Screen name="CreateDrill" component={CreateDrillScreen} />
        <Stack.Screen name="DrillDetail" component={DrillDetailScreen} />
        <Stack.Screen name="DrillList" component={DrillListScreen} />
        <Stack.Screen name="SessionDetail" component={SessionDetailScreen} />
        <Stack.Screen name="PlaySession" component={PlaySessionScreen} />
        <Stack.Screen name="SessionComplete" component={SessionCompleteScreen as React.ComponentType<any>} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
