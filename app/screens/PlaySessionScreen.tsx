import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Vibration, 
  Animated,
} from 'react-native';
import * as Speech from 'expo-speech';

type Drill = {
  drillName: string;
  duration: number; // minutes
};

export default function SessionPlayerScreen({ route, navigation }: any) {
  const drills: Drill[] = route?.params?.drills || [];

  const restDuration = 10; // rest in seconds

  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(
    drills.length > 0 ? drills[0].duration * 60 : 0
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Animated progress value 0 to 1
  const progressAnim = useRef(new Animated.Value(0)).current;

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { rate: 0.9 });
  };

  // Announce drill/rest start
  useEffect(() => {
    if (isResting) {
      speak(`Rest for ${restDuration} seconds`);
    } else if (drills[currentDrillIndex]) {
      speak(`Start ${drills[currentDrillIndex].drillName} for ${drills[currentDrillIndex].duration} minutes`);
    }
    // Reset progress animation
    progressAnim.setValue(0);
  }, [currentDrillIndex, isResting]);

  // Timer effect
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (intervalRef.current) return; // Already running

    intervalRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          handleDrillEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, currentDrillIndex, isResting]);

  // Animate progress bar smoothly
  useEffect(() => {
    const totalDuration = isResting ? restDuration : drills[currentDrillIndex]?.duration * 60 || 1;
    const elapsed = totalDuration - secondsRemaining;

    Animated.timing(progressAnim, {
      toValue: elapsed / totalDuration,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [secondsRemaining]);

  const handleDrillEnd = () => {
    Vibration.vibrate(500);

    if (isResting) {
      // After rest, move to next drill or finish
      if (currentDrillIndex + 1 < drills.length) {
        setCurrentDrillIndex((idx) => {
          setIsResting(false);
          setSecondsRemaining(drills[idx + 1].duration * 60);
          return idx + 1;
        });
      } else {
        speak("Session complete. Good job!");
        navigation.goBack();
      }
    } else {
      // Start rest period
      setIsResting(true);
      setSecondsRemaining(restDuration);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
  };

  const handleSkip = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isResting) {
      // Skip rest, go to next drill or finish
      if (currentDrillIndex + 1 < drills.length) {
        setIsResting(false);
        setCurrentDrillIndex((idx) => {
          setSecondsRemaining(drills[idx + 1].duration * 60);
          return idx + 1;
        });
      } else {
        speak("Session complete. Good job!");
        navigation.goBack();
      }
    } else {
      // Skip drill, go to rest period
      setIsResting(true);
      setSecondsRemaining(restDuration);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const nextDrillName =
    !isResting && currentDrillIndex + 1 < drills.length
      ? drills[currentDrillIndex + 1].drillName
      : null;

  if (!drills || drills.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-lg text-red-600 font-semibold">No drills to play</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 px-6 py-3 bg-green-600 rounded-lg"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-center text-3xl font-bold text-green-600 mb-6">
        {isResting ? 'Rest' : drills[currentDrillIndex].drillName}
      </Text>

      <Text className="text-center text-5xl font-bold text-gray-800 mb-2">
        {formatTime(secondsRemaining)}
      </Text>

      {nextDrillName && (
        <Text className="text-center text-gray-600 mb-6">
          Next: {nextDrillName}
        </Text>
      )}

      {/* Progress Bar */}
      <View className="h-4 bg-gray-200 rounded-full overflow-hidden mb-8">
        <Animated.View
          className="bg-green-500 h-full"
          style={{
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      <View className="flex-row justify-around mt-6">
        <TouchableOpacity
          onPress={handlePauseResume}
          className="bg-yellow-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold text-lg">
            {isPaused ? 'Resume' : 'Pause'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          className="bg-gray-400 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold text-lg">Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
