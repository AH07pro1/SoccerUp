import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Pressable,
  Vibration,
  Platform,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Speech from 'expo-speech';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

// Configure Reanimated Logger (optional)
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Drill = {
  drillName: string;
  duration: number; // in minutes
  restTime: number; // in seconds
};

export default function SessionPlayerScreen({ route, navigation }: any) {
  const drills: Drill[] = route?.params?.drills || [];

  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [secondsElapsed, setSecondsElapsed] = useState(0); // Track elapsed seconds on current segment
  const [isPaused, setIsPaused] = useState(false);
  const [isResting, setIsResting] = useState(false);

  const [voiceOnlyMode, setVoiceOnlyMode] = useState(false);
  const [lockScreenMode, setLockScreenMode] = useState(false);

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
    drills.reduce((sum, d) => sum + d.duration * 60 + d.restTime, 0) -
    (drills.at(-1)?.restTime || 0);

  useEffect(() => {
    // Start immediately (no preview countdown)
    if (drills.length > 0) startDrill(drills[0].duration * 60);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
  if (drills.length === 0) return;

  if (isPaused) return; // don't start timer if paused

  if (isResting) {
    startRest();
  } else {
    startDrill(drills[currentDrillIndex].duration * 60);
  }
}, [currentDrillIndex, isResting, isPaused]);

  const tickGlobalProgress = () => {
    globalProgress.value = withTiming(
      globalProgress.value + 1 / totalSessionSeconds,
      { duration: 1000, easing: Easing.linear }
    );
  };

  const vibrateSafe = (duration: number | number[]) => {
    // Vibrate only if supported and on device (not iOS simulator)
    if (Platform.OS === 'android' || (Platform.OS === 'ios' && !isSimulator())) {
      Vibration.vibrate(duration);
    }
  };

  const isSimulator = () => {
    // Very basic simulator check, can be improved
    return Platform.OS === 'ios' && !('vibrate' in navigator);
  };

  const startDrill = (duration: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsResting(false);
    setSecondsRemaining(duration);
    setSecondsElapsed(0);

    progress.value = 0;

    if (!voiceOnlyMode) {
      progress.value = withTiming(1, {
        duration: duration * 1000,
        easing: Easing.linear,
      });
    }

    vibrateSafe(300); // Vibration on drill start
     Speech.stop();
    Speech.speak(`Start drill: ${drills[currentDrillIndex]?.drillName}`);

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        tickGlobalProgress();

        setSecondsElapsed((elapsed) => elapsed + 1);

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
    setIsResting(true); // move to rest
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
    setSecondsElapsed(0);

    progress.value = 0;

    if (!voiceOnlyMode) {
      progress.value = withTiming(1, {
        duration: restTime * 1000,
        easing: Easing.linear,
      });
    }

    vibrateSafe(200); // Vibration on rest start
    Speech.stop();
    Speech.speak("Rest now");
    const nextDrillName = drills[currentDrillIndex + 1]?.drillName;
    if (nextDrillName) {
      Speech.speak(`Next drill: ${nextDrillName}`);
    }

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        tickGlobalProgress();

        setSecondsElapsed((elapsed) => elapsed + 1);

        if (next <= 0) {
  clearInterval(intervalRef.current!);

  if (currentDrillIndex < drills.length) {
    setIsResting(false);
    // startDrill will be triggered by useEffect on [currentDrillIndex, isResting]
  } else {
    endSession();
  }
  return 0;
}

        return next;
      });
    }, 1000);
  };

  const endSession = () => {
    vibrateSafe([100, 100, 300]); // Vibration pattern on session end
    Speech.speak('Session complete');
    navigation.replace('SessionComplete', {
      totalDrills: drills.length,
      totalTimeSeconds: totalSessionSeconds,
      drills,
    });
  };

  const handlePauseResume = () => {
    if (lockScreenMode) {
      Speech.speak('Screen is locked. Unlock to interact.');
      return;
    }
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
    if (lockScreenMode) {
      Speech.speak('Screen is locked. Unlock to skip.');
      Alert.alert('Locked', 'Skipping is disabled in lock screen mode.');
      return;
    }

    if (voiceOnlyMode) {
      Speech.speak('Skipping is disabled in voice only mode.');
      return;
    }

   if (isResting) {
  Alert.alert('Skip Rest?', 'Skip current rest period?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Yes',
      onPress: () => {
        if (intervalRef.current) clearInterval(intervalRef.current);

        vibrateSafe(150);
        progress.value = withTiming(1, { duration: 200 });

        setIsResting(false);
        setSecondsElapsed(0);

        // DO NOT manually increase currentDrillIndex here,
        // the effect above will handle starting the drill with the current drill index
      },
    },
  ]);
}
else {
      const drillDurationSeconds = drills[currentDrillIndex].duration * 60;
      if (secondsElapsed < drillDurationSeconds / 2) {
        Speech.speak('You need to complete at least 50% of the drill before skipping.');
        Alert.alert(
          'Skip Not Allowed',
          'You need to complete at least 50% of the drill before skipping.'
        );
        return;
      }

      Alert.alert('Skip Drill?', 'Skip current drill?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            if (intervalRef.current) clearInterval(intervalRef.current);

            vibrateSafe(150); // Vibration on skip drill

            // Calculate remaining drill + rest time for global progress
            const restTime = drills[currentDrillIndex]?.restTime || 0;
            const remainingDrillSeconds = drillDurationSeconds - secondsElapsed;

            globalProgress.value = Math.min(
              1,
              globalProgress.value + (1 / totalSessionSeconds) * (remainingDrillSeconds + restTime)
            );

            progress.value = withTiming(1, { duration: 200 });

            setTimeout(() => {
              const nextIndex = currentDrillIndex + 1;
              if (nextIndex < drills.length) {
                setCurrentDrillIndex(nextIndex);
                startRest();
              } else {
                endSession();
              }
            }, 250);
          },
        },
      ]);
    }
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
    <>
      <View className="flex-1 bg-white justify-center items-center px-6 pt-4">
        {/* Global Progress Bar */}
        <View className="w-full mb-4">
          <View className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            {!voiceOnlyMode && (
              <Animated.View
                style={{
                  height: 16,
                  width: `${globalProgress.value * 100}%`,
                  backgroundColor: '#10b981',
                }}
              />
            )}
          </View>
          <Text className="text-right mt-1 text-sm text-gray-500">{getGlobalPercent()}</Text>
        </View>

        {!voiceOnlyMode && (
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
          </>
        )}

        {voiceOnlyMode && (
          <Text className="text-center text-lg text-gray-700 mb-12">
            Voice-only mode enabled. Timer is hidden.
          </Text>
        )}

        <Text className="text-base text-gray-600 mt-2 w-full text-center">
          Next: {drills[currentDrillIndex + 1]?.drillName || 'Session complete'}
        </Text>

        <View className="flex-row justify-around w-full mt-10">
          <TouchableOpacity
            onPress={handlePauseResume}
            disabled={lockScreenMode}
            className={`px-6 py-3 rounded-lg mx-2 ${
              lockScreenMode ? 'bg-gray-400' : 'bg-yellow-500'
            }`}
          >
            <Text className="text-white font-bold text-lg">
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSkip}
            disabled={lockScreenMode}
            className={`px-6 py-3 rounded-lg mx-2 ${
              lockScreenMode ? 'bg-gray-400' : 'bg-gray-500'
            }`}
          >
            <Text className="text-white font-bold text-lg">Skip</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-8 space-x-4 w-full">
          <TouchableOpacity
            onPress={() => setVoiceOnlyMode((prev) => !prev)}
            disabled={lockScreenMode}
            className={`px-4 py-2 rounded-lg border ${
              voiceOnlyMode ? 'border-green-600 bg-green-100' : 'border-gray-400'
            }`}
          >
            <Text
              className={`font-semibold ${
                voiceOnlyMode ? 'text-green-700' : 'text-gray-600'
              }`}
            >
              Voice Only Mode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLockScreenMode((prev) => !prev)}
            className={`px-4 py-2 rounded-lg border ${
              lockScreenMode ? 'border-red-600 bg-red-100' : 'border-gray-400'
            }`}
          >
            <Text
              className={`font-semibold ${
                lockScreenMode ? 'text-red-700' : 'text-gray-600'
              }`}
            >
              {lockScreenMode ? 'Unlock Screen' : 'Lock Screen'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay to disable touches in lock screen mode */}
     {lockScreenMode && (
  <View className="absolute inset-0 bg-black/40 justify-center items-center">
    <Text className="text-white text-lg mb-4">Screen is locked</Text>
    <TouchableOpacity
      onPress={() => {
  Vibration.vibrate(100);
  Speech.speak('Screen unlocked');
  setLockScreenMode(false);
}}

      className="bg-white px-6 py-3 rounded-lg"
    >
      <Text className="text-gray-800 font-semibold">Unlock</Text>
    </TouchableOpacity>
  </View>
)}

    </>
  );
}
