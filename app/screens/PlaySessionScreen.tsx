import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Vibration } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Drill = {
  drillName: string;
  duration: number;
};

export default function SessionPlayerScreen({ route, navigation }: any) {
  const drills: Drill[] = route?.params?.drills || [];
  console.log('Drills:', drills);
  const restDuration = 10;

  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progress Circle Constants
  const size = 220;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  // Handle countdown before session starts
  useEffect(() => {
    if (showCountdown) {
      if (countdown > 0) {
        Speech.speak(`${countdown}`);
        const countdownTimer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1300); // slowed down for better visibility
        return () => clearTimeout(countdownTimer);
      } else {
        Speech.speak('Start session');
        // Show "Start!" for 2 seconds before starting drills
        const startTimer = setTimeout(() => {
          setShowCountdown(false);
          startDrill(drills[0].duration * 60);
        }, 2000);
        return () => clearTimeout(startTimer);
      }
    }
  }, [countdown, showCountdown]);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startDrill = (duration: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsRemaining(duration);
    progress.value = 0; // reset progress immediately

    // Animate progress smoothly over the duration
    progress.value = withTiming(1, {
      duration: duration * 1000,
      easing: Easing.linear,
    });

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleDrillEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDrillEnd = () => {
    Vibration.vibrate(500);
    if (isResting) {
      if (currentDrillIndex + 1 < drills.length) {
        const nextDrill = drills[currentDrillIndex + 1];
        Speech.speak(`Next: ${nextDrill.drillName}`);
        setCurrentDrillIndex((prev) => prev + 1);
        setIsResting(false);
        startDrill(nextDrill.duration * 60);
      } else {
        Speech.speak('Session complete');

        // Calculate total drills and total time including rests
        const totalDrills = drills.length;
        const totalTimeSeconds =
          drills.reduce((sum, d) => sum + d.duration * 60, 0) +
          restDuration * (drills.length - 1);

        // Navigate to SessionComplete screen with summary data
        navigation.replace('SessionComplete', { totalDrills, totalTimeSeconds });
      }
    } else {
      Speech.speak('Rest now');
      setIsResting(true);
      startDrill(restDuration);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume timer and progress animation
      startDrill(secondsRemaining);
    } else {
      // Pause timer and stop progress animation
      if (intervalRef.current) clearInterval(intervalRef.current);
      progress.value = withTiming(progress.value, { duration: 0 }); // freeze animation
    }
    setIsPaused((prev) => !prev);
  };

  const handleSkip = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    // Quickly animate progress to 100% to avoid jitter
    progress.value = withTiming(1, { duration: 200 });
    // Small delay before ending drill so animation completes
    setTimeout(() => {
      handleDrillEnd();
    }, 250);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

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
    <View className="flex-1 bg-white justify-center items-center px-6">
      {showCountdown ? (
        <Text className="text-6xl font-bold text-green-600">
          {countdown > 0 ? countdown : 'Start!'}
        </Text>
      ) : (
        <>
          <Text className="text-center text-xl text-gray-700 mb-2">
            {isResting ? 'Rest' : drills[currentDrillIndex].drillName}
          </Text>

          <View
            style={{
              width: size,
              height: size,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Svg width={size} height={size}>
              <Circle
                stroke="#e5e7eb"
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
              />
              <AnimatedCircle
                stroke="#10b981"
                fill="none"
                cx={size / 2}
                cy={size / 2}
                r={radius}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                animatedProps={animatedProps}
                strokeLinecap="round"
              />
            </Svg>
            {/* Timer text centered inside circle */}
            <Text
              style={{
                position: 'absolute',
                fontSize: 48,
                fontWeight: 'bold',
                color: '#111827', // gray-900
              }}
            >
              {formatTime(secondsRemaining)}
            </Text>
          </View>

          <Text className="text-lg text-gray-600 mt-4 w-full text-center">
            Next: {drills[currentDrillIndex + 1]?.drillName || 'Session complete'}
          </Text>

          <View className="flex-row justify-around w-full mt-10">
            <TouchableOpacity
              onPress={handlePauseResume}
              className="bg-yellow-500 px-6 py-3 rounded-lg mx-2"
            >
              <Text className="text-white font-bold text-lg">
                {isPaused ? 'Resume' : 'Pause'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              className="bg-gray-500 px-6 py-3 rounded-lg mx-2"
            >
              <Text className="text-white font-bold text-lg">Skip</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
