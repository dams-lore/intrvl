import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSessionStore } from '../../../store/sessionStore';
import { useWorkoutStore } from '../../../store/workoutStore';
import { BlockResult } from '../../../types/session';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(s: number): string {
  const m = Math.floor(Math.abs(s) / 60);
  const sec = Math.abs(s) % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function fmtShort(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}'${String(sec).padStart(2, '0')}"` : `${sec}"`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

const FORMAT_LABEL: Record<string, string> = {
  for_time: 'For Time', amrap: 'AMRAP', intervals: 'Intervals',
};
const FORMAT_COLOR: Record<string, string> = {
  for_time: '#A793AC', amrap: '#7DB87A', intervals: '#5B8DB8',
};

// ── Component ────────────────────────────────────────────────────────────────
export default function SummaryScreen() {
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const { pendingSession, saveSession, setPendingSession } = useSessionStore();
  const { getById } = useWorkoutStore();

  const workout = getById(id ?? '');
  const session = pendingSession;

  if (!session) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.errorText}>No session data found.</Text>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/activities')}>
            <Text style={s.backLinkText}>← Back to Activities</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  function handleSave() {
    saveSession(session!);
    setPendingSession(null);
    router.replace('/(tabs)/activities');
  }

  function handleDiscard() {
    setPendingSession(null);
    router.replace('/(tabs)/activities');
  }

  const fmtColor  = FORMAT_COLOR[session.format] ?? '#A793AC';
  const fmtLabel  = FORMAT_LABEL[session.format] ?? session.format;
  const results   = session.block_results;

  // ── Splits par round (pour Intervals) ────────────────────────────────────
  const maxRound = results.reduce((m, r) => Math.max(m, r.roundIndex), 0);
  const rounds: BlockResult[][] = Array.from({ length: maxRound + 1 }, (_, ri) =>
    results.filter((r) => r.roundIndex === ri)
  );

  // Temps total par round
  function roundTotal(brs: BlockResult[]): number {
    return brs.reduce((sum, b) => sum + b.duration_s, 0);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={[s.formatBadge, { backgroundColor: fmtColor }]}>
            <Text style={s.formatBadgeText}>{fmtLabel.toUpperCase()}</Text>
          </View>
          <Text style={s.headerTitle}>Workout{'\n'}complete 🏁</Text>
          <Text style={s.workoutName}>{session.workoutName}</Text>
          <Text style={s.dateText}>{formatDate(session.started_at)}</Text>
        </View>

        {/* ── Hero stat : durée totale ── */}
        <View style={[s.heroCard, { borderColor: fmtColor }]}>
          <Text style={s.heroLabel}>TOTAL TIME</Text>
          <Text style={[s.heroTime, { color: fmtColor }]}>{fmt(session.duration_s)}</Text>
        </View>

        {/* ── Stats row ── */}
        <View style={s.statsRow}>
          {session.format === 'amrap' && (
            <View style={s.statCard}>
              <Text style={s.statLabel}>ROUNDS</Text>
              <Text style={s.statValue}>{session.rounds_completed}</Text>
            </View>
          )}
          {session.format === 'intervals' && (
            <View style={s.statCard}>
              <Text style={s.statLabel}>ROUNDS</Text>
              <Text style={s.statValue}>{maxRound + 1}</Text>
            </View>
          )}
          <View style={s.statCard}>
            <Text style={s.statLabel}>BLOCKS</Text>
            <Text style={s.statValue}>{results.length}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>AVG BLOCK</Text>
            <Text style={s.statValue}>
              {results.length > 0 ? fmtShort(Math.round(session.duration_s / results.length)) : '—'}
            </Text>
          </View>
        </View>

        {/* ── Splits ── */}
        {results.length > 0 && (
          <View style={s.splitsSection}>
            <Text style={s.sectionTitle}>Splits</Text>

            {/* INTERVALS → groupés par round */}
            {session.format === 'intervals' && rounds.map((brs, ri) => (
              <View key={ri} style={s.roundBlock}>
                <View style={s.roundHeader}>
                  <Text style={s.roundLabel}>ROUND {ri + 1}</Text>
                  <Text style={s.roundTotal}>{fmt(roundTotal(brs))}</Text>
                </View>
                {brs.map((br, bi) => {
                  const step = workout?.steps.find((st) => st.id === br.stepId);
                  return (
                    <View key={bi} style={s.splitRow}>
                      <View style={[s.splitDot, { backgroundColor: fmtColor }]} />
                      <Text style={s.splitMove} numberOfLines={1}>
                        {step?.movement ?? `Block ${bi + 1}`}
                      </Text>
                      <Text style={s.splitTime}>{fmtShort(br.duration_s)}</Text>
                    </View>
                  );
                })}
              </View>
            ))}

            {/* FOR TIME / AMRAP → liste simple */}
            {session.format !== 'intervals' && results.map((br, i) => {
              const step = workout?.steps.find((st) => st.id === br.stepId);
              const isLast = i === results.length - 1;
              return (
                <View key={i} style={[s.splitRowSimple, !isLast && s.splitRowBorder]}>
                  <View style={s.splitNumBadge}>
                    <Text style={s.splitNumText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.splitMove} numberOfLines={1}>
                      {step?.movement ?? `Block ${i + 1}`}
                    </Text>
                    {step?.type === 'reps' && (
                      <Text style={s.splitSub}>{step.value} reps</Text>
                    )}
                    {step?.type === 'distance' && (
                      <Text style={s.splitSub}>{step.value} {step.unit}</Text>
                    )}
                  </View>
                  <Text style={s.splitTime}>{fmtShort(br.duration_s)}</Text>
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* ── Actions fixes ── */}
      <View style={s.actions}>
        <TouchableOpacity style={[s.saveBtn, { backgroundColor: fmtColor }]} onPress={handleSave} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>Save session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.discardBtn} onPress={handleDiscard} activeOpacity={0.7}>
          <Text style={s.discardBtnText}>Discard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const C = {
  bg: '#F0EFEB', white: '#FFF', text: '#1A1714',
  muted: '#6B6560', border: '#E8E7E3',
};

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText:    { fontSize: 16, color: C.muted, marginBottom: 20, fontFamily: 'Inter_400Regular' },
  backLinkText: { color: '#A793AC', fontWeight: '600', fontSize: 15, fontFamily: 'Inter_700Bold' },

  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 32 },

  // Header
  header: { marginBottom: 24 },
  formatBadge: {
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5, marginBottom: 16,
  },
  formatBadgeText: {
    color: '#FFF', fontSize: 11, fontWeight: '700',
    letterSpacing: 1.5, fontFamily: 'Inter_700Bold',
  },
  headerTitle: {
    fontSize: 38, fontWeight: '900', color: C.text,
    letterSpacing: -1.5, lineHeight: 44, marginBottom: 8,
    fontFamily: 'Inter_700Bold',
  },
  workoutName: {
    fontSize: 16, color: C.muted, fontFamily: 'Inter_400Regular', marginBottom: 4,
  },
  dateText: {
    fontSize: 13, color: '#B0ADA9', fontFamily: 'Inter_400Regular',
  },

  // Hero
  heroCard: {
    backgroundColor: C.white, borderRadius: 20,
    padding: 24, marginBottom: 12,
    borderWidth: 2, alignItems: 'center',
  },
  heroLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 2, marginBottom: 8, fontFamily: 'Inter_700Bold',
  },
  heroTime: {
    fontSize: 56, fontWeight: '900', letterSpacing: -2,
    fontFamily: 'Inter_700Bold', includeFontPadding: false,
  },

  // Stats row
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 16,
    padding: 14, alignItems: 'center',
  },
  statLabel: {
    fontSize: 9, fontWeight: '700', color: C.muted,
    letterSpacing: 1.5, marginBottom: 6, fontFamily: 'Inter_700Bold',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: C.text, fontFamily: 'Inter_700Bold' },

  // Splits
  splitsSection: { backgroundColor: C.white, borderRadius: 20, overflow: 'hidden' },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: C.muted,
    letterSpacing: 1.5, padding: 16, paddingBottom: 12,
    fontFamily: 'Inter_700Bold', borderBottomWidth: 1, borderBottomColor: C.border,
  },

  // Intervals — rounds
  roundBlock: { paddingHorizontal: 16, paddingBottom: 8 },
  roundHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
    marginBottom: 4,
  },
  roundLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1.5, fontFamily: 'Inter_700Bold',
  },
  roundTotal: { fontSize: 15, fontWeight: '700', color: C.text, fontFamily: 'Inter_700Bold' },
  splitRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 9, gap: 10,
  },
  splitDot: { width: 7, height: 7, borderRadius: 4 },
  splitMove: {
    flex: 1, fontSize: 14, fontWeight: '600', color: C.text, fontFamily: 'Inter_700Bold',
  },
  splitTime: {
    fontSize: 14, fontWeight: '700', color: C.muted, fontFamily: 'Inter_700Bold',
    minWidth: 50, textAlign: 'right',
  },

  // For Time / AMRAP — liste simple
  splitRowSimple: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16, gap: 12,
  },
  splitRowBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  splitNumBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
  },
  splitNumText: { fontSize: 12, fontWeight: '700', color: C.text, fontFamily: 'Inter_700Bold' },
  splitSub: { fontSize: 12, color: C.muted, marginTop: 1, fontFamily: 'Inter_400Regular' },

  // Actions
  actions: {
    paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12,
    gap: 8, backgroundColor: C.bg,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  saveBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
  },
  saveBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  discardBtn: { paddingVertical: 12, alignItems: 'center' },
  discardBtnText: { color: C.muted, fontSize: 15, fontFamily: 'Inter_400Regular' },
});
