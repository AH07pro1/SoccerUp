import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  SectionList,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

type RawSession = {
  id: number;
  sessionName: string;
  objectives: string[];
  scheduledDate: string;
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
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'week' | 'month' | 'previous' | 'all'>('week');
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
          date: session.scheduledDate.split('T')[0],
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

  useEffect(() => {
    const now = new Date();
    const filtered: Session[] = sessions.filter((session) => {
      const d = new Date(session.date);
      switch (filter) {
        case 'week': {
          const start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return d >= start && d <= end;
        }
        case 'month':
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        case 'previous': {
          const prevMonth = new Date(now);
          prevMonth.setMonth(now.getMonth() - 1);
          return d.getMonth() === prevMonth.getMonth() && d.getFullYear() === prevMonth.getFullYear();
        }
        case 'all':
          return true;
      }
    });

    // Group sessions by appropriate criteria
    const grouped: Record<string, Session[]> = {};

    filtered.forEach((session) => {
      const d = new Date(session.date);

      let key = '';
      if (filter === 'week') {
        key = d.toLocaleDateString('en-US', { weekday: 'long' }); // Monday, Tuesday...
      } else if (filter === 'month' || filter === 'previous') {
        const weekOfMonth = Math.floor((d.getDate() - 1) / 7) + 1;
        key = `Week ${weekOfMonth}`;
      } else if (filter === 'all') {
        key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // March 2024
      }

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(session);
    });

    const sections: Section[] = Object.entries(grouped)
      .map(([title, data]) => ({
        title,
        data: data.sort((a, b) => a.date.localeCompare(b.date)),
      }))
      .sort((a, b) => a.data[0].date.localeCompare(b.data[0].date));

    setFilteredSections(sections);
  }, [filter, sessions]);

  const filterButtons = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'previous', label: 'Previous Month' },
    { key: 'all', label: 'All Sessions' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 mt-10">
        <Text className="text-3xl font-bold text-gray-900 mb-4">Your Sessions</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
          {filterButtons.map((btn) => (
            <TouchableOpacity
              key={btn.key}
              onPress={() => setFilter(btn.key as any)}
              className={`px-4 py-2 rounded-xl mr-3 border ${
                filter === btn.key
                  ? 'bg-green-200 border-green-400'
                  : 'bg-gray-100 border-gray-300'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  filter === btn.key ? 'text-green-800' : 'text-gray-600'
                }`}
              >
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className="mt-2 text-gray-600">Loading sessions...</Text>
        </View>
      ) : filteredSections.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-gray-500 text-lg text-center">No sessions in this view.</Text>
        </View>
      ) : (
        <SectionList
          sections={filteredSections}
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
              <Text className="text-green-700 text-sm mb-1">📅 {item.date}</Text>
              <Text className="text-green-700 text-sm">🎯 {item.objective || 'No objectives'}</Text>
            </TouchableOpacity>
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </SafeAreaView>
  );
}
