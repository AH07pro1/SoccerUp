import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import TagInput from '../components/forms/TagInput';

export default function CreateSessionScreen({ navigation }: any) {
  const [sessionName, setSessionName] = useState('');
  const [drills, setDrills] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);

 const handleSubmit = async () => {
  const sessionData = {
    sessionName,
    drills,
    objectives,
    materials,
  };

  try {
    const response = await fetch('http://192.168.2.19:3000/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    });

    const rawText = await response.text();
    console.log('Raw response text:', rawText);

    // Try to parse JSON only if response.ok
    if (response.ok) {
      const json = JSON.parse(rawText);
      console.log('Parsed JSON:', json);
      navigation.goBack();
    } else {
      console.error('Server returned error:', rawText);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
};



  return (
    <ScrollView className="flex-1 bg-white px-6 pt-10">
      <Text className="text-3xl font-bold text-center text-green-600 mb-8">
        Create a New Session
      </Text>

      <Text className="text-base font-semibold text-gray-700 mb-1">Session Name</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="Enter session name"
        value={sessionName}
        onChangeText={setSessionName}
      />

      <TagInput
        label="Drills"
        tags={drills}
        setTags={setDrills}
        placeholder="Type drill and press Enter"
      />
      <TagInput
        label="Objectives"
        tags={objectives}
        setTags={setObjectives}
        placeholder="Type objective and press Enter"
      />
      <TagInput
        label="Required Materials"
        tags={materials}
        setTags={setMaterials}
        placeholder="Type material and press Enter"
      />

      <TouchableOpacity
        className="bg-green-600 py-4 rounded-full shadow-md active:opacity-80 mb-12"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center text-lg font-semibold">
          Save Session
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
