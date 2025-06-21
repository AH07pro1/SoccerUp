import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View className="flex-1 justify-center items-center bg-white px-4">
      <Text className="text-3xl font-bold mb-10 text-center text-green-700">
        Home Screen
      </Text>

      <TouchableOpacity
        className="bg-green-600 w-48 px-6 py-4 rounded-full shadow-md active:opacity-80"
        onPress={() => navigation.navigate('CreateSession', { itemId: 42 })}
      >
        <Text className="text-white text-center text-lg font-semibold">
          Create Session
        </Text>
      </TouchableOpacity>
    </View>
  );
}
