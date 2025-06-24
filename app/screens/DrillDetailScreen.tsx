import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function DrillDetailScreen({ route }: any) {
  const { drill } = route.params;

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-6">
      <Text className="text-2xl font-bold mb-4 text-gray-800">
        {drill.drillName}
      </Text>

      <Text className="text-base text-gray-700 mb-1">
        Duration: {drill.duration} mins
      </Text>
      <Text className="text-base text-gray-700 mb-1">
        Sets: {drill.numberOfSets}
      </Text>
      <Text className="text-base text-gray-700 mb-1">
        Reps: {drill.numberOfReps}
      </Text>
      <Text className="text-base text-gray-700 mb-1">
        Category: {drill.drillCategory}
      </Text>
      <Text className="text-base text-gray-700 mb-1">
        Materials: {drill.materials.join(', ') || 'None'}
      </Text>

      <Text className="text-base text-gray-700 font-semibold mt-4 mb-1">
        Description
      </Text>
      <Text className="text-gray-600">{drill.description}</Text>

      {drill.createdByUser && (
        <Text className="mt-4 bg-blue-600 text-white px-3 py-1 rounded-full self-start text-sm">
          You Created This
        </Text>
      )}
    </ScrollView>
  );
}
