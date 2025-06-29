import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text className="text-sm text-white bg-red-500 px-3 py-2 rounded my-2">
      {message}
    </Text>
  );
}

const totalCards = 3;

export default function CreateDrillScreen({ navigation }: any) {
  const [currentCard, setCurrentCard] = useState(0);

  const [drillName, setDrillName] = useState('');
  const [duration, setDuration] = useState('');
  const [restTime, setRestTime] = useState('');
  const [drillCategory, setDrillCategory] = useState('passing');

  const [numberOfSets, setNumberOfSets] = useState('');
  const [numberOfReps, setNumberOfReps] = useState('');

  const [materials, setMaterials] = useState('');
  const [visualReference, setVisualReference] = useState('');
  const [description, setDescription] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToCard = (index: number) => {
    if (index < 0 || index >= totalCards) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentCard(index);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSubmit = async () => {
    setErrors({});
    const bodyData = {
      drillName,
      duration: Number(duration),
      numberOfSets: Number(numberOfSets),
      numberOfReps: Number(numberOfReps),
      restTime: Number(restTime),
      drillCategory,
      materials: materials ? materials.split(',').map((m) => m.trim()) : [],
      description,
      visualReference: visualReference || null,
      createdByUser: true,
    };

    try {
      const res = await fetch('http://192.168.2.19:3000/api/drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const text = await res.text();

      if (!res.ok) {
        try {
          const errorData = JSON.parse(text);
          if (errorData.errors) {
            const parsedErrors: Record<string, string> = {};
            for (const key in errorData.errors) {
              const errs = errorData.errors[key]?._errors;
              if (Array.isArray(errs) && errs.length > 0) {
                parsedErrors[key] = errs[0];
              }
            }
            setErrors(parsedErrors);
            return;
          }
          const errorMessage = errorData.error || 'Failed to create drill';
          Alert.alert('Error', errorMessage);
        } catch {
          Alert.alert('Error', 'Unexpected server error');
        }
        return;
      }

      Alert.alert('Success', 'Drill created successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Network error, try again later');
    }
  };

  const renderCard = () => {
    switch (currentCard) {
      case 0:
        return (
          <View className="bg-gray-100 p-4 rounded-2xl mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Basics</Text>

            <Text className="text-sm text-gray-600 mb-1">Drill Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              placeholder="e.g. Cone Weave"
              value={drillName}
              onChangeText={setDrillName}
              returnKeyType="next"
              onSubmitEditing={() => goToCard(1)}
              blurOnSubmit={false}
            />
            <ErrorText message={errors.drillName} />

            <Text className="text-sm text-gray-600 mb-1">Duration (min)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              placeholder="e.g. 5"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
              returnKeyType="next"
              onSubmitEditing={() => goToCard(1)}
              blurOnSubmit={false}
            />
            <ErrorText message={errors.duration} />

            <Text className="text-sm text-gray-600 mb-1">Category</Text>
            <Picker
              selectedValue={drillCategory}
              onValueChange={setDrillCategory}
              style={{ marginBottom: 8 }}
            >
              <Picker.Item label="Passing" value="passing" />
              <Picker.Item label="Shooting" value="shooting" />
              <Picker.Item label="Dribbling" value="dribbling" />
              <Picker.Item label="Defending" value="defending" />
              <Picker.Item label="Goalkeeping" value="goalkeeping" />
              <Picker.Item label="Fitness" value="fitness" />
            </Picker>
          </View>
        );

      case 1:
        return (
          <View className="bg-gray-100 p-4 rounded-2xl mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Repetitions & Rest</Text>

            <Text className="text-sm text-gray-600 mb-1">Number of Sets</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              placeholder="e.g. 3"
              keyboardType="numeric"
              value={numberOfSets}
              onChangeText={setNumberOfSets}
              returnKeyType="next"
              onSubmitEditing={() => goToCard(2)}
              blurOnSubmit={false}
            />
            <ErrorText message={errors.numberOfSets} />

            <Text className="text-sm text-gray-600 mb-1">Number of Reps</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              placeholder="e.g. 10"
              keyboardType="numeric"
              value={numberOfReps}
              onChangeText={setNumberOfReps}
              returnKeyType="next"
              onSubmitEditing={() => goToCard(2)}
              blurOnSubmit={false}
            />
            <ErrorText message={errors.numberOfReps} />

            <Text className="text-sm text-gray-600 mb-1">Rest Time (in seconds)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              placeholder="e.g. 30"
              keyboardType="numeric"
              value={restTime}
              onChangeText={setRestTime}
              returnKeyType="done"
            />
            <ErrorText message={errors.restTime} />
          </View>
        );

      case 2:
        return (
          <View className="bg-gray-100 p-4 rounded-2xl mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Details</Text>

            <Text className="text-sm text-gray-600 mb-1">Materials (comma separated)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              placeholder="e.g. cones, balls"
              value={materials}
              onChangeText={setMaterials}
            />

            <Text className="text-sm text-gray-600 mb-1">Visual Reference (optional)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              placeholder="https://youtube.com/..."
              value={visualReference}
              onChangeText={setVisualReference}
            />

            <Text className="text-sm text-gray-600 mb-1">Description</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-white mb-2"
              placeholder="Describe the drill step-by-step"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <ErrorText message={errors.description} />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      className="flex-1 bg-white px-5 pt-10"
      keyboardVerticalOffset={80}
    >
      <View className="w-full mb-6">
        <View className="bg-gray-200 rounded-full h-4">
          <View
            style={{ width: `${((currentCard + 1) / totalCards) * 100}%` }}
            className="bg-green-500 h-4 rounded-full"
          />
        </View>
        <Text className="text-sm text-gray-500 mt-2 text-center">
          Step {currentCard + 1} of {totalCards}
        </Text>
      </View>

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <Text className="text-3xl font-bold text-green-600 mb-6 text-center">New Drill</Text>

        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {renderCard()}

          <View className="flex-row justify-between">
            {currentCard > 0 && (
              <TouchableOpacity
                onPress={() => goToCard(currentCard - 1)}
                className="bg-gray-300 px-6 py-3 rounded-lg"
              >
                <Text className="text-gray-700 font-semibold">Back</Text>
              </TouchableOpacity>
            )}

            {currentCard < totalCards - 1 && (
              <TouchableOpacity
                onPress={() => goToCard(currentCard + 1)}
                className="bg-green-600 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Next</Text>
              </TouchableOpacity>
            )}

            {currentCard === totalCards - 1 && (
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-green-600 px-6 py-3 rounded-lg flex-1 ml-2"
              >
                <Text className="text-white font-semibold text-center">Save Drill</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
