import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

type Drill = {
  drillName: string;
  duration: number;
};

type SessionCompleteScreenProps = {
  route: {
    params: {
      totalDrills: number;
      totalTimeSeconds: number;
      drills: Drill[];
      restDuration: number;
    };
  };
  navigation: any;
};

export default function SessionCompleteScreen({ route, navigation }: SessionCompleteScreenProps) {
  const { totalDrills, totalTimeSeconds, drills, restDuration } = route.params;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} min ${s < 10 ? '0' : ''}${s} sec`;
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white px-6 py-10">
      <View className="items-center">
        <Text className="text-4xl font-bold text-green-600 mb-6">Session Complete!</Text>
        <Text className="text-xl mb-2">Drills Completed: {totalDrills}</Text>
        <Text className="text-xl mb-4">Total Time: {formatTime(totalTimeSeconds)}</Text>

        <Text className="text-lg mb-6 text-center px-4 text-gray-600">
          💪 “Every rep gets you closer to greatness.”
        </Text>

        <Text className="text-lg font-semibold mb-2 self-start">Drill Summary:</Text>
        {drills.map((drill, index) => (
          <Text key={index} className="text-base text-gray-700 mb-1 self-start">
            • {drill.drillName} – {drill.duration} min
          </Text>
        ))}

        <TouchableOpacity
          onPress={() => navigation.replace('PlaySession', { drills })}
          className="mt-10 bg-green-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold text-lg">Repeat Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          className="mt-4 bg-blue-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold text-lg">Go to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
