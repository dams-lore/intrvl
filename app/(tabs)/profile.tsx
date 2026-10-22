import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessionStore } from '../../store/sessionStore';

const GRAD: [string,string,string,string] = ['#f0c4a0','#e8b8c8','#d4b8e0','#c8c0e8'];
const DARK = '#2a1a24';
const MF = 'Manrope_700Bold';
const MR = 'Manrope_400Regular';
const MB = 'Manrope_800ExtraBold';
const MS = 'Manrope_600SemiBold';
const NAME_KEY = 'intrvl-user-name';
const g = (a: string) => `rgba(80,40,60,${a})`;

function fmtDuration(s: number) {
  const m = Math.floor(s/60);
  return m < 60 ? `${m} min` : `${Math.floor(m/60)}h${String(m%60).padStart(2,'0')}`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { sessions } = useSessionStore();
  const [name, setName]     = useState('');
  const [draft, setDraft]   = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NAME_KEY).then(v => { if (v) { setName(v); setDraft(v); } });
  }, []);

  async function saveName() {
    const t = draft.trim();
    if (t) { await AsyncStorage.setItem(NAME_KEY, t); setName(t); }
    setEditing(false);
  }

  const totalTime = sessions.reduce((a,s) => a+s.duration_s, 0);

  return (
    <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={s.root}>
      <SafeAreaView style={{flex:1}} edges={['top']}>
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

            <Text style={s.title}>Profile</Text>

            {/* Avatar + name */}
            <View style={s.avatarSection}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{name ? name[0].toUpperCase() : '?'}</Text>
              </View>
              {editing ? (
                <View style={s.nameEdit}>
                  <TextInput style={s.nameInput} value={draft} onChangeText={setDraft}
                    autoFocus returnKeyType="done" onSubmitEditing={saveName}
                    placeholder="Your name" placeholderTextColor={g('0.3')} />
                  <View style={s.editRow}>
                    <TouchableOpacity style={s.saveBtn} onPress={saveName} activeOpacity={0.85}>
                      <Text style={s.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { setDraft(name); setEditing(false); }} activeOpacity={0.7}>
                      <Text style={s.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={() => { setDraft(name); setEditing(true); }} activeOpacity={0.75}>
                  <Text style={name ? s.nameText : s.namePlaceholder}>
                    {name || 'Tap to set your name'}
                  </Text>
                  <Text style={s.nameHint}>intrvl athlete</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Stats */}
            <View style={s.statsRow}>
              <View style={s.statCard}>
                <Text style={s.statV}>{sessions.length}</Text>
                <Text style={s.statL}>Sessions</Text>
              </View>
              <View style={s.statCard}>
                <Text style={s.statV}>{totalTime > 0 ? fmtDuration(totalTime) : '—'}</Text>
                <Text style={s.statL}>Total time</Text>
              </View>
            </View>

            {/* Menu items */}
            <Text style={s.secLabel}>PERSONAL</Text>
            {[
              { icon:'🏃', label:'Running Records', sub:'1k · 5k · 10k · custom', route:'/records' },
            ].map((item) => (
              <TouchableOpacity key={item.route} style={s.menuItem}
                onPress={() => router.push(item.route as any)} activeOpacity={0.8}>
                <Text style={s.menuIcon}>{item.icon}</Text>
                <View style={{flex:1}}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  {item.sub && <Text style={s.menuSub}>{item.sub}</Text>}
                </View>
                <Text style={s.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}

            <Text style={[s.secLabel,{marginTop:20}]}>APP</Text>
            {[
              { icon:'ℹ️', label:'About intrvl', sub:'v0.5.0' },
            ].map((item,i) => (
              <View key={i} style={s.menuItem}>
                <Text style={s.menuIcon}>{item.icon}</Text>
                <View style={{flex:1}}>
                  <Text style={s.menuLabel}>{item.label}</Text>
                  {item.sub && <Text style={s.menuSub}>{item.sub}</Text>}
                </View>
              </View>
            ))}

            <View style={{height:100}} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: {flex:1},
  scroll: {paddingHorizontal:22,paddingBottom:20,flexGrow:1},
  title: {fontSize:34,fontWeight:'800',color:DARK,letterSpacing:-1.5,fontFamily:MB,paddingTop:16,marginBottom:24},

  avatarSection: {flexDirection:'row',alignItems:'center',gap:18,backgroundColor:'rgba(255,255,255,0.35)',borderRadius:24,borderWidth:1,borderColor:'rgba(255,255,255,0.55)',padding:20,marginBottom:16},
  avatar: {width:64,height:64,borderRadius:32,backgroundColor:'rgba(112,80,160,0.55)',alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'rgba(255,255,255,0.5)'},
  avatarText: {fontSize:28,fontWeight:'800',color:'#fff',fontFamily:MB},
  nameText: {fontSize:22,fontWeight:'700',color:DARK,fontFamily:MF},
  namePlaceholder: {fontSize:17,color:g('0.35'),fontStyle:'italic',fontFamily:MR},
  nameHint: {fontSize:12,color:g('0.4'),marginTop:2,fontFamily:MR},
  nameEdit: {flex:1},
  nameInput: {fontSize:20,fontWeight:'700',color:DARK,borderBottomWidth:2,borderBottomColor:'rgba(112,80,160,0.6)',paddingBottom:4,marginBottom:10,fontFamily:MF},
  editRow: {flexDirection:'row',alignItems:'center',gap:12},
  saveBtn: {backgroundColor:'rgba(112,80,160,0.65)',borderRadius:12,paddingHorizontal:16,paddingVertical:8,borderWidth:1,borderColor:'rgba(255,255,255,0.4)'},
  saveBtnText: {color:'#fff',fontWeight:'700',fontSize:14,fontFamily:MF},
  cancelText: {color:g('0.5'),fontSize:14,fontFamily:MR},

  statsRow: {flexDirection:'row',gap:12,marginBottom:24},
  statCard: {flex:1,backgroundColor:'rgba(255,255,255,0.35)',borderRadius:20,borderWidth:1,borderColor:'rgba(255,255,255,0.55)',padding:16,alignItems:'center'},
  statV: {fontSize:24,fontWeight:'800',color:DARK,letterSpacing:-0.5,fontFamily:MB},
  statL: {fontSize:10,color:g('0.45'),marginTop:4,textTransform:'uppercase',letterSpacing:1,fontFamily:MS},

  secLabel: {fontSize:10,fontWeight:'700',color:g('0.45'),letterSpacing:2,textTransform:'uppercase',marginBottom:10,fontFamily:MF},
  menuItem: {backgroundColor:'rgba(255,255,255,0.35)',borderRadius:18,borderWidth:1,borderColor:'rgba(255,255,255,0.55)',padding:16,flexDirection:'row',alignItems:'center',gap:14,marginBottom:8},
  menuIcon: {fontSize:22},
  menuLabel: {fontSize:15,fontWeight:'700',color:DARK,fontFamily:MF},
  menuSub: {fontSize:12,color:g('0.4'),marginTop:2,fontFamily:MR},
  menuArrow: {fontSize:22,color:g('0.2')},
});
