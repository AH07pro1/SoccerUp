import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
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

export default function DrillListScreen({ navigation, route }: any) {

  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDrills, setSelectedDrills] = useState<number[]>([]);

 useFocusEffect(
  useCallback(() => {
    const fetchDrills = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://192.168.2.19:3000/api/drill');
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        const data = await res.json();
        setDrills(data);
        setError('');
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
  }, [])
);

  const toggleSelectDrill = (id: number) => {
    setSelectedDrills((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleOkPress = () => {
    // Get full drill objects for selected IDs
    const selectedDrillObjects = drills.filter((d) => selectedDrills.includes(d.id));

    // Extract drill names for tags
    const drillNames = selectedDrillObjects.map((d) => d.drillName);

    // Pass drill names back
    navigation.navigate('CreateSession', { selectedDrills: drillNames}); // we can pass values through navigation params
  };

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
    <SafeAreaView style={{ flex: 1 }}>
      {/* Header with Create Drill button */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          backgroundColor: 'white',
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#111827' }}>
          Select Drills
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateDrill')}

          style={{
            backgroundColor: '#2563eb', // blue-600
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            Create Drill
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={drills}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const selected = selectedDrills.includes(item.id);
          return (
            <TouchableOpacity
              onPress={() => toggleSelectDrill(item.id)}
              style={{
                backgroundColor: selected ? '#22c55e' : '#f3f4f6', // green if selected, light gray otherwise
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: selected ? 'white' : 'black',
                  marginBottom: 4,
                }}
              >
                {item.drillName}
              </Text>
              <Text style={{ color: selected ? 'white' : '#374151' }}>
                Duration: {item.duration} mins
              </Text>
              <Text style={{ color: selected ? 'white' : '#374151' }}>
                Sets: {item.numberOfSets} | Reps: {item.numberOfReps}
              </Text>
              <Text style={{ color: selected ? 'white' : '#374151' }}>
                Category: {item.drillCategory}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        onPress={handleOkPress}
        style={{
          backgroundColor: '#22c55e',
          padding: 16,
          margin: 16,
          borderRadius: 9999,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>
          OK ({selectedDrills.length} selected)
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
