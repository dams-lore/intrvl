import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../../store/sessionStore';

const GRAD: [string,string,string,string] = ['#f0c4a0','#e8b8c8','#d4b8e0','#c8c0e8'];
const DARK = '#2a1a24';
const MF = 'Manrope_700Bold';
const MR = 'Manrope_400Regular';
const MB = 'Manrope_800ExtraBold';
const MS = 'Manrope_600SemiBold';

const FORMAT_LABEL: Record<string,string> = { for_time:'For Time', amrap:'AMRAP', intervals:'Intervals' };
const FORMAT_COLOR: Record<string,string> = { for_time:'#7050a0', amrap:'#5a9e57', intervals:'#3a6a94' };
const g = (a: string) => `rgba(80,40,60,${a})`;

function fmt(s: number) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}
function fmtDuration(s: number) {
  const m = Math.floor(s/60);
  return m < 60 ? `${m}min` : `${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US',{ weekday:'short', day:'numeric', month:'short' });
}

export default function AnalyticsScreen() {
  const router = useRouter();
  const { sessions } = useSessionStore();
  const total = sessions.reduce((a,s) => a+s.duration_s, 0);

  return (
    <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={s.root}>
      <SafeAreaView style={{flex:1}} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          <Text style={s.title}>Analytics</Text>

          {/* Summary pills */}
          <View style={s.summaryRow}>
            <View style={s.summaryCard}>
              <Text style={s.sumV}>{sessions.length}</Text>
              <Text style={s.sumL}>Sessions</Text>
            </View>
            <View style={s.summaryCard}>
              <Text style={s.sumV}>{total > 0 ? fmtDuration(total) : '—'}</Text>
              <Text style={s.sumL}>Total time</Text>
            </View>
          </View>

          {/* Sessions list */}
          {sessions.length === 0 ? (
            <View style={s.empty}>
              <Text style={{fontSize:40,marginBottom:12}}>📊</Text>
              <Text style={s.emptyTitle}>No sessions yet</Text>
              <Text style={s.emptySub}>Complete a workout to see your analytics</Text>
            </View>
          ) : (
            <>
              <Text style={s.secLabel}>HISTORY</Text>
              {sessions.map((session) => {
                const color = FORMAT_COLOR[session.format] ?? '#7050a0';
                return (
                  <TouchableOpacity key={session.id} style={s.card}
                    onPress={() => router.push(`/analytics/${session.id}`)} activeOpacity={0.82}>
                    <View style={s.cardLeft}>
                      <Text style={s.cardDate}>{fmtDate(session.started_at)}</Text>
                      <Text style={s.cardName} numberOfLines={1}>{session.workoutName}</Text>
                      <View style={[s.badge,{backgroundColor:color+'25',borderColor:color+'40'}]}>
                        <Text style={[s.badgeText,{color}]}>{FORMAT_LABEL[session.format]??session.format}</Text>
                      </View>
                    </View>
                    <View style={s.cardRight}>
                      <Text style={s.cardTime}>{fmt(session.duration_s)}</Text>
                      <Text style={s.cardBlocs}>{session.block_results.length} blocs</Text>
                      <Text style={s.arrow}>›</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
          <View style={{height:100}} />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: {flex:1},
  scroll: {paddingHorizontal:20,paddingBottom:20,flexGrow:1},
  title: {fontSize:34,fontWeight:'800',color:DARK,letterSpacing:-1.5,fontFamily:MB,paddingTop:16,marginBottom:20},
  summaryRow: {flexDirection:'row',gap:12,marginBottom:24},
  summaryCard: {flex:1,backgroundColor:'rgba(255,255,255,0.35)',borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,0.55)',padding:18,alignItems:'center'},
  sumV: {fontSize:26,fontWeight:'800',color:DARK,letterSpacing:-1,fontFamily:MB},
  sumL: {fontSize:10,color:`rgba(80,40,60,0.45)`,marginTop:4,textTransform:'uppercase',letterSpacing:1,fontFamily:'Manrope_600SemiBold'},
  secLabel: {fontSize:10,fontWeight:'700',color:`rgba(80,40,60,0.45)`,letterSpacing:2,textTransform:'uppercase',marginBottom:10,fontFamily:MF},
  empty: {alignItems:'center',paddingTop:60},
  emptyTitle: {fontSize:18,fontWeight:'700',color:DARK,fontFamily:MF,marginBottom:6},
  emptySub: {fontSize:14,color:`rgba(80,40,60,0.45)`,fontFamily:MR,textAlign:'center'},
  card: {backgroundColor:'rgba(255,255,255,0.35)',borderWidth:1,borderColor:'rgba(255,255,255,0.55)',borderRadius:20,flexDirection:'row',alignItems:'center',justifyContent:'space-between',padding:16,marginBottom:10},
  cardLeft: {flex:1,gap:4},
  cardDate: {fontSize:11,color:`rgba(80,40,60,0.45)`,fontFamily:MR},
  cardName: {fontSize:15,fontWeight:'700',color:DARK,fontFamily:MF},
  badge: {paddingHorizontal:9,paddingVertical:3,borderRadius:8,borderWidth:1,alignSelf:'flex-start'},
  badgeText: {fontSize:10,fontWeight:'700',fontFamily:MF},
  cardRight: {alignItems:'flex-end',gap:4},
  cardTime: {fontSize:20,fontWeight:'800',color:DARK,letterSpacing:-0.5,fontFamily:MB},
  cardBlocs: {fontSize:11,color:`rgba(80,40,60,0.4)`,fontFamily:MR},
  arrow: {fontSize:20,color:`rgba(80,40,60,0.2)`},
});
