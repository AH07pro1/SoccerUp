import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Drill = {
  id: number;
  drillName: string;
  duration: number;
  restTime: number;
  numberOfSets: number;
  numberOfReps: number;
  drillCategory: string;
  materials: string[];
  description: string;
  visualReference?: string | null;
  createdByUser?: boolean;
};

type Session = {
  id: number;
  sessionName: string;
  objectives: string[];
  scheduledDate: string;
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
          sessionName: data.sessionName,
          objectives: data.objectives || [],
          scheduledDate: data.scheduledDate,
          materials: data.materials || [],
          drills: data.drills?.map((d: any) => ({
            id: d.id,
            drillName: d.drillName,
            duration: d.duration,
            restTime: d.restTime,
            numberOfSets: d.numberOfSets,
            numberOfReps: d.numberOfReps,
            drillCategory: d.drillCategory,
            materials: d.materials,
            description: d.description,
            visualReference: d.visualReference,
            createdByUser: d.createdByUser,
          })),
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

  const handleDelete = () => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`http://192.168.2.19:3000/api/session/${sessionId}`, {
                method: 'DELETE',
              });
              if (res.ok) {
                Alert.alert('Deleted', 'Session was deleted successfully.');
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to delete session.');
              }
            } catch (err) {
              Alert.alert('Error', 'Network error while deleting session.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

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
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-bold text-green-700">{session.sessionName}</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('CreateSession', { session, isEditMode: true })
              }
              className="bg-yellow-400 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1">🗓 Scheduled For</Text>
          <Text className="text-gray-700">{new Date(session.scheduledDate).toLocaleDateString()}</Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1">🎯 Objectives</Text>
          <Text className="text-gray-700">
            {session.objectives.length > 0 ? session.objectives.join(', ') : 'No objectives provided'}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1">📦 Materials</Text>
          {session.materials && session.materials.length > 0 ? (
            session.materials.map((mat, idx) => (
              <Text key={idx} className="text-gray-700">
                • {mat}
              </Text>
            ))
          ) : (
            <Text className="text-gray-500">No materials provided</Text>
          )}
        </View>

        <View className="mb-10">
          <Text className="text-lg font-semibold text-gray-800 mb-8">🧪 Drills</Text>
          {session.drills && session.drills.length > 0 ? (
            session.drills.map((drill) => (
              <TouchableOpacity
                key={drill.id}
                onPress={() =>
 navigation.navigate('DrillDetail', {
  drill,
  sessionId: session.id,
  onVariantCreated: (variantDrill: Drill) => {
    setSession((prev) =>
      prev
        ? {
            ...prev,
            drills: prev.drills?.map((d) =>
              d.id === drill.id ? variantDrill : d
            ),
          }
        : prev
    );
  },
})

}

                activeOpacity={0.8}
                className="bg-white rounded-2xl shadow-md p-5 flex-row items-center mb-4"
              >
                <View className="w-14 h-14 rounded-full bg-green-100 flex justify-center items-center mr-5">
                  <Text className="text-green-700 font-bold text-xl">
                    {drill.drillName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-green-800 font-semibold text-lg">{drill.drillName}</Text>
                </View>

                <Ionicons name="chevron-forward" size={24} color="#16a34a" />
              </TouchableOpacity>
            ))
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
