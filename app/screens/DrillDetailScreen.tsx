import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';

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
  const drillId = route.params?.drill?.id;

  const [drill, setDrill] = useState<Drill | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      const fetchDrill = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`http://192.168.2.19:3000/api/drill/${drillId}`);
          if (!res.ok) throw new Error('Failed to fetch drill');
          const data = await res.json();
          setDrill(data);
        } catch (err) {
          Alert.alert('Error', 'Could not load updated drill.');
        } finally {
          setIsLoading(false);
        }
      };

      if (drillId) {
        fetchDrill();
      }
    }, [drillId])
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

  if (isLoading || !drill) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600 text-base">Loading drill info...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-6 pb-10">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
  <Text
    className="text-3xl font-extrabold text-gray-900 flex-1 max-w-[70%] pr-2"
    numberOfLines={2}
  >
    {drill.drillName}
  </Text>

  <View className="flex-row space-x-3 ml-2">
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('CreateDrill', {
          drill,
          isEditMode: true,
          isSystemDrill: !drill?.createdByUser,
          sessionId: route.params?.sessionId,
          onDrillUpdated: (updatedDrill: Drill) => {
            setDrill(updatedDrill);
            if (route.params?.onVariantCreated) {
              route.params.onVariantCreated(updatedDrill);
            }
          },
        })
      }
      className="bg-yellow-400 px-3 py-2 rounded-lg"
    >
      <Text className="text-white font-semibold text-sm">Edit</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={handleDelete}
      className="bg-red-600 px-3 py-2 rounded-lg"
    >
      <Text className="text-white font-semibold text-sm">Delete</Text>
    </TouchableOpacity>
  </View>
</View>


     {/* Badges */}
<View className="flex-row flex-wrap gap-x-3 gap-y-2 mb-6">
  {drill.createdByUser && (
    <View className="bg-blue-600 px-3 py-1.5 rounded-full">
      <Text className="text-white text-sm font-bold flex-shrink-0">You</Text>
    </View>
  )}
  {drill.basedOnName && (
    <View className="bg-purple-600 px-3 py-1.5 rounded-full">
      <Text className="text-white text-sm font-bold flex-shrink-0">Variant</Text>
    </View>
  )}
</View>


      {/* Info Card */}
      <View className="bg-gray-100 rounded-2xl p-4 mb-8 space-y-2">
        <InfoRow label="Duration" value={`${drill.duration} mins`} />
        <InfoRow label="Sets" value={`${drill.numberOfSets}`} />
        <InfoRow label="Reps" value={`${drill.numberOfReps}`} />
        <InfoRow label="Category" value={drill.drillCategory} />
        <InfoRow
          label="Materials"
          value={
            drill.materials && drill.materials.length > 0
              ? drill.materials.join(', ')
              : 'None'
          }
        />
      </View>

      {/* Description */}
      <Text className="text-lg font-semibold text-gray-900 mb-2">Description</Text>
      <Text className="text-base text-gray-700 leading-relaxed mb-8">
        {drill.description?.trim()
          ? drill.description
          : 'No description available for this drill.'}
      </Text>

      {/* Video */}
      <Text className="text-lg font-semibold text-gray-900 mb-2">Video</Text>

      {drill.visualReference ? (
        isYouTubeLink ? (
          <View
            className="rounded-xl overflow-hidden mb-10"
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
            className="rounded-xl overflow-hidden mb-10"
            style={{ width: screenWidth - 32, height: 200 }}
          >
            <VideoView style={{ flex: 1 }} player={player} />
          </View>
        ) : (
          <View className="bg-gray-200 h-48 rounded-xl justify-center items-center mb-10">
            <Text className="text-gray-600">Loading video...</Text>
          </View>
        )
      ) : (
        <View className="bg-gray-200 h-48 rounded-xl justify-center items-center mb-10">
          <Text className="text-gray-600">No video available</Text>
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between border-b border-gray-300 py-1">
      <Text className="text-gray-700 font-semibold text-base">{label}</Text>
      <Text className="text-gray-900 text-base">{value}</Text>
    </View>
  );
}
