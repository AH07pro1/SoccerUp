import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Drill = {
  id: number;
  drillName: string;
};

type Session = {
  id: number;
  title: string;
  objective: string;
  date: string;
  materials?: string[];
  drills?: Drill[];
};

export default function SessionDetailScreen({ route, navigation }: any) {
  const { sessionId }: { sessionId: number } = route.params;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessionDetail() {
      try {
        const res = await fetch(`http://192.168.2.19:3000/api/session/${sessionId}`);
        const data = await res.json();
        const formatted: Session = {
          id: data.id,
          title: data.sessionName,
          objective: data.objectives.join(', '),
          date: data.scheduledDate.split('T')[0],
          materials: data.materials || [],
          drills: data.drills || [],
        };
        setSession(formatted);
      } catch (err) {
        console.error('Error fetching session detail:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessionDetail();
  }, [sessionId]);

  if (loading || !session) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="mt-2 text-gray-600">Loading session...</Text>
      </View>
    );
  }

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

        <View className="mb-10">
          <Text className="text-lg font-semibold text-gray-800 mb-8">🧪 Drills</Text>
         {session.drills && session.drills.length > 0 ? (
  <View>
    {session.drills.map((drill) => (
      <TouchableOpacity
        key={drill.id}
        onPress={() => navigation.navigate('DrillDetail', { drill })}
        activeOpacity={0.8}
        className="bg-white rounded-2xl shadow-md p-5 flex-row items-center mb-4" // increased margin-bottom here
      >
        <View className="w-14 h-14 rounded-full bg-green-100 flex justify-center items-center mr-5">
          <Text className="text-green-700 font-bold text-xl">
            {drill.drillName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-green-800 font-semibold text-lg">
            {drill.drillName}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={24} color="#16a34a" />
      </TouchableOpacity>
    ))}
  </View>
) : (
  <Text className="text-gray-500">No drills added</Text>
)}

        </View>

       <TouchableOpacity
  onPress={() => navigation.navigate('PlaySession', { drills: session.drills })}
  className="mt-4 bg-blue-600 py-3 rounded-lg"
>
  <Text className="text-white text-center font-semibold">▶️ Play Session</Text>
</TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
