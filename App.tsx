import { View, Text, TouchableOpacity } from 'react-native';

export default function App() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <TouchableOpacity className="bg-green-600 px-6 py-3 rounded-full shadow-md active:opacity-80">
        <Text className="text-white text-lg font-semibold">Start Training</Text>
      </TouchableOpacity>
    </View>
  );
}
