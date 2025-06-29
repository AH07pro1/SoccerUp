import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
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
  duration: number; // in minutes
  restTime: number; // in seconds
};

export default function SessionPlayerScreen({ route, navigation }: any) {
  const drills: Drill[] = route?.params?.drills || [];
  console.log('Drills:', drills);

  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const size = 220;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = useSharedValue(0);
  const globalProgress = useSharedValue(0);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const totalSessionSeconds =
    drills.reduce((sum, d) => sum + d.duration * 60 + d.restTime, 0) - (drills.at(-1)?.restTime || 0);

  useEffect(() => {
    if (showCountdown) {
      if (countdown > 0) {
        Speech.speak(`${countdown}`);
        const countdownTimer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1300);
        return () => clearTimeout(countdownTimer);
      } else {
        Speech.speak('Start session');
        const startTimer = setTimeout(() => {
          setShowCountdown(false);
          startDrill(drills[0].duration * 60);
        }, 2000);
        return () => clearTimeout(startTimer);
      }
    }
  }, [countdown, showCountdown]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const tickGlobalProgress = () => {
    globalProgress.value = withTiming(
      globalProgress.value + 1 / totalSessionSeconds,
      { duration: 1000, easing: Easing.linear }
    );
  };

  const startDrill = (duration: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsResting(false);
    setSecondsRemaining(duration);
    progress.value = 0;

    progress.value = withTiming(1, {
      duration: duration * 1000,
      easing: Easing.linear,
    });

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        tickGlobalProgress();

        if (next === Math.floor(duration / 2)) {
          Speech.speak("You're halfway there!");
        }

        if (next === 10) {
          Speech.speak("10 seconds left!");
        }

        if (next <= 0) {
          clearInterval(intervalRef.current!);

          const nextIndex = currentDrillIndex + 1;
          if (nextIndex < drills.length) {
            setCurrentDrillIndex(nextIndex);
            startRest();
          } else {
            endSession();
          }
          return 0;
        }

        return next;
      });
    }, 1000);
  };

  const startRest = () => {
    const restTime = drills[currentDrillIndex]?.restTime || 0;

    setIsResting(true);
    setSecondsRemaining(restTime);
    progress.value = 0;

    Speech.speak("Rest now");
    const nextDrillName = drills[currentDrillIndex + 1]?.drillName;
    if (nextDrillName) {
      Speech.speak(`Next drill: ${nextDrillName}`);
    }

    progress.value = withTiming(1, {
      duration: restTime * 1000,
      easing: Easing.linear,
    });

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        tickGlobalProgress();

        if (next <= 0) {
          clearInterval(intervalRef.current!);
          startDrill(drills[currentDrillIndex].duration * 60);
          return 0;
        }

        return next;
      });
    }, 1000);
  };

  const endSession = () => {
    Speech.speak('Session complete');
    navigation.replace('SessionComplete', {
      totalDrills: drills.length,
      totalTimeSeconds: totalSessionSeconds,
      drills,
    });
  };

  const handlePauseResume = () => {
    if (isPaused) {
      if (isResting) startRest();
      else startDrill(secondsRemaining);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      progress.value = withTiming(progress.value, { duration: 0 });
    }
    setIsPaused((prev) => !prev);
  };

  const handleSkip = () => {
    Alert.alert('Skip?', 'Skip current segment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => {
          if (intervalRef.current) clearInterval(intervalRef.current);

          const segmentDuration = isResting
            ? drills[currentDrillIndex]?.restTime || 0
            : drills[currentDrillIndex]?.duration * 60;

          globalProgress.value = Math.min(
            1,
            globalProgress.value + 1 / totalSessionSeconds * segmentDuration
          );

          progress.value = withTiming(1, { duration: 200 });

          setTimeout(() => {
            const nextIndex = currentDrillIndex + 1;
            if (isResting) {
              startDrill(drills[currentDrillIndex].duration * 60);
            } else if (nextIndex < drills.length) {
              setCurrentDrillIndex(nextIndex);
              startRest();
            } else {
              endSession();
            }
          }, 250);
        },
      },
    ]);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getGlobalPercent = () =>
    `${Math.min(100, Math.round(globalProgress.value * 100))}%`;

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
    <View className="flex-1 bg-white justify-center items-center px-6 pt-4">
      <View className="w-full mb-4">
        <View className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <Animated.View
            style={{
              height: 16,
              width: `${globalProgress.value * 100}%`,
              backgroundColor: '#10b981',
            }}
          />
        </View>
        <Text className="text-right mt-1 text-sm text-gray-500">{getGlobalPercent()}</Text>
      </View>

      {showCountdown ? (
        <Text className="text-6xl font-bold text-green-600">
          {countdown > 0 ? countdown : 'Start!'}
        </Text>
      ) : (
        <>
          <Text className="text-xl text-gray-700 mb-1 text-center">
            {isResting ? 'Rest' : drills[currentDrillIndex].drillName}
          </Text>

          <Text className="text-sm text-gray-500 mb-2 text-center">
            Drill {currentDrillIndex + 1} of {drills.length}
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
            <Text
              style={{
                position: 'absolute',
                fontSize: 48,
                fontWeight: 'bold',
                color: '#111827',
              }}
            >
              {formatTime(secondsRemaining)}
            </Text>
          </View>

          <Text className="text-base text-gray-600 mt-2 w-full text-center">
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
