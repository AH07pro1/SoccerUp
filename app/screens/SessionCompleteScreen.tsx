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
  const { totalDrills, totalTimeSeconds, drills } = route.params;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m} min ${s < 10 ? '0' : ''}${s} sec`;
  };

  // Find longest drill for proportional bars
  const maxDuration = Math.max(...drills.map(d => d.duration));

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white px-6 py-10">
      <View className="items-center">
        <Text className="text-4xl font-bold text-green-600 mb-6">Session Complete!</Text>

        <Text className="text-xl mb-2 font-semibold">Drills Completed:</Text>
        <Text className="text-3xl text-green-700 font-extrabold mb-4">{totalDrills}</Text>

        <Text className="text-xl mb-6 font-semibold">Total Time:</Text>
        <Text className="text-3xl text-green-700 font-extrabold mb-8">{formatTime(totalTimeSeconds)}</Text>

        <Text className="text-lg italic mb-8 text-center px-6 text-green-800 font-semibold">
          💪 “Every rep gets you closer to greatness.”
        </Text>

        <Text className="text-xl font-semibold mb-4 self-start">Drill Summary:</Text>
        {drills.map((drill, index) => {
          const barWidth = (drill.duration / maxDuration) * 100;
          return (
            <View key={index} className="mb-3 self-start w-full">
              <Text className="text-base text-gray-700 mb-1">
                • {drill.drillName} — {drill.duration} min
              </Text>
              <View className="h-3 bg-green-100 rounded-full overflow-hidden w-full">
                <View
                  style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: '#22c55e',
                    borderRadius: 9999,
                  }}
                />
              </View>
            </View>
          );
        })}

        <TouchableOpacity
          onPress={() => navigation.replace('PlaySession', { drills })}
          className="mt-12 bg-green-600 px-8 py-4 rounded-full w-full items-center"
        >
          <Text className="text-white font-semibold text-lg">Repeat Session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          className="mt-4 bg-blue-600 px-8 py-4 rounded-full w-full items-center"
        >
          <Text className="text-white font-semibold text-lg">Go to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
