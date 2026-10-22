import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSessionStore } from '../../../store/sessionStore';
import { useWorkoutStore } from '../../../store/workoutStore';

const GRAD: [string,string,string,string] = ['#f0c4a0','#e8b8c8','#d4b8e0','#c8c0e8'];
const DARK = '#2a1a24';
const MF = 'Manrope_700Bold';
const MR = 'Manrope_400Regular';
const MS = 'Manrope_600SemiBold';
const MB = 'Manrope_800ExtraBold';
const g = (a: string) => `rgba(80,40,60,${a})`;

const FORMAT_LABEL: Record<string,string> = { for_time:'For Time', amrap:'AMRAP', intervals:'Intervals' };
const FORMAT_COLOR: Record<string,string> = { for_time:'#7050a0', amrap:'#5a9e57', intervals:'#3a6a94' };

function fmt(s: number) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}
function fmtShort(s: number) {
  const m = Math.floor(s/60); const sec = s%60;
  return `${m}'${String(sec).padStart(2,'0')}"`;
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US',{ weekday:'short', day:'numeric', month:'long' });
}

export default function SessionDetailScreen() {
  const router  = useRouter();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const { sessions, deleteSession } = useSessionStore();
  const { getById, updateWorkout }  = useWorkoutStore();

  const session = sessions.find(s => s.id === id);
  const workout = session ? getById(session.workoutId) : undefined;
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue]     = useState(session?.workoutName ?? '');

  if (!session) {
    return (
      <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={{flex:1}}>
        <SafeAreaView style={{flex:1,alignItems:'center',justifyContent:'center'}}>
          <Text style={{fontSize:16,color:g('0.5'),fontFamily:MR}}>Session introuvable.</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const color = FORMAT_COLOR[session.format] ?? '#7050a0';
  const label = FORMAT_LABEL[session.format] ?? session.format;
  const expectedBlocks = workout ? workout.steps.length * (session.rounds_completed || 1) : null;
  const isPartial = expectedBlocks !== null && session.block_results.length < expectedBlocks;
  const maxDuration = Math.max(...session.block_results.map(b => b.duration_s), 1);
  const maxRound = session.block_results.reduce((m,r) => Math.max(m, r.roundIndex), 0);
  const rounds: typeof session.block_results[] = Array.from({ length: maxRound+1 }, (_,ri) =>
    session.block_results.filter(r => r.roundIndex === ri)
  );

  function handleMenu() {
    Alert.alert(session.workoutName, undefined, [
      { text:'▶  Do it again', onPress: () => router.push(`/workout/${session.workoutId}/run`) },
      { text:'🗑  Supprimer', style:'destructive', onPress: () =>
        Alert.alert('Supprimer ?','Cette action est irréversible.',[
          { text:'Annuler', style:'cancel' },
          { text:'Supprimer', style:'destructive', onPress: () => { deleteSession(session.id); router.back(); } },
        ])
      },
      { text:'Annuler', style:'cancel' },
    ]);
  }

  function saveName() {
    const t = nameValue.trim();
    if (t && t !== session.workoutName && workout) updateWorkout(workout.id, { name: t });
    setEditingName(false);
  }

  return (
    <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={{flex:1}}>
    <SafeAreaView style={{flex:1}} edges={['top','bottom']}>
      {/* Top bar */}
      <View style={s.topBar}>
        <TouchableOpacity style={s.backTap} onPress={() => router.back()}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.menuBtn} onPress={handleMenu} activeOpacity={0.7}>
          <Text style={s.menuBtnText}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Format badge */}
        <View style={[s.badge, { backgroundColor: color+'25', borderColor: color+'45' }]}>
          <Text style={[s.badgeText, { color }]}>{label}</Text>
        </View>

        {/* Title éditable */}
        <View style={s.titleRow}>
          {editingName ? (
            <TextInput style={s.titleInput} value={nameValue} onChangeText={setNameValue}
              autoFocus returnKeyType="done" onSubmitEditing={saveName} onBlur={saveName} />
          ) : (
            <Text style={s.workoutName}>{nameValue || session.workoutName}</Text>
          )}
          <TouchableOpacity style={s.pencilBtn} onPress={() => { setNameValue(session.workoutName); setEditingName(true); }} activeOpacity={0.7}>
            <Text>✏️</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.dateText}>{formatDate(session.started_at)}</Text>

        {isPartial && (
          <View style={s.partialBanner}><Text style={s.partialBannerText}>⚡ Session partielle</Text></View>
        )}

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { v: fmt(session.duration_s), l: 'Temps' },
            ...(session.format !== 'for_time' ? [{ v: String(session.rounds_completed), l: 'Rounds' }] : []),
            { v: `${session.block_results.length}${expectedBlocks ? `/${expectedBlocks}` : ''}`, l: 'Blocs' },
            { v: session.block_results.length > 0 ? fmtShort(Math.round(session.duration_s / session.block_results.length)) : '—', l: 'Moy.' },
          ].map((item, i, arr) => (
            <React.Fragment key={i}>
              <View style={s.statItem}>
                <Text style={[s.statValue, { color }]}>{item.v}</Text>
                <Text style={s.statLabel}>{item.l}</Text>
              </View>
              {i < arr.length-1 && <View style={s.statDiv} />}
            </React.Fragment>
          ))}
        </View>

        {/* Splits */}
        {session.block_results.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>SPLITS</Text>

            {session.format === 'intervals' ? rounds.map((brs, ri) => (
              <View key={ri} style={s.roundBlock}>
                <View style={s.roundHeader}>
                  <Text style={s.roundLabel}>ROUND {ri+1}</Text>
                  <Text style={s.roundTotal}>{fmt(brs.reduce((a,b) => a+b.duration_s, 0))}</Text>
                </View>
                {brs.map((br, bi) => {
                  const step = workout?.steps.find(st => st.id === br.stepId);
                  const pct  = br.duration_s / maxDuration;
                  return (
                    <View key={bi} style={s.splitRow}>
                      <View style={s.splitTop}>
                        <Text style={s.splitMove} numberOfLines={1}>{step?.movement ?? `Bloc ${bi+1}`}</Text>
                        <Text style={s.splitTime}>{fmtShort(br.duration_s)}</Text>
                      </View>
                      <View style={s.barTrack}>
                        <View style={[s.barFill, { width:`${Math.round(pct*100)}%` as any, backgroundColor: color, opacity: 0.7 - bi*0.05 > 0.3 ? 0.7 - bi*0.05 : 0.3 }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )) : session.block_results.map((br, i) => {
              const step = workout?.steps.find(st => st.id === br.stepId);
              const pct  = br.duration_s / maxDuration;
              const isLast = i === session.block_results.length-1;
              return (
                <View key={i} style={[s.splitRow, !isLast && s.splitBorder]}>
                  <View style={s.splitTop}>
                    <View style={{flex:1}}>
                      <Text style={s.splitMove} numberOfLines={1}>{step?.movement ?? `Bloc ${i+1}`}</Text>
                      {step?.type === 'reps'     && <Text style={s.splitSub}>{step.value} reps</Text>}
                      {step?.type === 'distance' && <Text style={s.splitSub}>{step.value} {step.unit}</Text>}
                    </View>
                    <Text style={s.splitTime}>{fmtShort(br.duration_s)}</Text>
                  </View>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width:`${Math.round(pct*100)}%` as any, backgroundColor: color }]} />
                  </View>
                </View>
              );
            })}

            {/* Bloc partiel */}
            {isPartial && (() => {
              const last    = session.block_results[session.block_results.length-1];
              const lastIdx = workout?.steps.findIndex(st => st.id === last.stepId) ?? -1;
              const next    = workout?.steps[(lastIdx+1) % (workout?.steps.length ?? 1)];
              if (!next) return null;
              return (
                <View style={[s.splitRow, { opacity: 0.45 }]}>
                  <View style={s.splitTop}>
                    <Text style={s.splitMove}>{next.movement}</Text>
                    <View style={s.partialBadge}><Text style={s.partialBadgeText}>⚡ partiel</Text></View>
                  </View>
                  <View style={s.barTrack}>
                    <View style={[s.barFill, { width:'15%', backgroundColor: g('0.2') }]} />
                  </View>
                </View>
              );
            })()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  topBar:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, paddingVertical:10 },
  backTap:   { paddingVertical:8, paddingRight:16 },
  backText:  { fontSize:15, color:'#7050a0', fontWeight:'600', fontFamily:MF },
  menuBtn:   { padding:10 },
  menuBtnText: { fontSize:18, color:g('0.5'), letterSpacing:2, fontWeight:'700' },
  content:   { paddingHorizontal:20, paddingBottom:48 },
  badge:     { alignSelf:'flex-start', paddingHorizontal:12, paddingVertical:5, borderRadius:20, borderWidth:1, marginBottom:10 },
  badgeText: { fontSize:13, fontWeight:'700', fontFamily:MF },
  titleRow:  { flexDirection:'row', alignItems:'center', gap:10, marginBottom:4 },
  workoutName: { fontSize:26, fontWeight:'800', color:DARK, lineHeight:32, flex:1, fontFamily:MB },
  titleInput:  { fontSize:26, fontWeight:'800', color:DARK, flex:1, fontFamily:MB, borderBottomWidth:2, borderBottomColor:'rgba(112,80,160,0.5)', paddingBottom:2 },
  pencilBtn: { padding:4 },
  dateText:  { fontSize:14, color:g('0.45'), marginBottom:16, fontFamily:MR },
  partialBanner: { backgroundColor:'rgba(255,243,200,0.6)', borderRadius:12, paddingHorizontal:12, paddingVertical:8, marginBottom:16, alignSelf:'flex-start', borderWidth:1, borderColor:'rgba(240,200,60,0.35)' },
  partialBannerText: { fontSize:13, fontWeight:'600', color:'#856404', fontFamily:MF },
  // Stats
  statsRow:  { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.35)', borderRadius:20, borderWidth:1, borderColor:'rgba(255,255,255,0.55)', paddingVertical:16, paddingHorizontal:8, alignItems:'center', marginBottom:28 },
  statItem:  { flex:1, alignItems:'center' },
  statValue: { fontSize:18, fontWeight:'800', letterSpacing:-0.5, fontFamily:MB },
  statLabel: { fontSize:10, color:g('0.4'), marginTop:4, textTransform:'uppercase', letterSpacing:1, fontFamily:MR },
  statDiv:   { width:1, height:28, backgroundColor:'rgba(100,60,80,0.12)' },
  // Splits
  sectionTitle: { fontSize:10, fontWeight:'700', color:g('0.45'), letterSpacing:2.5, textTransform:'uppercase', marginBottom:16, fontFamily:MF },
  roundBlock:   { marginBottom:8 },
  roundHeader:  { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.3)', marginBottom:4 },
  roundLabel:   { fontSize:10, fontWeight:'700', color:g('0.4'), letterSpacing:1.5, fontFamily:MF },
  roundTotal:   { fontSize:14, fontWeight:'700', color:DARK, fontFamily:MF },
  splitRow:     { paddingVertical:12 },
  splitBorder:  { borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.3)' },
  splitTop:     { flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8 },
  splitMove:    { fontSize:16, fontWeight:'700', color:DARK, flex:1, marginRight:12, fontFamily:MF },
  splitSub:     { fontSize:12, color:g('0.4'), marginTop:2, fontFamily:MR },
  splitTime:    { fontSize:16, fontWeight:'700', color:DARK, fontFamily:MF, minWidth:54, textAlign:'right' },
  barTrack:     { height:6, backgroundColor:'rgba(255,255,255,0.35)', borderRadius:3, overflow:'hidden' },
  barFill:      { height:'100%', borderRadius:3 },
  partialBadge: { backgroundColor:'rgba(255,243,200,0.5)', paddingHorizontal:8, paddingVertical:3, borderRadius:8, borderWidth:1, borderColor:'rgba(240,200,60,0.35)' },
  partialBadgeText: { fontSize:11, fontWeight:'600', color:'#856404', fontFamily:MF },
});
