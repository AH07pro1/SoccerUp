import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import TagInput from '../components/forms/TagInput';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text className="text-sm text-white bg-red-500 px-3 py-2 rounded my-2">
      {message}
    </Text>
  );
}

const totalCards = 5; // Updated total cards to include date/time card

export default function CreateSessionScreen({ navigation, route }: any) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Initialize states from route.params or defaults
  const [sessionName, setSessionName] = useState(route.params?.sessionName ?? '');
  const [drills, setDrills] = useState<string[]>(route.params?.selectedDrills ?? []);
  const [objectives, setObjectives] = useState<string[]>(route.params?.objectives ?? []);
  const [materials, setMaterials] = useState<string[]>(route.params?.materials ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [sessionDate, setSessionDate] = useState<Date>(
    route.params?.sessionDate ? new Date(route.params.sessionDate) : new Date()
  );
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  // Track currentCard state, initialized from params or 0
  const [currentCard, setCurrentCard] = useState(route.params?.currentCard ?? 0);

  // Sync when route params change (for when navigating back)
  useEffect(() => {
    if (route.params?.sessionName !== undefined) setSessionName(route.params.sessionName);
    if (route.params?.selectedDrills) setDrills(route.params.selectedDrills);
    if (route.params?.objectives) setObjectives(route.params.objectives);
    if (route.params?.materials) setMaterials(route.params.materials);
    if (route.params?.sessionDate) setSessionDate(new Date(route.params.sessionDate));
    if (route.params?.currentCard !== undefined) setCurrentCard(route.params.currentCard);
  }, [
    route.params?.sessionName,
    route.params?.selectedDrills,
    route.params?.objectives,
    route.params?.materials,
    route.params?.sessionDate,
    route.params?.currentCard,
  ]);

  const goToCard = (index: number) => {
    if (index < 0 || index >= totalCards) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setCurrentCard(index);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  const removeDrill = (tagToRemove: string) => {
    setDrills((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Date picker handlers
  const handleConfirmDate = (date: Date) => {
    const updatedDate = new Date(sessionDate);
    updatedDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    setSessionDate(updatedDate);
    setDatePickerVisible(false);
  };

  const handleConfirmTime = (time: Date) => {
    const updatedDate = new Date(sessionDate);
    updatedDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    setSessionDate(updatedDate);
    setTimePickerVisible(false);
  };

  const handleSubmit = async () => {
  setErrors({});
  const sessionData = {
    sessionName,
    drills,
    objectives,
    materials,
    scheduledDate: sessionDate.toISOString(),
  };

  try {
    const response = await fetch('http://192.168.2.19:3000/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });

    const text = await response.text();
    console.log('session date', sessionData.scheduledDate);
    

    if (response.ok) {
      Alert.alert('Success', 'Session created!');
      navigation.navigate('Tabs', { screen: 'Home' });
    } else {
      const errorJson = JSON.parse(text);
      const newErrors: Record<string, string> = {};
      for (const field in errorJson.errors) {
        const fieldErrors = errorJson.errors[field]?._errors;
        if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
          newErrors[field] = fieldErrors[0];
        }
      }
      setErrors(newErrors);

      // Add alert here for server validation errors or other issues
      Alert.alert('Error', 'Failed to save session. Please check your input.');
    }
  } catch (err) {
    Alert.alert('Error', 'Network or server issue');
  }
};


  const renderCard = () => {
    switch (currentCard) {
      case 0:
        return (
          <View className="bg-gray-100 p-4 rounded-2xl mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Session Basics</Text>
            <Text className="text-sm text-gray-600 mb-1">Session Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              placeholder="e.g. Passing Session"
              value={sessionName}
              onChangeText={setSessionName}
              returnKeyType="next"
              onSubmitEditing={() => goToCard(1)}
              blurOnSubmit={false}
            />
            <ErrorText message={errors.sessionName} />
          </View>
        );

      case 1:
        return (
          <View className="bg-gray-100 p-4 rounded-2xl mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Select Drills</Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('DrillList', {
                  sessionName,
                  selectedDrills: drills,
                  objectives,
                  materials,
                  sessionDate: sessionDate.toISOString(),
                  currentCard,
                })
              }
              className="bg-blue-600 py-3 rounded-lg mb-4"
            >
              <Text className="text-white text-center font-semibold text-base">Choose Drills</Text>
            </TouchableOpacity>

            {drills.length > 0 ? (
              <View>
                {drills.map((tag, idx) => (
                  <View
                    key={idx}
                    className="flex-row justify-between items-center bg-green-500 px-4 py-3 rounded-lg mb-3"
                  >
                    <Text className="text-white font-semibold text-base">{tag}</Text>
                    <TouchableOpacity onPress={() => removeDrill(tag)}>
                      <Text className="text-white font-bold text-xl">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="text-gray-500 text-sm">No drills selected</Text>
            )}
            <ErrorText message={errors.drills} />
          </View>
        );

      case 2: // New schedule date & time card
        return (
          <View className="bg-gray-100 p-4 rounded-2xl mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">Schedule Date & Time</Text>

            <TouchableOpacity
              onPress={() => setDatePickerVisible(true)}
              className="bg-blue-600 py-3 rounded-lg mb-4"
            >
              <Text className="text-white text-center font-semibold text-base">Select Date</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTimePickerVisible(true)}
              className="bg-blue-600 py-3 rounded-lg mb-4"
            >
              <Text className="text-white text-center font-semibold text-base">Select Time</Text>
            </TouchableOpacity>

            <Text className="text-gray-700 mb-1">
              Selected Date: {sessionDate.toDateString()}
            </Text>
            <Text className="text-gray-700 mb-2">
              Selected Time: {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              date={sessionDate}
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisible(false)}
            />

            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              date={sessionDate}
              onConfirm={handleConfirmTime}
              onCancel={() => setTimePickerVisible(false)}
            />
          </View>
        );

      case 3:
        return (
          <View className="bg-gray-100 p-4 rounded-2xl mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">Objectives & Materials</Text>
            <TagInput label="Objectives" tags={objectives} setTags={setObjectives} />
            <ErrorText message={errors.objectives} />
            <View className="mt-4">
              <TagInput label="Materials" tags={materials} setTags={setMaterials} />
              <ErrorText message={errors.materials} />
            </View>
          </View>
        );

      case 4:
  return (
    <View className="bg-gray-100 p-6 rounded-2xl mb-6">
      <Text className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Session Overview
      </Text>

      <View className="mb-4">
        <Text className="text-gray-700">
          <Text className="font-bold">Name: </Text>
          {sessionName || 'Not Set'}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700">
          <Text className="font-bold">Drills: </Text>
          {drills.length > 0 ? drills.join(', ') : 'None'}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700">
          <Text className="font-bold">Objectives: </Text>
          {objectives.length > 0 ? objectives.join(', ') : 'None'}
        </Text>
      </View>

      <View className="mb-4">
        <Text className="text-gray-700">
          <Text className="font-bold">Materials: </Text>
          {materials.length > 0 ? materials.join(', ') : 'None'}
        </Text>
      </View>

      <View className="mt-6 pt-4 border-t border-gray-300">
        <Text className="text-gray-700">
          <Text className="font-bold">Scheduled for: </Text>
          {sessionDate.toLocaleString()}
        </Text>
      </View>
    </View>
  );


      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white px-5 pt-10"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* Progress Bar */}
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
          Create a Session
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
                <Text className="text-white font-semibold text-center">Save Session</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
