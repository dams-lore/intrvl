import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSessionStore } from '../../store/sessionStore';
import { useWorkoutStore } from '../../store/workoutStore';

const { width: W } = Dimensions.get('window');

const GRAD: [string, string, string, string] = ['#f0c4a0','#e8b8c8','#d4b8e0','#c8c0e8'];
const DARK = '#2a1a24';
const MF = 'Manrope_700Bold';
const MR = 'Manrope_400Regular';
const MS = 'Manrope_600SemiBold';
const MB = 'Manrope_800ExtraBold';

const FORMAT_LABEL: Record<string,string> = { for_time:'For Time', amrap:'AMRAP', intervals:'Intervals' };
const FORMAT_COLOR: Record<string,string> = { for_time:'#7050a0', amrap:'#5a9e57', intervals:'#3a6a94' };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
function fmtDuration(s: number) {
  const m = Math.floor(s/60);
  return m < 60 ? `${m}min` : `${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US',{ weekday:'short', month:'short', day:'numeric' });
}
function fmtShort(s: number) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { sessions } = useSessionStore();
  const { workouts }  = useWorkoutStore();
  const last    = sessions[0] ?? null;
  const recent  = workouts.slice(0,3);
  const total   = sessions.reduce((a,s) => a + s.duration_s, 0);

  return (
    <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={s.root}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={['top']}>
          <View style={s.hero}>
            <Text style={s.eyebrow}>{greeting()}</Text>
            <Text style={s.title}>{'Ready\nto work?'}</Text>

            {/* Glass CTA */}
            <TouchableOpacity style={s.glassCta} onPress={() => router.push('/activities/new')} activeOpacity={0.82}>
              <View style={s.glassCtaRow}>
                <View>
                  <Text style={s.ctaEye}>QUICK START</Text>
                  <Text style={s.ctaTitle}>New Workout</Text>
                  <Text style={s.ctaSub}>Photo · Manual · Template</Text>
                </View>
                <View style={s.ctaIcon}><Text style={{fontSize:22}}>⚡</Text></View>
              </View>
            </TouchableOpacity>

            {/* Stats */}
            <View style={s.statsPills}>
              {[
                { v: String(sessions.length), l: 'sessions' },
                { v: total > 0 ? fmtDuration(total) : '—', l: 'total' },
                { v: String(workouts.length), l: 'workouts' },
              ].map((item, i, arr) => (
                <React.Fragment key={i}>
                  <View style={s.pill}>
                    <Text style={s.pillV}>{item.v}</Text>
                    <Text style={s.pillL}>{item.l}</Text>
                  </View>
                  {i < arr.length-1 && <View style={s.pillDiv} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        </SafeAreaView>

        {/* Divider */}
        <View style={s.divider} />

        {/* Last session */}
        <View style={s.section}>
          <Text style={s.secLabel}>LAST SESSION</Text>
          {last ? (
            <TouchableOpacity style={s.glass} onPress={() => router.push(`/analytics/${last.id}`)} activeOpacity={0.8}>
              <View style={s.glassRow}>
                <View>
                  <Text style={s.cardTitle}>{last.workoutName}</Text>
                  <Text style={s.cardSub}>{fmtDate(last.started_at)}</Text>
                </View>
                <View style={{alignItems:'flex-end',gap:6}}>
                  <Text style={s.bigTime}>{fmtShort(last.duration_s)}</Text>
                  <View style={[s.badge,{backgroundColor:(FORMAT_COLOR[last.format]??'#7050a0')+'30',borderColor:(FORMAT_COLOR[last.format]??'#7050a0')+'50'}]}>
                    <Text style={[s.badgeText,{color:FORMAT_COLOR[last.format]??'#7050a0'}]}>
                      {FORMAT_LABEL[last.format]??last.format}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[s.glass,{alignItems:'center',padding:28}]}>
              <Text style={{fontSize:34,marginBottom:8}}>🏁</Text>
              <Text style={[s.cardTitle,{textAlign:'center'}]}>No sessions yet</Text>
              <Text style={[s.cardSub,{textAlign:'center',marginTop:2}]}>Start your first workout above</Text>
            </View>
          )}
        </View>

        {/* Recent workouts */}
        {recent.length > 0 && (
          <View style={s.section}>
            <View style={s.secRow}>
              <Text style={s.secLabel}>WORKOUTS</Text>
              <TouchableOpacity onPress={() => router.push('/activities')} activeOpacity={0.7}>
                <Text style={s.seeAll}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={s.grid}>
              {recent.map((w) => {
                const color = FORMAT_COLOR[w.format]??'#7050a0';
                return (
                  <TouchableOpacity key={w.id} style={[s.workoutCard,{borderColor:color+'35',backgroundColor:`${color}12`}]}
                    onPress={() => router.push(`/activities/${w.id}`)} activeOpacity={0.8}>
                    <View style={[s.accent,{backgroundColor:color}]} />
                    <Text style={s.wName} numberOfLines={2}>{w.name}</Text>
                    <View style={s.wFooter}>
                      <Text style={[s.wLabel,{color}]}>{FORMAT_LABEL[w.format]??w.format}</Text>
                      <Text style={s.wBlocs}>{w.steps.length} blocs</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={s.newCard} onPress={() => router.push('/activities/new')} activeOpacity={0.7}>
                <Text style={s.newPlus}>+</Text>
                <Text style={s.newLabel}>New</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{height:100}} />
      </ScrollView>
    </LinearGradient>
  );
}

const g = (a: string) => `rgba(80,40,60,${a})`;

const s = StyleSheet.create({
  root: {flex:1},
  scroll: {flexGrow:1},
  hero: {paddingHorizontal:24,paddingBottom:28},
  eyebrow: {fontSize:10,fontWeight:'600',color:g('0.45'),letterSpacing:2.5,textTransform:'uppercase',marginTop:12,marginBottom:14,fontFamily:MS},
  title: {fontSize:48,fontWeight:'800',color:DARK,letterSpacing:-2.5,lineHeight:50,marginBottom:30,fontFamily:MB},

  glassCta: {backgroundColor:'rgba(255,255,255,0.35)',borderWidth:1,borderColor:'rgba(255,255,255,0.6)',borderRadius:24,padding:20,marginBottom:14},
  glassCtaRow: {flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  ctaEye: {fontSize:9,fontWeight:'700',color:g('0.5'),letterSpacing:2,textTransform:'uppercase',marginBottom:5,fontFamily:MF},
  ctaTitle: {fontSize:22,fontWeight:'800',color:DARK,letterSpacing:-0.5,marginBottom:3,fontFamily:MB},
  ctaSub: {fontSize:11,color:g('0.4'),fontFamily:MR},
  ctaIcon: {width:46,height:46,backgroundColor:'rgba(112,80,160,0.55)',borderRadius:14,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.5)'},

  statsPills: {backgroundColor:'rgba(255,255,255,0.25)',borderWidth:1,borderColor:'rgba(255,255,255,0.45)',borderRadius:18,paddingVertical:13,paddingHorizontal:6,flexDirection:'row',alignItems:'center'},
  pill: {flex:1,alignItems:'center'},
  pillV: {fontSize:18,fontWeight:'800',color:DARK,letterSpacing:-0.5,fontFamily:MB},
  pillL: {fontSize:9,color:g('0.4'),marginTop:3,textTransform:'uppercase',letterSpacing:1,fontFamily:MR},
  pillDiv: {width:1,height:26,backgroundColor:'rgba(100,60,80,0.15)'},

  divider: {height:1,backgroundColor:'rgba(255,255,255,0.3)',marginHorizontal:22,marginBottom:22},

  section: {paddingHorizontal:22,marginBottom:22},
  secLabel: {fontSize:10,fontWeight:'700',color:g('0.45'),letterSpacing:2,textTransform:'uppercase',marginBottom:10,fontFamily:MF},
  secRow: {flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:10},
  seeAll: {fontSize:11,color:'#7050a0',fontWeight:'700',fontFamily:MF},

  glass: {backgroundColor:'rgba(255,255,255,0.35)',borderWidth:1,borderColor:'rgba(255,255,255,0.55)',borderRadius:22,padding:18},
  glassRow: {flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  cardTitle: {fontSize:16,fontWeight:'700',color:DARK,marginBottom:3,fontFamily:MF},
  cardSub: {fontSize:12,color:g('0.45'),fontFamily:MR},
  bigTime: {fontSize:22,fontWeight:'800',color:DARK,letterSpacing:-1,fontFamily:MB},
  badge: {paddingHorizontal:10,paddingVertical:3,borderRadius:8,borderWidth:1},
  badgeText: {fontSize:10,fontWeight:'700',fontFamily:MF},

  grid: {flexDirection:'row',flexWrap:'wrap',gap:10},
  workoutCard: {width:(W-54)/2,borderRadius:20,borderWidth:1,padding:16},
  accent: {width:28,height:4,borderRadius:2,marginBottom:12},
  wName: {fontSize:13,fontWeight:'700',color:DARK,lineHeight:18,marginBottom:12,fontFamily:MF},
  wFooter: {flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  wLabel: {fontSize:10,fontWeight:'700',fontFamily:MF},
  wBlocs: {fontSize:10,color:g('0.35'),fontFamily:MR},

  newCard: {width:(W-54)/2,backgroundColor:'rgba(255,255,255,0.18)',borderWidth:1,borderColor:'rgba(255,255,255,0.35)',borderRadius:20,padding:16,alignItems:'center',justifyContent:'center',minHeight:90},
  newPlus: {fontSize:28,color:g('0.2'),fontWeight:'300',lineHeight:32},
  newLabel: {fontSize:11,color:g('0.3'),fontWeight:'600',fontFamily:MS},
});
