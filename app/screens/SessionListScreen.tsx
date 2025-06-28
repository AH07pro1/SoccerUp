import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

type RawSession = {
  id: number;
  sessionName: string;
  objectives: string[];
  scheduledDate: string;  // <-- use scheduledDate here
};

type Session = {
  id: number;
  title: string;
  date: string;
  objective: string;
};

type Section = {
  title: string;
  data: Session[];
};

export default function SessionListScreen({ navigation }: any) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    async function fetchSessions() {
      setLoading(true);
      try {
        const response = await fetch('http://192.168.2.19:3000/api/session');
        const data: RawSession[] = await response.json();

        const formatted: Session[] = data.map((session) => ({
          id: session.id,
          title: session.sessionName,
          date: session.scheduledDate.split('T')[0], // <-- group by scheduledDate here
          objective: session.objectives.join(', '),
        }));

        setSessions(formatted);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, [isFocused]);

  const groupedSessions: Section[] = sessions.reduce((acc: Section[], session) => {
    const sectionIndex = acc.findIndex((s) => s.title === session.date);
    if (sectionIndex !== -1) {
      acc[sectionIndex].data.push(session);
    } else {
      acc.push({ title: session.date, data: [session] });
    }
    return acc;
  }, []);

  groupedSessions.sort((a, b) => a.title.localeCompare(b.title));

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#22c55e" />
        <Text className="mt-2 text-gray-600">Loading sessions...</Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-gray-500 text-lg text-center">No sessions available.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4" style={{ marginTop: 40 }}>
        <Text className="text-3xl font-bold text-gray-900">Upcoming Sessions</Text>
      </View>

      <SectionList
        sections={groupedSessions}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        renderSectionHeader={({ section }) => (
          <View className="bg-gray-200 px-4 py-2 rounded-lg my-3">
            <Text className="text-lg font-semibold text-gray-700">{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('SessionDetail', { sessionId: item.id })}
            activeOpacity={0.7}
            className="bg-green-50 rounded-2xl p-4 mb-3 border border-green-300"
          >
            <Text className="text-xl font-bold text-green-800 mb-1">{item.title}</Text>
            <Text className="text-green-700 text-sm">🎯 {item.objective || 'No objectives'}</Text>
          </TouchableOpacity>
        )}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}
