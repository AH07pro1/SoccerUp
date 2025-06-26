import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { WebView } from 'react-native-webview';

export default function DrillDetailScreen({ route }: any) {
  const { drill } = route.params;
  const screenWidth = Dimensions.get('window').width;

  const isYouTubeLink =
    drill.visualReference?.includes('youtube.com') ||
    drill.visualReference?.includes('youtu.be');

  // Initialize player only if not YouTube
  const player =
    !isYouTubeLink && drill.visualReference
      ? useVideoPlayer(drill.visualReference, (player) => {
          player.loop = true;
          player.play();
        })
      : null;

  const openVideoLink = () => {
    if (drill.visualReference) {
      Linking.openURL(drill.visualReference);
    }
  };

  // Helper to get embeddable YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    // Extract video ID from youtube URL
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    const videoId = match ? match[1] : null;
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?controls=1&modestbranding=1`
      : url;
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-6 pb-10">
        {/* Title */}
        <Text className="text-3xl font-extrabold text-gray-900 mb-2">
          {drill.drillName}
        </Text>

        {/* Created by you */}
        {drill.createdByUser && (
          <Text className="bg-blue-600 text-white px-3 py-1 rounded-full self-start text-sm mb-4">
            You Created This
          </Text>
        )}

        {/* Info Card */}
        <View className="bg-gray-100 p-4 rounded-2xl mb-6 space-y-2">
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Duration:</Text> {drill.duration} mins
          </Text>
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Sets:</Text> {drill.numberOfSets}
          </Text>
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Reps:</Text> {drill.numberOfReps}
          </Text>
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Category:</Text> {drill.drillCategory}
          </Text>
          <Text className="text-base text-gray-800">
            <Text className="font-semibold">Materials:</Text>{' '}
            {drill.materials.length > 0 ? drill.materials.join(', ') : 'None'}
          </Text>
        </View>

        {/* Description */}
        <Text className="text-lg font-semibold text-gray-900 mb-2">Description</Text>
        <Text className="text-base text-gray-700 leading-relaxed">
          {drill.description?.trim()
            ? drill.description
            : 'No description available for this drill.'}
        </Text>

        {/* Video Section */}
        <Text className="text-lg font-semibold text-gray-900 mt-8 mb-2">Video</Text>

        {drill.visualReference ? (
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
