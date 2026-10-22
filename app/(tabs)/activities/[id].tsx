import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useSessionStore } from '../../../store/sessionStore';
import { WorkoutFormat, Step } from '../../../types/workout';

const GRAD: [string,string,string,string] = ['#f0c4a0','#e8b8c8','#d4b8e0','#c8c0e8'];
const DARK = '#2a1a24';
const MF = 'Manrope_700Bold';
const MR = 'Manrope_400Regular';
const MS = 'Manrope_600SemiBold';
const MB = 'Manrope_800ExtraBold';
const g = (a: string) => `rgba(80,40,60,${a})`;

const FORMAT_CONFIG: Record<WorkoutFormat, { label: string; color: string; icon: string }> = {
  for_time:  { label: 'For Time',  color: '#7050a0', icon: '⏱' },
  amrap:     { label: 'AMRAP',     color: '#5a9e57', icon: '🔄' },
  intervals: { label: 'Intervals', color: '#3a6a94', icon: '🔁' },
};

function stepSummary(step: Step): string {
  if (step.type === 'reps')     return `${step.value} reps`;
  if (step.type === 'distance') return `${step.value} ${step.unit}`;
  if (step.type === 'time')     return `${step.value}${step.unit}`;
  return '';
}

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getById, deleteWorkout } = useWorkoutStore();
  const { sessions } = useSessionStore();
  const workout = getById(id ?? '');

  const [tab, setTab] = useState<'workout' | 'history'>('workout');

  // Sessions pour ce workout
  const workoutSessions = sessions
    .filter((s) => s.workoutId === id)
    .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

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

  const fmt_cfg = FORMAT_CONFIG[workout.format];

  function handleDelete() {
    Alert.alert(`Delete "${workout.name}"?`, 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => { deleteWorkout(workout.id); router.back(); },
      },
    ]);
  }

  return (
    <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={{flex:1}}>
    <SafeAreaView style={s.container} edges={['top','bottom']}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backTap}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.editBtn}
          onPress={() => router.push({ pathname: '/activities/new', params: { editId: workout.id } })}
          activeOpacity={0.8}
        >
          <Text style={s.editBtnText}>✏️  Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={s.headerBlock}>
        <View style={[s.badge, { backgroundColor: fmt_cfg.color + '22', borderColor: fmt_cfg.color }]}>
          <Text style={[s.badgeText, { color: fmt_cfg.color }]}>{fmt_cfg.icon}  {fmt_cfg.label}</Text>
        </View>
        <Text style={s.title}>{workout.name}</Text>
        {workout.sport && <Text style={s.sport}>{workout.sport}</Text>}
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity
          style={[s.tab, tab === 'workout' && s.tabActive]}
          onPress={() => setTab('workout')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, tab === 'workout' && s.tabTextActive]}>Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.tab, tab === 'history' && s.tabActive]}
          onPress={() => setTab('history')}
          activeOpacity={0.8}
        >
          <Text style={[s.tabText, tab === 'history' && s.tabTextActive]}>
            History {workoutSessions.length > 0 ? `(${workoutSessions.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── TAB WORKOUT ── */}
      {tab === 'workout' && (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <View style={s.chipRow}>
            {workout.cap_time != null && (
              <View style={s.chip}>
                <Text style={s.chipText}>
                  ⏱ {Math.floor(workout.cap_time / 60)}'{String(workout.cap_time % 60).padStart(2,'0')} cap
                </Text>
              </View>
            )}
            {workout.rounds != null && (
              <View style={s.chip}><Text style={s.chipText}>🔁 {workout.rounds} rounds</Text></View>
            )}
            <View style={s.chip}><Text style={s.chipText}>📦 {workout.steps.length} blocks</Text></View>
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
                  {step.weight     != null && <View style={s.tag}><Text style={s.tagText}>🏋️ {step.weight} {step.weight_unit ?? 'kg'}</Text></View>}
                  {step.height     != null && <View style={s.tag}><Text style={s.tagText}>📏 {step.height} cm</Text></View>}
                  {step.target_pace       && <View style={s.tag}><Text style={s.tagText}>🏃 {step.target_pace} pace</Text></View>}
                  {step.notes             && <View style={[s.tag, s.tagNote]}><Text style={[s.tagText, s.tagNoteText]}>💬 {step.notes}</Text></View>}
                </View>
              </View>
            </View>
          ))}

          <View style={s.actions}>
            <TouchableOpacity
              style={[s.startBtn, { backgroundColor: fmt_cfg.color }]}
              onPress={() => router.push(`/workout/${id}/run`)}
              activeOpacity={0.85}
            >
              <Text style={s.startBtnText}>▶  Start workout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
              <Text style={s.deleteBtnText}>Delete workout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* ── TAB HISTORY ── */}
      {tab === 'history' && (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {workoutSessions.length === 0 ? (
            <View style={s.emptyHistory}>
              <Text style={s.emptyHistoryIcon}>📭</Text>
              <Text style={s.emptyHistoryTitle}>No sessions yet</Text>
              <Text style={s.emptyHistoryText}>Complete this workout to see your history here.</Text>
              <TouchableOpacity
                style={[s.startBtn, { backgroundColor: fmt_cfg.color, marginTop: 24 }]}
                onPress={() => router.push(`/workout/${id}/run`)}
                activeOpacity={0.85}
              >
                <Text style={s.startBtnText}>▶  Start workout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Best time */}
              {workout.format === 'for_time' && workoutSessions.length > 1 && (() => {
                const best = [...workoutSessions].sort((a, b) => a.duration_s - b.duration_s)[0];
                return (
                  <View style={s.prCard}>
                    <Text style={s.prLabel}>🏆 BEST TIME</Text>
                    <Text style={s.prValue}>{fmt(best.duration_s)}</Text>
                    <Text style={s.prDate}>{fmtDate(best.started_at)}</Text>
                  </View>
                );
              })()}

              {workoutSessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={s.sessionCard}
                  onPress={() => router.push(`/analytics/${session.id}`)}
                  activeOpacity={0.82}
                >
                  <View style={s.sessionLeft}>
                    <Text style={s.sessionDate}>{fmtDate(session.started_at)}</Text>
                    <Text style={s.sessionTime}>{fmt(session.duration_s)}</Text>
                    {session.format === 'amrap' && session.rounds_completed > 0 && (
                      <Text style={s.sessionMeta}>{session.rounds_completed} rounds</Text>
                    )}
                    {session.format === 'intervals' && (
                      <Text style={s.sessionMeta}>{session.block_results.length} blocks completed</Text>
                    )}
                  </View>
                  <View style={s.sessionRight}>
                    <View style={[s.sessionBadge, { backgroundColor: fmt_cfg.color + '22' }]}>
                      <Text style={[s.sessionBadgeText, { color: fmt_cfg.color }]}>
                        {fmt_cfg.icon} {fmt_cfg.label}
                      </Text>
                    </View>
                    <Text style={s.sessionArrow}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[s.startBtn, { backgroundColor: fmt_cfg.color, marginTop: 16 }]}
                onPress={() => router.push(`/workout/${id}/run`)}
                activeOpacity={0.85}
              >
                <Text style={s.startBtnText}>▶  Start again</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
    </LinearGradient>
  );
}

const C = { bg: 'transparent', white: 'rgba(255,255,255,0.35)', text: DARK, muted: g('0.45'), border: 'rgba(255,255,255,0.45)' };

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backTap:     { paddingVertical: 8, paddingRight: 16 },
  backText:    { fontSize: 15, color: '#7050a0', fontWeight: '600', fontFamily: MF },
  editBtn:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(112,80,160,0.5)', backgroundColor: 'rgba(255,255,255,0.3)' },
  editBtnText: { color: '#7050a0', fontWeight: '600', fontSize: 14, fontFamily: MF },
  headerBlock: { paddingHorizontal: 20, paddingBottom: 12 },
  badge:       { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginBottom: 8 },
  badgeText:   { fontSize: 13, fontWeight: '700', fontFamily: MF },
  title:       { fontSize: 26, fontWeight: '800', color: DARK, lineHeight: 32, fontFamily: MB },
  sport:       { fontSize: 14, color: g('0.45'), marginTop: 3, fontFamily: MR },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 14, padding: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 11, alignItems: 'center' },
  tabActive:     { backgroundColor: 'rgba(255,255,255,0.55)' },
  tabText:       { fontSize: 14, fontWeight: '600', color: g('0.4'), fontFamily: MF },
  tabTextActive: { color: DARK },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 60 },
  chipRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip:     { backgroundColor: 'rgba(255,255,255,0.35)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  chipText: { fontSize: 13, color: g('0.5'), fontFamily: MR },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: DARK, marginBottom: 12, fontFamily: MF },
  blockRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 16, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  blockNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 1 },
  blockNumText: { fontSize: 13, fontWeight: '700', color: DARK, fontFamily: MF },
  blockValue:   { fontSize: 17, fontWeight: '700', color: DARK, fontFamily: MF },
  blockMove:    { fontSize: 16, color: DARK, fontFamily: MR },
  tagRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag:          { backgroundColor: 'rgba(112,80,160,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText:      { fontSize: 12, color: '#7050a0', fontWeight: '500', fontFamily: MR },
  tagNote:      { backgroundColor: 'rgba(255,255,255,0.2)' },
  tagNoteText:  { color: g('0.5') },
  actions:      { marginTop: 32, gap: 12 },
  startBtn:     { borderRadius: 16, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '700', fontFamily: MF },
  deleteBtn:    { paddingVertical: 17, alignItems: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: '#E05555' },
  deleteBtnText:{ color: '#E05555', fontSize: 15, fontWeight: '600', fontFamily: MF },
  emptyHistory:      { alignItems: 'center', paddingTop: 48 },
  emptyHistoryIcon:  { fontSize: 48, marginBottom: 16 },
  emptyHistoryTitle: { fontSize: 20, fontWeight: '700', color: DARK, marginBottom: 8, fontFamily: MF },
  emptyHistoryText:  { fontSize: 15, color: g('0.45'), textAlign: 'center', fontFamily: MR },
  prCard: { backgroundColor: 'rgba(255,240,180,0.5)', borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(240,200,60,0.4)' },
  prLabel: { fontSize: 11, fontWeight: '700', color: '#9A7010', letterSpacing: 1.5, marginBottom: 6, fontFamily: MF },
  prValue: { fontSize: 32, fontWeight: '900', color: DARK, fontFamily: MB, letterSpacing: -1 },
  prDate:  { fontSize: 13, color: '#9A7010', marginTop: 4, fontFamily: MR },
  sessionCard: { backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 18, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  sessionLeft:        { gap: 3 },
  sessionDate:        { fontSize: 12, color: g('0.45'), fontFamily: MR },
  sessionTime:        { fontSize: 24, fontWeight: '800', color: DARK, fontFamily: MB, letterSpacing: -0.5 },
  sessionMeta:        { fontSize: 13, color: g('0.45'), fontFamily: MR },
  sessionRight:       { alignItems: 'flex-end', gap: 8 },
  sessionBadge:       { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  sessionBadgeText:   { fontSize: 12, fontWeight: '700', fontFamily: MF },
  sessionArrow:       { fontSize: 22, color: g('0.2') },
  notFound:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, color: g('0.45'), fontFamily: MR },
});
