import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from 'react-native';

const TagInput = ({ label, tags, setTags, placeholder }: any) => {
  const [input, setInput] = useState('');

  const handleAddTag = () => {
    if (input.trim().length > 0 && !tags.includes(input.trim())) {
      setTags([...tags, input.trim()]);
      setInput('');
      Keyboard.dismiss();
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-gray-700 mb-1">{label}</Text>
      <View className="flex-row flex-wrap gap-2 mb-2">
        {tags.map((tag: string, index: number) => (
          <TouchableOpacity
            key={index}
            onPress={() => removeTag(index)}
            className="bg-blue-100 px-3 py-1 rounded-full"
          >
            <Text className="text-blue-800 text-sm">#{tag} ✕</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        className="border border-gray-300 rounded-lg p-3"
        placeholder={placeholder}
        value={input}
        onChangeText={setInput}
        onSubmitEditing={handleAddTag}
        returnKeyType="done"
      />
    </View>
  );
};

export default function CreateSessionScreen({ navigation }: any) {
  const [sessionName, setSessionName] = useState('');
  const [drills, setDrills] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);

  const handleSubmit = () => {
    const sessionData = {
      sessionName,
      drills,
      objectives,
      materials,
    };
    console.log(sessionData);
    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-10">
      <Text className="text-3xl font-bold text-center text-blue-700 mb-8">
        Create a New Session
      </Text>

      {/* Session Name */}
      <Text className="text-base font-semibold text-gray-700 mb-1">Session Name</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="Enter session name"
        value={sessionName}
        onChangeText={setSessionName}
      />

      {/* Drills */}
      <TagInput
        label="Drills"
        tags={drills}
        setTags={setDrills}
        placeholder="Type drill and press Enter"
      />

      {/* Objectives */}
      <TagInput
        label="Objectives"
        tags={objectives}
        setTags={setObjectives}
        placeholder="Type objective and press Enter"
      />

      {/* Required Materials */}
      <TagInput
        label="Required Materials"
        tags={materials}
        setTags={setMaterials}
        placeholder="Type material and press Enter"
      />

      {/* Save Button */}
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
