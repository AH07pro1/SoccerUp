import React, { useRef, useState, useEffect } from 'react';
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

export default function CreateDrillScreen({ navigation, route }: any) {
  const onDrillUpdated = route.params?.onDrillUpdated;
  const isEditMode = !!route.params?.drill;
const drillData = route.params?.drill;
const isSystemDrill = route.params?.isSystemDrill; // 👈 added
// const creatingVariant = isEditMode && isSystemDrill; // i remove this line so if you create a variant and update it, it will not create a new variant
const creatingVariant =
  isEditMode && isSystemDrill && !drillData?.basedOnName;

const sessionId = route.params?.sessionId;







  const [currentCard, setCurrentCard] = useState(0);

  const [drillName, setDrillName] = useState(drillData?.drillName ?? '');
  const [duration, setDuration] = useState(drillData?.duration?.toString() ?? '');
  const [restTime, setRestTime] = useState(drillData?.restTime?.toString() ?? '');
  const [drillCategory, setDrillCategory] = useState(drillData?.drillCategory ?? 'passing');
  const [numberOfSets, setNumberOfSets] = useState(drillData?.numberOfSets?.toString() ?? '');
  const [numberOfReps, setNumberOfReps] = useState(drillData?.numberOfReps?.toString() ?? '');
  const [materials, setMaterials] = useState(drillData?.materials?.join(', ') ?? '');
  const [visualReference, setVisualReference] = useState(drillData?.visualReference ?? '');
  const [description, setDescription] = useState(drillData?.description ?? '');

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

  useEffect(() => {
  if (route.params) {
    if (route.params.drillName !== undefined) setDrillName(route.params.drillName);
    if (route.params.duration !== undefined) setDuration(route.params.duration);
    if (route.params.numberOfSets !== undefined) setNumberOfSets(route.params.numberOfSets);
    if (route.params.numberOfReps !== undefined) setNumberOfReps(route.params.numberOfReps);
    if (route.params.restTime !== undefined) setRestTime(route.params.restTime);
    if (route.params.drillCategory !== undefined) setDrillCategory(route.params.drillCategory);
    if (route.params.materials !== undefined) setMaterials(route.params.materials);
    if (route.params.visualReference !== undefined) setVisualReference(route.params.visualReference);
    if (route.params.description !== undefined) setDescription(route.params.description);
    if (route.params.currentCard !== undefined) setCurrentCard(route.params.currentCard);
  }
}, [route.params]);

 const handleSubmit = async () => {
  setErrors({});
  const bodyData = {
    drillName,
    duration: duration !== '' ? Number(duration) : undefined,
    numberOfSets: numberOfSets !== '' ? Number(numberOfSets) : undefined,
    numberOfReps: numberOfReps !== '' ? Number(numberOfReps) : undefined,
    restTime: restTime !== '' ? Number(restTime) : undefined,
    drillCategory,
    materials: materials ? materials.split(',').map((m: any) => m.trim()) : [],
    description,
    visualReference: visualReference || null,
    createdByUser: creatingVariant || !isEditMode ? true : drillData.createdByUser,
    basedOnName: creatingVariant ? drillData?.drillName : undefined,
  };

  console.log('Submitting drill with data:', bodyData);
  console.log('Mode:', { isEditMode, creatingVariant });
  console.log('Drill ID:', drillData?.id);
  console.log('Session ID:', sessionId);

  try {
    Alert.alert('Check values', `Duration: ${duration}, Rest Time: ${restTime}`);

    const method = creatingVariant ? 'POST' : isEditMode ? 'PUT' : 'POST';
    const endpoint = creatingVariant
      ? `http://192.168.2.19:3000/api/drill`
      : isEditMode
        ? `http://192.168.2.19:3000/api/drill/${drillData.id}`
        : 'http://192.168.2.19:3000/api/drill';

    console.log('Fetch method:', method);
    console.log('Fetch endpoint:', endpoint);

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    console.log('Response status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.log('Error response text:', text);
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
          console.log('Parsed validation errors:', parsedErrors);
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

    const updatedDrill = await res.json();
    console.log('Updated drill from server:', updatedDrill);

    Alert.alert('Success', isEditMode ? 'Drill updated successfully' : 'Drill created successfully');

    if (isEditMode && onDrillUpdated) {
      console.log('Calling onDrillUpdated callback');
      onDrillUpdated(updatedDrill);
    }

    if (creatingVariant) {
      console.log('Creating variant - preparing to update session drill...');
      if (!sessionId) {
        Alert.alert('Error', 'Session ID missing, cannot update session drill');
        return;
      }

      console.log('Updating session drill:', { sessionId, drillId: drillData.id, updatedDrill });

      try {
        const updateRes = await fetch(
          `http://192.168.2.19:3000/api/session/${sessionId}/drill/${drillData.id}`, // original drill id here
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedDrill), // send updated drill data to replace old one
          }
        );

        console.log('Session drill update response status:', updateRes.status);

        if (!updateRes.ok) {
          Alert.alert('Warning', 'Variant created but failed to update session drill');
        } else {
          console.log('Session drill updated successfully');
        }
      } catch (err) {
        console.error('Failed to update session drill:', err);
        Alert.alert('Warning', 'Variant created but failed to update session drill');
      }

      navigation.navigate('DrillDetail', { drill: updatedDrill });
    } else {
      navigation.goBack();
    }
  } catch (err) {
    console.error('Network error during submit:', err);
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
        <Text className="text-3xl font-bold text-green-600 mb-6 text-center">
          {isEditMode ? 'Edit Drill' : 'New Drill'}
        </Text>

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
