import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';

type TagInputProps = {
  label: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagInput({ label, tags, setTags, placeholder }: TagInputProps) {
  const [input, setInput] = useState('');

  const handleAddTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setInput('');
      Keyboard.dismiss();
    }
  };

  const removeTag = (index: number) => {
    const updated = [...tags];
    updated.splice(index, 1);
    setTags(updated);
  };

  return (
    <View className="mb-6">
      <Text className="text-base font-semibold text-gray-700 mb-1">{label}</Text>
      <View className="flex-row flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => removeTag(i)}
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
}
