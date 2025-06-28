// app/navigation/Tabs.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import SessionListScreen from '../screens/SessionListScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
  tabBarIcon: ({ color, size }) => {
    let iconName = 'home';

    if (route.name === 'Home') iconName = 'home';
    else if (route.name === 'SessionList') iconName = 'calendar-sharp'; // better icon here

    return <Ionicons name={iconName as any} size={size} color={color} />;
  },
  tabBarActiveTintColor: '#2563eb',
  tabBarInactiveTintColor: 'gray',
  headerShown: false,
})}

    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="SessionList" component={SessionListScreen} />
    </Tab.Navigator>
  );
}
