import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Alert,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

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
  restTime: number;
  visualReference?: string | null;
  basedOnName?: string;
};



export default function DrillDetailScreen({ route, navigation }: any) {
  const screenWidth = Dimensions.get('window').width;
  const [drill, setDrill] = useState<Drill | null>(null);
  const drillId = route.params?.drill?.id;
  const { drill: intiialDrill, sessionId, onVariantCreated } = route.params;




  const isYouTubeLink =
    drill?.visualReference?.includes('youtube.com') ||
    drill?.visualReference?.includes('youtu.be');

  const player =
    !isYouTubeLink && drill?.visualReference
      ? useVideoPlayer(drill?.visualReference, (player) => {
          player.loop = true;
          player.play();
        })
      : null;

  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    const videoId = match ? match[1] : null;
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1`
      : url;
  };
 useFocusEffect(
  useCallback(() => {

    const drillFromParams = route.params?.drill;

    if (drillFromParams) {
      setDrill(drillFromParams);
    } else if (drillId) {
      const fetchDrill = async () => {
        try {
          const res = await fetch(`http://192.168.2.19:3000/api/drill/${drillId}`);
          if (!res.ok) throw new Error('Failed to fetch drill');
          const data = await res.json();
          setDrill(data);
        } catch (err) {
          Alert.alert('Error', 'Could not load updated drill.');
        }
      };
      fetchDrill();
    }
  }, [route.params?.drill, drillId])
);


  const handleDelete = () => {
    Alert.alert(
      'Delete Drill',
      'Are you sure you want to delete this drill?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(
                `http://192.168.2.19:3000/api/drill/${drill?.id}`,
                { method: 'DELETE' }
              );
              if (res.ok) {
                Alert.alert('Deleted', 'Drill was deleted successfully.');
                navigation.goBack();
              } else {
                Alert.alert('Error', 'Failed to delete drill.');
              }
            } catch (err) {
              Alert.alert('Error', 'Network error while deleting drill.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-10">
        {/* Top Action Row */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-3xl font-extrabold text-gray-900">
            {drill?.drillName}
          </Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() =>
  navigation.navigate('CreateDrill', {
  drill,
  isEditMode: true,
  isSystemDrill: !drill?.createdByUser,
  sessionId: route.params?.sessionId, // Pass sessionId here
  onDrillUpdated: (updatedDrill: Drill) => {
    setDrill(updatedDrill);
    if (route.params?.onVariantCreated) {
      route.params.onVariantCreated(updatedDrill);
    }
  },
})

}

              className="bg-yellow-400 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {drill?.createdByUser && (
          <Text className="bg-blue-600 text-white px-3 py-1 rounded-full self-start text-sm mb-4">
            You Created This
          </Text>
        )}
        {drill?.basedOnName && (
  <Text className="bg-purple-600 text-white px-3 py-1 rounded-full self-start text-sm mb-4">
    Variant of "{drill.basedOnName}"
  </Text>
)}


        {/* Info Card */}
        <View className="bg-gray-100 p-4 rounded-2xl mb-6 space-y-2">
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Duration:</Text> {drill?.duration} mins
          </Text>
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Sets:</Text> {drill?.numberOfSets}
          </Text>
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Reps:</Text> {drill?.numberOfReps}
          </Text>
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Category:</Text> {drill?.drillCategory}
          </Text>
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Materials:</Text>{' '}
            {drill?.materials && drill.materials.length > 0 ? drill.materials.join(', ') : 'None'}
          </Text>
        </View>

        {/* Description */}
        <Text className="text-lg font-semibold text-gray-900 mb-2">Description</Text>
        <Text className="text-base text-gray-700 leading-relaxed">
          {drill?.description?.trim()
            ? drill.description
            : 'No description available for this drill.'}
        </Text>

        {/* Video */}
        <Text className="text-lg font-semibold text-gray-900 mt-8 mb-2">Video</Text>

        {drill?.visualReference ? (
          isYouTubeLink ? (
            <View
              className="rounded-xl overflow-hidden"
              style={{ width: screenWidth - 32, height: 200 }}
            >
              <WebView
                source={{ uri: getYouTubeEmbedUrl(drill.visualReference) }}
                allowsFullscreenVideo
                javaScriptEnabled
                domStorageEnabled
              />
            </View>
          ) : player ? (
            <View
              className="rounded-xl overflow-hidden"
              style={{ width: screenWidth - 32, height: 200 }}
            >
              <VideoView style={{ flex: 1 }} player={player} />
            </View>
          ) : (
            <View className="bg-gray-200 h-48 rounded-xl justify-center items-center">
              <Text className="text-gray-600">Loading video...</Text>
            </View>
          )
        ) : (
          <View className="bg-gray-200 h-48 rounded-xl justify-center items-center">
            <Text className="text-gray-600">No video available</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
