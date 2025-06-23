import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

type Drill = {
  id: number;
  drillName: string;
  duration: number;
  numberOfSets: number;
  numberOfReps: number;
  drillCategory: string;
  materials: string[];
  description: string;
};

export default function DrillListScreen({ navigation }: any) {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDrills = async () => {
  try {
    const res = await fetch('http://192.168.2.19:3000/api/drill');
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const data = await res.json();
    setDrills(data);
  } catch (err) {
    console.error('Fetch drills error:', err);
    if (err instanceof Error) {
      setError('Failed to load drills: ' + err.message);
    } else {
      setError('Failed to load drills: Unknown error');
    }
  } finally {
    setLoading(false);
  }
};


    fetchDrills();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-lg">{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={drills}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View className="bg-gray-100 rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-lg font-bold text-gray-900 mb-1">{item.drillName}</Text>
          <Text className="text-sm text-gray-700">Duration: {item.duration} mins</Text>
          <Text className="text-sm text-gray-700">Sets: {item.numberOfSets} | Reps: {item.numberOfReps}</Text>
          <Text className="text-sm text-gray-700">Category: {item.drillCategory}</Text>
          <Text className="text-sm text-gray-700">
            Materials: {item.materials.length > 0 ? item.materials.join(', ') : 'None'}
          </Text>
          <Text className="text-sm text-gray-700">Description: {item.description}</Text>
        </View>
      )}
    />
  );
}
