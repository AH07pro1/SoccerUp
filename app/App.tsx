import React from 'react';
import Navigation from './navigation/Navigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/global.css'; // Import global styles

export default function App() {
  return (
    // Wrap the app with that in order to be able to drag the drills in the session creation form(for the order).
    <GestureHandlerRootView className="flex-1"> 
        <Navigation />
    </GestureHandlerRootView>
        
      
  );
}
