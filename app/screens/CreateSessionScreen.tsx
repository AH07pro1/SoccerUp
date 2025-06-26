import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import TagInput from '../components/forms/TagInput';

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Text
      style={{
        color: 'white',
        backgroundColor: 'red',
        padding: 6,
        marginTop: 4,
        marginBottom: 16,
      }}
    >
      {message}
    </Text>
  );
}

export default function CreateSessionScreen({ navigation, route }: any) {
  const [sessionName, setSessionName] = useState('');
  const [drills, setDrills] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (route.params?.selectedDrills) {
      setDrills(route.params.selectedDrills); // this is now array of drill names (strings)
    }
  }, [route.params?.selectedDrills]);

  const removeDrill = (tagToRemove: string) => {
    setDrills((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    setErrors({});
    const sessionData = { sessionName, drills, objectives, materials };

    try {
      const response = await fetch('http://192.168.2.19:3000/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });

      const text = await response.text();

      if (response.ok) {
        const json = JSON.parse(text);

        navigation.goBack();
      } else {
        try {
          const errorJson = JSON.parse(text);

          if (errorJson.errors && typeof errorJson.errors === 'object') {
            const newErrors: Record<string, string> = {};

            for (const field in errorJson.errors) {
              if (field === '_errors') continue;
              const fieldErrors = errorJson.errors[field]?._errors;
              if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                newErrors[field] = fieldErrors[0]; // take the first error
              }
            }

            setErrors(newErrors);
          } else if (errorJson.error) {
            // handle generic error if needed
          }
        } catch (err) {
          console.warn('Error parsing JSON error response', err);
        }
      }
    } catch (err) {
      console.warn('Network or fetch error:', err);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white px-6 pt-10"
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          textAlign: 'center',
          color: '#22c55e',
          marginBottom: 32,
        }}
      >
        Create a New Session
      </Text>

      {/* Session Name */}
      <Text
        style={{
          fontWeight: '600',
          marginBottom: 6,
          fontSize: 16,
          color: '#374151',
        }}
      >
        Session Name
      </Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: errors.sessionName ? 'red' : '#d1d5db',
          borderRadius: 8,
          padding: 12,
          marginBottom: errors.sessionName ? 0 : 16,
        }}
        placeholder="Enter session name"
        value={sessionName}
        onChangeText={setSessionName}
      />
      <ErrorText message={errors.sessionName} />

      {/* Drills with button */}
      <View style={{ marginBottom: 20 }}>
        {/* Label and Button Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text
            style={{ fontWeight: '600', fontSize: 16, color: '#374151' }}
          >
            Drills
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('DrillList')}
            style={{
              backgroundColor: '#2563eb', // blue-600
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>
              View Drills
            </Text>
          </TouchableOpacity>
        </View>

        {/* Drills read-only tags with remove button */}
        <View>
          <Text
            style={{
              color: '#374151',
              marginBottom: 8,
              fontWeight: '600',
            }}
          >
            Selected Drills
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {drills.length > 0 ? (
              drills.map((tag, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#22c55e',
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    marginRight: 8,
                    marginBottom: 8,
                    minWidth: 100,
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600' }}>{tag}</Text>
                  <TouchableOpacity
                    onPress={() => removeDrill(tag)}
                    style={{
                      marginLeft: 12,
                      padding: 4,
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: 16,
                        lineHeight: 16,
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{ color: '#6b7280' }}>No drills selected</Text>
            )}
          </View>
        </View>

        <ErrorText message={errors.drills} />
      </View>

      {/* Objectives */}
      <View style={{ marginBottom: 20 }}>
        <TagInput label="Objectives" tags={objectives} setTags={setObjectives} />
        <ErrorText message={errors.objectives} />
      </View>

      {/* Materials */}
      <View style={{ marginBottom: 32 }}>
        <TagInput label="Required Materials" tags={materials} setTags={setMaterials} />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#22c55e',
          paddingVertical: 16,
          borderRadius: 9999,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
          marginBottom: 48,
        }}
        activeOpacity={0.8}
        onPress={handleSubmit}
      >
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            fontSize: 18,
            fontWeight: '600',
          }}
        >
          Save Session
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
