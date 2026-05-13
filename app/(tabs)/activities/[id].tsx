import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '../../../store/workoutStore';
import { WorkoutFormat, Step } from '../../../types/workout';

const FORMAT_CONFIG: Record<WorkoutFormat, { label: string; color: string; icon: string }> = {
  for_time: { label: 'For Time', color: '#A793AC', icon: '⏱' },
  amrap:    { label: 'AMRAP',    color: '#7DB87A', icon: '🔄' },
  intervals:{ label: 'Intervals',color: '#5B8DB8', icon: '🔁' },
};

function stepSummary(step: Step): string {
  if (step.type === 'reps') return `${step.value} reps`;
  if (step.type === 'distance') return `${step.value} ${step.unit}`;
  if (step.type === 'time') return `${step.value}${step.unit}`;
  return '';
}

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, deleteWorkout } = useWorkoutStore();
  const workout = getById(id ?? '');

  if (!workout) {
    return (
      <SafeAreaView style={s.container}>
        <TouchableOpacity style={s.backTap} onPress={() => router.back()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.notFound}>
          <Text style={s.notFoundText}>Workout not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fmt = FORMAT_CONFIG[workout.format];
  const date = new Date(workout.created_at).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  function handleDelete() {
    Alert.alert(`Delete "${workout.name}"?`, 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteWorkout(workout.id); router.back(); } },
    ]);
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backTap}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.editBtn}
          onPress={() => router.push({ pathname: '/activities/new', params: { editId: workout.id } })}
          activeOpacity={0.8}>
          <Text style={s.editBtnText}>✏️  Edit</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={[s.badge, { backgroundColor: fmt.color + '22', borderColor: fmt.color }]}>
          <Text style={[s.badgeText, { color: fmt.color }]}>{fmt.icon}  {fmt.label}</Text>
        </View>
        <Text style={s.title}>{workout.name}</Text>
        {workout.sport && <Text style={s.sport}>{workout.sport}</Text>}
        <View style={s.chipRow}>
          {workout.cap_time != null && <View style={s.chip}><Text style={s.chipText}>⏱ {workout.cap_time / 60} min cap</Text></View>}
          {workout.rounds != null && <View style={s.chip}><Text style={s.chipText}>🔁 {workout.rounds} rounds</Text></View>}
          <View style={s.chip}><Text style={s.chipText}>📦 {workout.steps.length} blocks</Text></View>
          <View style={s.chip}><Text style={s.chipText}>📅 {date}</Text></View>
        </View>
        <Text style={s.sectionTitle}>Blocks</Text>
        {workout.steps.map((step, i) => (
          <View key={step.id} style={s.blockRow}>
            <View style={s.blockNum}><Text style={s.blockNumText}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <Text style={s.blockValue}>{stepSummary(step)}</Text>
                <Text style={s.blockMove}>  {step.movement}</Text>
              </View>
              <View style={s.tagRow}>
                {step.weight != null && <View style={s.tag}><Text style={s.tagText}>🏋️ {step.weight} {step.weight_unit ?? 'kg'}</Text></View>}
                {step.height != null && <View style={s.tag}><Text style={s.tagText}>📏 H {step.height} cm</Text></View>}
                {step.target_pace && <View style={s.tag}><Text style={s.tagText}>🏃 Pace {step.target_pace}</Text></View>}
                {step.target_hr != null && <View style={s.tag}><Text style={s.tagText}>❤️ HR {step.target_hr}</Text></View>}
                {step.notes && <View style={[s.tag, s.tagNote]}><Text style={[s.tagText, s.tagNoteText]}>💬 {step.notes}</Text></View>}
              </View>
            </View>
          </View>
        ))}
        <View style={s.actions}>
          <TouchableOpacity style={s.startBtn}
            onPress={() => Alert.alert('Coming soon', 'Guided workout arrives in Step 3! 🏃')} activeOpacity={0.85}>
            <Text style={s.startBtnText}>▶  Start workout</Text>
            <Text style={s.startBtnSub}>Guided mode available in Step 3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
            <Text style={s.deleteBtnText}>Delete workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0EFEB' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backTap: { paddingVertical: 8, paddingRight: 16 },
  backText: { fontSize: 16, color: '#A793AC', fontWeight: '500' },
  editBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#A793AC' },
  editBtnText: { color: '#A793AC', fontWeight: '600', fontSize: 14 },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '700', color: '#1A1714', lineHeight: 34 },
  sport: { fontSize: 15, color: '#6B6560', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { backgroundColor: '#FFF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, color: '#6B6560' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1714', marginTop: 28, marginBottom: 12 },
  blockRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFF', borderRadius: 14, padding: 14, marginBottom: 8 },
  blockNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0EFEB', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1 },
  blockNumText: { fontSize: 13, fontWeight: '700', color: '#1A1714' },
  blockValue: { fontSize: 17, fontWeight: '700', color: '#1A1714' },
  blockMove: { fontSize: 16, color: '#1A1714' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: { backgroundColor: '#A793AC18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 12, color: '#A793AC', fontWeight: '500' },
  tagNote: { backgroundColor: '#F0EFEB' },
  tagNoteText: { color: '#6B6560' },
  actions: { marginTop: 36 },
  startBtn: { backgroundColor: '#7DB87A', borderRadius: 16, paddingVertical: 20, alignItems: 'center', marginBottom: 14 },
  startBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  startBtnSub: { color: '#FFF', fontSize: 12, opacity: 0.75, marginTop: 3 },
  deleteBtn: { paddingVertical: 17, alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: '#E05555' },
  deleteBtnText: { color: '#E05555', fontSize: 15, fontWeight: '600' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: '#6B6560' },
});
