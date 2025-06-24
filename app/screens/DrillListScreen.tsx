import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CheckIcon } from 'react-native-heroicons/solid';

type Drill = {
  id: number;
  drillName: string;
  duration: number;
  numberOfSets: number;
  numberOfReps: number;
  drillCategory: string;
  materials: string[];
  description: string;
  createdByUser?: boolean;
};

export default function DrillListScreen({ navigation, route }: any) {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDrills, setSelectedDrills] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<'default' | 'name' | 'duration'>('default');

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
    const selectedDrillObjects = drills.filter((d) => selectedDrills.includes(d.id));
    const drillNames = selectedDrillObjects.map((d) => d.drillName);
    navigation.navigate('CreateSession', { selectedDrills: drillNames });
  };

  const filteredAndSortedDrills = drills
    .filter((d) => d.drillName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOption === 'name') {
        return a.drillName.localeCompare(b.drillName);
      } else if (sortOption === 'duration') {
        return a.duration - b.duration;
      } else {
        return 0;
      }
    });

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 text-lg text-center">{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Create Drill button */}
      <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-300 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Select Drills</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateDrill')}
          className="bg-blue-600 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold text-base">Create Drill</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Sort */}
      <View className="px-4 pt-4">
        <TextInput
          placeholder="Search drills..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          className="border border-gray-300 rounded-lg p-3 mb-3"
        />

        <Picker
          selectedValue={sortOption}
          onValueChange={(value) => setSortOption(value)}
          className="mb-4"
        >
          <Picker.Item label="Default Order" value="default" />
          <Picker.Item label="Sort by Name" value="name" />
          <Picker.Item label="Sort by Duration" value="duration" />
        </Picker>
      </View>

      <FlatList
        data={filteredAndSortedDrills}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const selected = selectedDrills.includes(item.id);
          return (
            <View
              className={`flex-row justify-between items-center bg-gray-100 rounded-2xl p-4 mb-4 ${
                selected ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <TouchableOpacity
                onPress={() => navigation.navigate('DrillDetail', { drill: item })}
                className="flex-1 pr-4"
              >
                <Text className="text-lg font-bold text-gray-900 mb-1">{item.drillName}</Text>
                <Text className="text-gray-700">Duration: {item.duration} mins</Text>
                <Text className="text-gray-700">
                  Sets: {item.numberOfSets} | Reps: {item.numberOfReps}
                </Text>
                <Text className="text-gray-700">Category: {item.drillCategory}</Text>
                {item.createdByUser && (
                  <Text className="mt-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full self-start">
                    You
                  </Text>
                )}
              </TouchableOpacity>

              {/* Checkbox */}
              <TouchableOpacity
                onPress={() => toggleSelectDrill(item.id)}
                className={`w-6 h-6 rounded border-2 ${
                  selected ? 'bg-green-600 border-green-600' : 'border-gray-400 bg-white'
                } flex items-center justify-center`}
                activeOpacity={0.7}
              >
                {selected && <CheckIcon size={20} color="white" />}
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <TouchableOpacity
        onPress={handleOkPress}
        className="bg-green-600 py-4 mx-6 rounded-full absolute bottom-8 left-0 right-0"
        activeOpacity={0.8}
      >
        <Text className="text-white text-center text-lg font-semibold">
          OK ({selectedDrills.length} selected)
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
