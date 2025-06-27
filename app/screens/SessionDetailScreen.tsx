import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';

type Drill = {
  id: number;
  drillName: string;
};

type Session = {
  id: number;
  title: string;          // was sessionName
  objective: string;      // single string, not array
  materials?: string[];   // optional, add if you have it
  date: string;           // just date string, no time here
  drills?: Drill[];       // optional drills, if you have them
};

export default function SessionDetailScreen({ route, navigation }: any) {
  const { session }: { session: Session } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-3xl font-bold text-green-700 mb-4">{session.title}</Text>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1">🗓 Scheduled For</Text>
          <Text className="text-gray-700">{session.date}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1">🎯 Objectives</Text>
          <Text className="text-gray-700">{session.objective || 'No objectives provided'}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1">📦 Materials</Text>
          {session.materials && session.materials.length > 0 ? (
            session.materials.map((mat, idx) => (
              <Text key={idx} className="text-gray-700">• {mat}</Text>
            ))
          ) : (
            <Text className="text-gray-500">No materials provided</Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1">🧪 Drills</Text>
          {session.drills && session.drills.length > 0 ? (
            session.drills.map((drill) => (
              <Text key={drill.id} className="text-gray-700">• {drill.drillName}</Text>
            ))
          ) : (
            <Text className="text-gray-500">No drills added</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-8 bg-green-600 py-3 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
