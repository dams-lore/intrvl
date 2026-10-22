import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useSessionStore } from '../../../store/sessionStore';

const GRAD: [string,string,string,string] = ['#f0c4a0','#e8b8c8','#d4b8e0','#c8c0e8'];
const DARK = '#2a1a24';
const MF = 'Manrope_700Bold';
const MR = 'Manrope_400Regular';
const MS = 'Manrope_600SemiBold';
const MB = 'Manrope_800ExtraBold';

const FORMAT_LABEL: Record<string,string> = { for_time:'For Time', amrap:'AMRAP', intervals:'Intervals' };
const FORMAT_COLOR: Record<string,string> = { for_time:'#7050a0', amrap:'#5a9e57', intervals:'#3a6a94' };
const g = (a: string) => `rgba(80,40,60,${a})`;

export default function ActivitiesScreen() {
  const router = useRouter();
  const { workouts, deleteWorkout } = useWorkoutStore();
  const { sessions } = useSessionStore();
  const [search, setSearch] = useState('');

  const filtered = workouts.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  );

  function sessionCount(workoutId: string) {
    return sessions.filter(s => s.workoutId === workoutId).length;
  }

  return (
    <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={s.root}>
      <SafeAreaView style={{flex:1}} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Activities</Text>
            <TouchableOpacity style={s.newBtn} onPress={() => router.push('/activities/new')} activeOpacity={0.85}>
              <Text style={s.newBtnText}>+ New</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={s.searchWrap}>
            <TextInput
              style={s.search}
              value={search}
              onChangeText={setSearch}
              placeholder="Search workouts…"
              placeholderTextColor={g('0.35')}
            />
          </View>

          {/* List */}
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={{fontSize:40,marginBottom:12}}>🏋️</Text>
              <Text style={[s.emptyTitle]}>No workouts yet</Text>
              <Text style={s.emptySub}>Create your first workout above</Text>
            </View>
          ) : (
            filtered.map((w) => {
              const color = FORMAT_COLOR[w.format] ?? '#7050a0';
              const count = sessionCount(w.id);
              return (
                <TouchableOpacity key={w.id} style={s.card}
                  onPress={() => router.push(`/activities/${w.id}`)} activeOpacity={0.82}>
                  <View style={[s.cardAccent, {backgroundColor:color}]} />
                  <View style={s.cardBody}>
                    <View style={s.cardTop}>
                      <Text style={s.cardName} numberOfLines={1}>{w.name}</Text>
                      <View style={[s.badge,{backgroundColor:color+'25',borderColor:color+'40'}]}>
                        <Text style={[s.badgeText,{color}]}>{FORMAT_LABEL[w.format]??w.format}</Text>
                      </View>
                    </View>
                    <View style={s.cardMeta}>
                      <Text style={s.metaItem}>{w.steps.length} blocs</Text>
                      {w.rounds && <Text style={s.metaItem}>· {w.rounds} rounds</Text>}
                      {w.cap_time && <Text style={s.metaItem}>· {Math.floor(w.cap_time/60)}'{String(w.cap_time%60).padStart(2,'0')} cap</Text>}
                      {count > 0 && <Text style={[s.metaItem,{color}]}>· {count} session{count>1?'s':''}</Text>}
                    </View>
                  </View>
                  <Text style={s.arrow}>›</Text>
                </TouchableOpacity>
              );
            })
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
  header: {flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingTop:16,marginBottom:16},
  title: {fontSize:34,fontWeight:'800',color:DARK,letterSpacing:-1.5,fontFamily:MB},
  newBtn: {backgroundColor:'rgba(112,80,160,0.65)',borderRadius:20,paddingHorizontal:16,paddingVertical:9,borderWidth:1,borderColor:'rgba(255,255,255,0.4)'},
  newBtnText: {color:'#fff',fontSize:14,fontWeight:'700',fontFamily:MF},
  searchWrap: {backgroundColor:'rgba(255,255,255,0.35)',borderRadius:16,borderWidth:1,borderColor:'rgba(255,255,255,0.5)',marginBottom:16,paddingHorizontal:14},
  search: {height:44,fontSize:14,color:DARK,fontFamily:MR},
  empty: {alignItems:'center',paddingTop:60},
  emptyTitle: {fontSize:18,fontWeight:'700',color:DARK,fontFamily:MF,marginBottom:6},
  emptySub: {fontSize:14,color:g('0.45'),fontFamily:MR},
  card: {backgroundColor:'rgba(255,255,255,0.35)',borderWidth:1,borderColor:'rgba(255,255,255,0.55)',borderRadius:20,flexDirection:'row',alignItems:'center',marginBottom:10,overflow:'hidden'},
  cardAccent: {width:4,alignSelf:'stretch'},
  cardBody: {flex:1,padding:14},
  cardTop: {flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:6},
  cardName: {fontSize:15,fontWeight:'700',color:DARK,flex:1,marginRight:8,fontFamily:MF},
  badge: {paddingHorizontal:9,paddingVertical:3,borderRadius:8,borderWidth:1},
  badgeText: {fontSize:10,fontWeight:'700',fontFamily:MF},
  cardMeta: {flexDirection:'row',flexWrap:'wrap',gap:2},
  metaItem: {fontSize:12,color:g('0.45'),fontFamily:MR},
  arrow: {fontSize:22,color:g('0.2'),paddingRight:14},
});
