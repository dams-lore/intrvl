import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../../../store/workoutStore';
import { Workout, WorkoutFormat } from '../../../types/workout';

const FORMAT_CONFIG: Record<WorkoutFormat, { label: string; color: string; icon: string }> = {
  for_time: { label: 'For Time', color: '#A793AC', icon: '⏱' },
  amrap:    { label: 'AMRAP',    color: '#7DB87A', icon: '🔄' },
  intervals:{ label: 'Intervals',color: '#5B8DB8', icon: '🔁' },
};

function WorkoutCard({ workout, onPress }: { workout: Workout; onPress: () => void }) {
  const fmt = FORMAT_CONFIG[workout.format];
  const date = new Date(workout.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'short',
  });
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardHeader}>
        <Text style={s.cardName} numberOfLines={1}>{workout.name}</Text>
        <View style={[s.badge, { backgroundColor: fmt.color + '25', borderColor: fmt.color }]}>
          <Text style={[s.badgeText, { color: fmt.color }]}>{fmt.icon} {fmt.label}</Text>
        </View>
      </View>
      <View style={s.cardMeta}>
        <Text style={s.cardMetaText}>{workout.steps.length} blocs</Text>
        {workout.rounds != null && <Text style={s.cardMetaText}>  ·  {workout.rounds} rounds</Text>}
        {workout.cap_time != null && <Text style={s.cardMetaText}>  ·  {workout.cap_time / 60} min</Text>}
        {workout.sport && <Text style={s.cardMetaText}>  ·  {workout.sport}</Text>}
        <Text style={[s.cardMetaText, { marginLeft: 'auto' as any }]}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ActivitiesScreen() {
  const router = useRouter();
  const workouts = useWorkoutStore((state) => state.workouts);
  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Activities</Text>
        <Text style={s.subtitle}>{workouts.length} workout{workouts.length !== 1 ? 's' : ''}</Text>
      </View>
      {workouts.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No workouts yet</Text>
          <Text style={s.emptySubtitle}>Tap + to create your first one.</Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <WorkoutCard workout={item} onPress={() => router.push(`/activities/${item.id}`)} />
          )}
        />
      )}
      <TouchableOpacity style={s.fab} onPress={() => router.push('/activities/new')} activeOpacity={0.85}>
        <Text style={s.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFEB' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1714' },
  subtitle: { fontSize: 14, color: '#6B6560', marginTop: 2 },
  list: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardName: { fontSize: 17, fontWeight: '600', color: '#1A1714', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  cardMetaText: { fontSize: 13, color: '#6B6560' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1A1714', marginBottom: 6 },
  emptySubtitle: { fontSize: 15, color: '#6B6560' },
  fab: {
    position: 'absolute', bottom: 32, right: 20, width: 62, height: 62, borderRadius: 31,
    backgroundColor: '#7DB87A', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 6, elevation: 6,
  },
  fabText: { fontSize: 32, color: '#FFF', lineHeight: 36, fontWeight: '300' },
});
