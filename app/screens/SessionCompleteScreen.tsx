import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type SessionCompleteScreenProps = {
  route: {
    params: {
      totalDrills: number;
      totalTimeSeconds: number;
    };
  };
  navigation: any;
};

export default function SessionCompleteScreen({ route, navigation }: SessionCompleteScreenProps) {
  const { totalDrills, totalTimeSeconds } = route.params;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} min ${s < 10 ? '0' : ''}${s} sec`;
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-4xl font-bold text-green-600 mb-8">Session Complete!</Text>
      <Text className="text-xl mb-4">Drills Completed: {totalDrills}</Text>
      <Text className="text-xl mb-4">Total Time: {formatTime(totalTimeSeconds)}</Text>
      <Text className="text-lg mb-10 text-center px-4">
        Great job! You finished your training session. Keep up the good work to improve your skills.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
        className="bg-blue-600 px-8 py-4 rounded-lg"
      >
        <Text className="text-white font-semibold text-lg">Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
