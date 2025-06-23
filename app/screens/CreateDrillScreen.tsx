import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text
      style={{
        color: 'white',
        backgroundColor: 'red',
        padding: 6,
        marginTop: 4,
        marginBottom: 16,
      }}
    >
      {message}
    </Text>
  );
}

export default function CreateDrillScreen({ navigation }: any) {
  const [drillName, setDrillName] = useState('');
  const [duration, setDuration] = useState('');
  const [numberOfSets, setNumberOfSets] = useState('');
  const [numberOfReps, setNumberOfReps] = useState('');
  const [drillCategory, setDrillCategory] = useState('passing');
  const [materials, setMaterials] = useState('');
  const [description, setDescription] = useState('');
  const [visualReference, setVisualReference] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setErrors({});

    const bodyData = {
      drillName,
      duration: Number(duration),
      numberOfSets: Number(numberOfSets),
      numberOfReps: Number(numberOfReps),
      drillCategory,
      materials: materials ? materials.split(',').map((m) => m.trim()) : [],
      description,
      visualReference: visualReference || null,
    };

    try {
      const res = await fetch('http://192.168.2.19:3000/api/drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const text = await res.text();

      if (!res.ok) {
        try {
          const errorData = JSON.parse(text);
          if (errorData.errors) {
            const parsedErrors: Record<string, string> = {};
            for (const key in errorData.errors) {
              const errs = errorData.errors[key]?._errors;
              if (Array.isArray(errs) && errs.length > 0) {
                parsedErrors[key] = errs[0];
              }
            }
            setErrors(parsedErrors);
            return;
          }

          const errorMessage = errorData.error || 'Failed to create drill';
          Alert.alert('Error', errorMessage);
        } catch {
          Alert.alert('Error', 'Unexpected server error');
        }
        return;
      }

      Alert.alert('Success', 'Drill created successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Network error, try again later');
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-10">
      <Text className="text-2xl font-bold text-green-600 mb-8 text-center">
        Create a New Drill
      </Text>

      <Text className="text-gray-700 font-semibold mb-1">Drill Name*</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3"
        placeholder="Enter drill name"
        value={drillName}
        onChangeText={setDrillName}
      />
      <ErrorText message={errors.drillName} />

      <Text className="text-gray-700 font-semibold mb-1">Duration (minutes)*</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3"
        placeholder="Enter duration"
        keyboardType="numeric"
        value={duration}
        onChangeText={setDuration}
      />
      <ErrorText message={errors.duration} />

      <Text className="text-gray-700 font-semibold mb-1">Number of Sets*</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3"
        placeholder="Enter sets"
        keyboardType="numeric"
        value={numberOfSets}
        onChangeText={setNumberOfSets}
      />
      <ErrorText message={errors.numberOfSets} />

      <Text className="text-gray-700 font-semibold mb-1">Number of Reps*</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3"
        placeholder="Enter reps"
        keyboardType="numeric"
        value={numberOfReps}
        onChangeText={setNumberOfReps}
      />
      <ErrorText message={errors.numberOfReps} />

      <Text className="text-gray-700 font-semibold mb-1">Drill Category*</Text>
      <Picker
        selectedValue={drillCategory}
        onValueChange={(itemValue) => setDrillCategory(itemValue)}
      >
        <Picker.Item label="Passing" value="passing" />
        <Picker.Item label="Shooting" value="shooting" />
        <Picker.Item label="Dribbling" value="dribbling" />
        <Picker.Item label="Defending" value="defending" />
        <Picker.Item label="Goalkeeping" value="goalkeeping" />
        <Picker.Item label="Fitness" value="fitness" />
      </Picker>
      <ErrorText message={errors.drillCategory} />

      <Text className="text-gray-700 font-semibold mb-1">Materials (comma separated)</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="e.g. cones, balls"
        value={materials}
        onChangeText={setMaterials}
      />
      <ErrorText message={errors.materials} />

      <Text className="text-gray-700 font-semibold mb-1">Visual Reference Link</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="https://example.com/video"
        value={visualReference}
        onChangeText={setVisualReference}
      />
      <ErrorText message={errors.visualReference} />

      <Text className="text-gray-700 font-semibold mb-1">Description*</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="Enter drill description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <ErrorText message={errors.description} />

      <TouchableOpacity
        className="bg-green-600 rounded-full py-4 mb-10"
        activeOpacity={0.8}
        onPress={handleSubmit}
      >
        <Text className="text-white text-center text-lg font-semibold">
          Save Drill
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
