import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useWorkoutStore } from '../../../store/workoutStore';
import { WorkoutFormat, StepType, Step } from '../../../types/workout';
import { generateId } from '../../../utils/id';

const GRAD: [string,string,string,string] = ['#f0c4a0','#e8b8c8','#d4b8e0','#c8c0e8'];
const DARK = '#2a1a24';
const MF = 'Manrope_700Bold';
const MR = 'Manrope_400Regular';
const MS = 'Manrope_600SemiBold';
const MB = 'Manrope_800ExtraBold';

const C = {
  bg: 'transparent', accent: '#7050a0', green: '#5a9e57', blue: '#3a6a94',
  text: DARK, muted: 'rgba(80,40,60,0.5)', white: 'rgba(255,255,255,0.35)',
  border: 'rgba(255,255,255,0.5)', error: '#E05555',
};

const FORMAT_CONFIG: Record<WorkoutFormat, { label: string; color: string; icon: string; desc: string }> = {
  for_time:  { label: 'For Time',  color: C.accent, icon: '⏱', desc: 'Linear sequence — measure total time' },
  amrap:     { label: 'AMRAP',     color: C.green,  icon: '🔄', desc: 'Max rounds in a fixed time cap' },
  intervals: { label: 'Intervals', color: C.blue,   icon: '🔁', desc: 'Repeat N rounds work / rest' },
};

function Stepper({ value, onChange, min = 1, max = 999 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <View style={ss.stepperWrap}>
      <TouchableOpacity style={ss.stepperBtn} onPress={() => onChange(Math.max(min, value - 1))} activeOpacity={0.7}>
        <Text style={ss.stepperBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={ss.stepperVal}>{value}</Text>
      <TouchableOpacity style={ss.stepperBtn} onPress={() => onChange(Math.min(max, value + 1))} activeOpacity={0.7}>
        <Text style={ss.stepperBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const ss = StyleSheet.create({
  stepperWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 14, borderWidth: 1.5, borderColor: C.border, overflow: 'hidden', alignSelf: 'flex-start' },
  stepperBtn: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg },
  stepperBtnText: { fontSize: 26, color: C.text, fontWeight: '300', fontFamily: 'Inter_300Light' },
  stepperVal: { minWidth: 72, textAlign: 'center', fontSize: 22, fontWeight: '700', color: C.text, fontFamily: 'Inter_700Bold' },
});

export default function NewWorkoutScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { createWorkout, updateWorkout, getById } = useWorkoutStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [format, setFormat] = useState<WorkoutFormat>('for_time');
  const [name, setName] = useState('');
  const [capTimeMin, setCapTimeMin] = useState(20);
  const [capTimeSec, setCapTimeSec] = useState(0);
  const [rounds, setRounds] = useState(6);
  const [blocks, setBlocks] = useState<Step[]>([]);

  const [showBlockForm, setShowBlockForm] = useState(false);
  const [bType, setBType] = useState<StepType>('reps');
  const [bMove, setBMove] = useState('');
  const [bVal, setBVal] = useState('');
  const [bUnit, setBUnit] = useState('km');
  const [bWeight, setBWeight] = useState('');
  const [bWeightUnit, setBWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [bHeight, setBHeight] = useState('');
  const [bPace, setBPace] = useState('');
  const [bHr, setBHr] = useState('');
  const [bNotes, setBNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [nameError, setNameError] = useState('');
  const [blockError, setBlockError] = useState('');

  // ── Photo import ──────────────────────────────────────────────────────────
  const [importing, setImporting] = useState(false);
  const [importedImage, setImportedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    const w = getById(editId);
    if (!w) return;
    setFormat(w.format);
    setName(w.name);
    if (w.cap_time) {
      setCapTimeMin(Math.floor(w.cap_time / 60));
      setCapTimeSec(w.cap_time % 60);
    }
    if (w.rounds) setRounds(w.rounds);
    setBlocks(w.steps);
    setStep(3);
  }, [editId]);

  // ── Photo import logic ───────────────────────────────────────────────────
  async function importFromPhoto(source: 'camera' | 'library') {
    try {
      let result;
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) { Alert.alert('Permission requise', 'Autorise l\'accès à la caméra dans les réglages.'); return; }
        result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.8 });
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { Alert.alert('Permission requise', 'Autorise l\'accès aux photos dans les réglages.'); return; }
        result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.8 });
      }
      if (result.canceled || !result.assets?.[0]?.base64) return;

      const base64 = result.assets[0].base64!;
      const uri    = result.assets[0].uri;
      setImportedImage(uri);
      setImporting(true);

      const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;
      if (!apiKey) throw new Error('Clé API manquante dans .env');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5-5',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: 'image/jpeg', data: base64 },
              },
              {
                type: 'text',
                text: `Analyse cette image d'un workout fitness et extrais les informations. Réponds UNIQUEMENT avec un objet JSON valide, sans texte ni backticks, avec cette structure exacte:
{
  "name": "nom du workout (si visible dans l'image, sinon 'WOD ${today}')",
  "format": "for_time" | "amrap" | "intervals",
  "cap_time": <secondes totales si AMRAP, sinon null>,
  "rounds": <nombre de rounds si intervals, sinon null>,
  "steps": [
    {
      "type": "reps" | "distance" | "time",
      "movement": "nom du mouvement",
      "value": <nombre>,
      "unit": "km" | "m" | "mi" | "s" | "min" | null,
      "weight": <kg si précisé, sinon null>,
      "notes": "infos supplémentaires si utile, sinon null"
    }
  ]
}
Règles:
- format "for_time" si c'est une séquence à finir le plus vite possible
- format "amrap" si il y a un time cap et l'objectif est max rounds
- format "intervals" si il y a des répétitions de work/rest/rounds
- Pour les reps: type="reps", pas d'unit
- Pour les distances: type="distance", unit="km" ou "m" ou "mi"
- Pour les temps: type="time", unit="s" ou "min"
- Si un cap time est indiqué (ex: "12 min AMRAP"), cap_time = 720
- Ne mets jamais de commentaires dans le JSON`,
              },
            ],
          }],
        }),
      });

const rawText = await response.text();
console.log('[AI STATUS]', response.status);
console.log('[AI RAW]', rawText.substring(0, 500));

if (!response.ok) {
  let errMsg = `HTTP ${response.status}`;
  try { errMsg = (JSON.parse(rawText) as any)?.error?.message ?? errMsg; } catch {}
  throw new Error(errMsg);
}

let data: any;
try {
  data = JSON.parse(rawText);
} catch {
  throw new Error('Réponse API invalide');
}

const text = data.content?.find((b: any) => b.type === 'text')?.text ?? '';
console.log('[AI RAW TEXT]', text);

let parsed: any;
try {
  parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
} catch {
  throw new Error('Réponse IA invalide');
      }

      // Pré-remplir le formulaire
      setName(parsed.name ?? `WOD ${today}`);
      setFormat(parsed.format ?? 'for_time');
      if (parsed.cap_time) {
        setCapTimeMin(Math.floor(parsed.cap_time / 60));
        setCapTimeSec(parsed.cap_time % 60);
      }
      if (parsed.rounds) setRounds(parsed.rounds);

      const steps: Step[] = (parsed.steps ?? []).map((st: any) => ({
        id:        generateId(),
        type:      st.type ?? 'reps',
        movement:  st.movement ?? '',
        value:     Number(st.value) || 0,
        ...(st.unit   ? { unit: st.unit }     : {}),
        ...(st.weight ? { weight: st.weight } : {}),
        ...(st.notes  ? { notes: st.notes }   : {}),
      }));
      setBlocks(steps);
      setStep(2); // → étape nom + config pour review
    } catch (e: any) {
      Alert.alert('Erreur', e.message ?? 'Impossible d\'analyser la photo. Réessaie.');
    } finally {
      setImporting(false);
    }
  }

  function showPhotoOptions() {
    Alert.alert('Importer un workout', 'Choisir la source', [
      { text: '📷  Prendre une photo', onPress: () => importFromPhoto('camera') },
      { text: '🖼  Depuis la galerie',  onPress: () => importFromPhoto('library') },
      { text: 'Annuler', style: 'cancel' },
    ]);
  }

  function resetBlockForm() {
    setBType('reps'); setBMove(''); setBVal(''); setBUnit('km');
    setBWeight(''); setBWeightUnit('kg'); setBHeight(''); setBPace('');
    setBHr(''); setBNotes(''); setShowAdvanced(false); setBlockError('');
  }

  function handleAddBlock() {
    if (!bMove.trim()) { setBlockError('Movement name is required'); return; }
    const num = parseFloat(bVal);
    if (!bVal || isNaN(num) || num <= 0) { setBlockError('Enter a valid value'); return; }
    const block: Step = {
      id: generateId(), type: bType, movement: bMove.trim(), value: num,
      ...(bType !== 'reps' ? { unit: bUnit as any } : {}),
      ...(bWeight ? { weight: parseFloat(bWeight), weight_unit: bWeightUnit } : {}),
      ...(bHeight ? { height: parseFloat(bHeight) } : {}),
      ...(bPace ? { target_pace: bPace.trim() } : {}),
      ...(bHr ? { target_hr: parseFloat(bHr) } : {}),
      ...(bNotes ? { notes: bNotes.trim() } : {}),
    };
    setBlocks((prev) => [...prev, block]);
    resetBlockForm();
    setShowBlockForm(false);
  }

  function handleDeleteBlock(id: string) {
    Alert.alert('Delete this block?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setBlocks((p) => p.filter((b) => b.id !== id)) },
    ]);
  }

  function handleMoveBlock(index: number, dir: 'up' | 'down') {
    const arr = [...blocks];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    setBlocks(arr);
  }

  function handleBack() {
    if (step === 1 || (step === 3 && editId)) return router.back();
    if (step === 2) return setStep(1);
    if (step === 3) return setStep(2);
  }

  function handleNextFromStep2() {
    if (!name.trim()) { setNameError('Name is required'); return; }
    setNameError('');
    setStep(3);
  }

  function handleSave() {
    if (blocks.length === 0) { Alert.alert('No blocks', 'Add at least one block before saving.'); return; }
    const payload = {
      name: name.trim() || 'Untitled workout', format, steps: blocks,
      ...(format === 'amrap' ? { cap_time: capTimeMin * 60 + capTimeSec } : {}),
      ...(format === 'intervals' ? { rounds } : {}),
    };
    if (editId) {
      updateWorkout(editId, payload);
      router.back();
    } else {
      const w = createWorkout(payload);
      // Replace so the user lands on their new workout detail (not back on the previous [id] screen)
      router.replace({ pathname: '/activities/[id]', params: { id: w.id } });
    }
  }

  function blockLabel(b: Step): string {
    if (b.type === 'reps') return `${b.value} reps — ${b.movement}`;
    if (b.type === 'distance') return `${b.value} ${b.unit} — ${b.movement}`;
    if (b.type === 'time') return `${b.value}${b.unit} — ${b.movement}`;
    return b.movement;
  }

  if (step === 1) {
    return (
      <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={{flex:1}}>
      <SafeAreaView style={s.container} edges={['top','bottom']}>
        {/* Loading overlay pendant l'analyse IA */}
        {importing && (
          <View style={s.importOverlay}>
            {importedImage && <Image source={{ uri: importedImage }} style={s.importThumb} />}
            <ActivityIndicator size="large" color={C.accent} style={{ marginTop: 20 }} />
            <Text style={s.importingText}>Analyse du workout en cours…</Text>
            <Text style={s.importingSub}>L'IA lit ta photo ✨</Text>
          </View>
        )}
        <View style={s.topBar}>
          <TouchableOpacity onPress={handleBack} style={s.backTap}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.stepTitle}>New workout</Text>
          <Text style={s.stepSub}>Choose a format</Text>

          {/* ── Photo import CTA ── */}
          <TouchableOpacity style={s.photoCta} onPress={showPhotoOptions} activeOpacity={0.85}>
            <Text style={s.photoCtaIcon}>📷</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.photoCtaTitle}>Import from photo</Text>
              <Text style={s.photoCtaSub}>Photo d'un tableau, WOD sheet, screenshot…</Text>
            </View>
            <Text style={s.photoCtaArrow}>→</Text>
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>ou créer manuellement</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={{ marginTop: 8 }}>
            {(Object.entries(FORMAT_CONFIG) as [WorkoutFormat, (typeof FORMAT_CONFIG)[WorkoutFormat]][]).map(([key, cfg]) => (
              <TouchableOpacity key={key} style={s.fmtCard}
                onPress={() => { setFormat(key); setStep(2); }} activeOpacity={0.82}>
                <View style={{ flex: 1 }}>
                  <Text style={s.fmtLabel}>{cfg.label}</Text>
                  <Text style={s.fmtDesc}>{cfg.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      </LinearGradient>
    );
  }

  if (step === 2) {
    const cfg = FORMAT_CONFIG[format];
    return (
      <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={{flex:1}}>
      <SafeAreaView style={s.container} edges={['top','bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={s.topBar}>
            <TouchableOpacity onPress={handleBack} style={s.backTap}><Text style={s.backText}>← Back</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
            <View style={[s.pill, { backgroundColor: cfg.color + '25' }]}>
              <Text style={[s.pillText, { color: cfg.color }]}>{cfg.icon}  {cfg.label}</Text>
            </View>
            <Text style={s.stepTitle}>Name your workout</Text>
            <View style={s.fieldGroup}>
              <Text style={s.label}>WORKOUT NAME</Text>
              <TextInput style={[s.input, nameError ? s.inputError : null]} placeholder="e.g. MADX Stamina, Annie, Fran…"
                placeholderTextColor={C.muted} value={name}
                onChangeText={(t) => { setName(t); if (t.trim()) setNameError(''); }}
                autoFocus returnKeyType="done" onSubmitEditing={handleNextFromStep2} />
              {nameError ? <Text style={s.errText}>{nameError}</Text> : null}
            </View>
            {format === 'amrap' && (
              <View style={s.fieldGroup}>
                <Text style={s.label}>TIME CAP</Text>
                <View style={s.capRow}>
                  <View style={s.capField}>
                    <Text style={s.capUnit}>MIN</Text>
                    <Stepper value={capTimeMin} onChange={setCapTimeMin} min={0} max={120} />
                  </View>
                  <Text style={s.capSep}>:</Text>
                  <View style={s.capField}>
                    <Text style={s.capUnit}>SEC</Text>
                    <Stepper value={capTimeSec} onChange={(v) => setCapTimeSec(Math.round(v / 5) * 5 > 55 ? 55 : Math.round(v / 5) * 5)} min={0} max={55} />
                  </View>
                </View>
              </View>
            )}
            {format === 'intervals' && (
              <View style={s.fieldGroup}>
                <Text style={s.label}>NUMBER OF ROUNDS</Text>
                <Stepper value={rounds} onChange={setRounds} min={1} max={99} />
              </View>
            )}
            <TouchableOpacity style={s.primaryBtn} onPress={handleNextFromStep2} activeOpacity={0.85}>
              <Text style={s.primaryBtnText}>Add blocks  →</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </LinearGradient>
    );
  }

  const cfg = FORMAT_CONFIG[format];
  return (
    <LinearGradient colors={GRAD} locations={[0,0.33,0.66,1]} style={{flex:1}}>
    <SafeAreaView style={s.container} edges={['top','bottom']}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={handleBack} style={s.backTap}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        <TouchableOpacity style={[s.saveBtn, blocks.length === 0 && s.saveBtnDisabled]} onPress={handleSave} activeOpacity={0.85}>
          <Text style={s.saveBtnText}>{editId ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[s.content, { paddingBottom: 60 }]} keyboardShouldPersistTaps="handled">
          <View style={[s.pill, { backgroundColor: cfg.color + '25' }]}>
            <Text style={[s.pillText, { color: cfg.color }]}>{cfg.icon}  {cfg.label}</Text>
          </View>
          <Text style={s.stepTitle}>{name || 'My workout'}</Text>
          {format === 'amrap' && (
            <Text style={s.stepSub}>
              Cap: {capTimeMin}'{String(capTimeSec).padStart(2, '0')}
            </Text>
          )}
          {format === 'intervals' && <Text style={s.stepSub}>{rounds} rounds</Text>}

          <Text style={[s.label, { marginTop: 28, marginBottom: 8 }]}>BLOCKS {blocks.length > 0 ? `(${blocks.length})` : ''}</Text>
          {blocks.length === 0 && !showBlockForm && <Text style={s.emptyBlocks}>No blocks yet. Add your first one below.</Text>}

          {blocks.map((b, i) => (
            <View key={b.id} style={s.blockRow}>
              <View style={s.blockNum}><Text style={s.blockNumText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.blockLabel}>{blockLabel(b)}</Text>
                {b.target_pace && <Text style={s.blockMeta}>🏃 Pace {b.target_pace}</Text>}
                {b.height && <Text style={s.blockMeta}>📏 H {b.height} cm</Text>}
                {b.weight && <Text style={s.blockMeta}>🏋️ {b.weight} {b.weight_unit ?? 'kg'}</Text>}
                {b.notes && <Text style={s.blockMeta}>💬 {b.notes}</Text>}
              </View>
              <View style={s.blockCtrl}>
                <TouchableOpacity onPress={() => handleMoveBlock(i, 'up')} style={s.ctrlBtn} disabled={i === 0}>
                  <Text style={[s.ctrlIcon, i === 0 && s.ctrlDisabled]}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMoveBlock(i, 'down')} style={s.ctrlBtn} disabled={i === blocks.length - 1}>
                  <Text style={[s.ctrlIcon, i === blocks.length - 1 && s.ctrlDisabled]}>↓</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteBlock(b.id)} style={s.ctrlBtn}>
                  <Text style={[s.ctrlIcon, { color: C.error }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {showBlockForm ? (
            <View style={s.blockForm}>
              <Text style={s.blockFormTitle}>New block</Text>
              <Text style={s.label}>TYPE</Text>
              <View style={s.segRow}>
                {(['reps', 'distance', 'time'] as StepType[]).map((t) => (
                  <TouchableOpacity key={t} style={[s.seg, bType === t && s.segActive]}
                    onPress={() => { setBType(t); setBUnit(t === 'distance' ? 'km' : 's'); }}>
                    <Text style={[s.segText, bType === t && s.segActiveText]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>{bType === 'reps' ? 'REPS' : bType === 'distance' ? 'DISTANCE' : 'DURATION'}</Text>
                  <TextInput style={[s.input, { textAlign: 'center', fontSize: 20 }]} placeholder="0"
                    placeholderTextColor={C.muted} value={bVal} onChangeText={setBVal} keyboardType="decimal-pad" />
                </View>
                {bType !== 'reps' && (
                  <View style={{ marginLeft: 12 }}>
                    <Text style={s.label}>UNIT</Text>
                    <View style={s.segRow}>
                      {(bType === 'distance' ? ['m', 'km', 'mi'] : ['s', 'min']).map((u) => (
                        <TouchableOpacity key={u} style={[s.seg, { minWidth: 50 }, bUnit === u && s.segActive]} onPress={() => setBUnit(u)}>
                          <Text style={[s.segText, bUnit === u && s.segActiveText]}>{u}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
              <Text style={[s.label, { marginTop: 12 }]}>MOVEMENT / EXERCISE</Text>
              <TextInput style={s.input} placeholder="e.g. Run, Toes to Bar, Row…" placeholderTextColor={C.muted}
                value={bMove} onChangeText={setBMove} returnKeyType="done" />
              {blockError ? <Text style={s.errText}>{blockError}</Text> : null}
              <TouchableOpacity style={s.advToggle} onPress={() => setShowAdvanced(!showAdvanced)}>
                <Text style={s.advToggleText}>{showAdvanced ? '▲  Hide advanced settings' : '▼  Advanced settings'}</Text>
              </TouchableOpacity>
              {showAdvanced && (
                <View style={s.advSection}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.label}>WEIGHT</Text>
                      <TextInput style={s.input} placeholder="0" placeholderTextColor={C.muted} value={bWeight} onChangeText={setBWeight} keyboardType="decimal-pad" />
                    </View>
                    <View style={{ marginLeft: 12 }}>
                      <Text style={s.label}>UNIT</Text>
                      <View style={s.segRow}>
                        {(['kg', 'lb'] as const).map((u) => (
                          <TouchableOpacity key={u} style={[s.seg, { minWidth: 50 }, bWeightUnit === u && s.segActive]} onPress={() => setBWeightUnit(u)}>
                            <Text style={[s.segText, bWeightUnit === u && s.segActiveText]}>{u}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={[s.label, { marginTop: 12 }]}>HEIGHT (CM)</Text>
                  <TextInput style={s.input} placeholder="e.g. 50" placeholderTextColor={C.muted} value={bHeight} onChangeText={setBHeight} keyboardType="decimal-pad" />
                  <Text style={[s.label, { marginTop: 12 }]}>TARGET PACE</Text>
                  <TextInput style={s.input} placeholder="e.g. 3k · 5k · 4:30 min/km" placeholderTextColor={C.muted} value={bPace} onChangeText={setBPace} />
                  <Text style={[s.label, { marginTop: 12 }]}>TARGET HR (BPM OR %)</Text>
                  <TextInput style={s.input} placeholder="e.g. 160" placeholderTextColor={C.muted} value={bHr} onChangeText={setBHr} keyboardType="decimal-pad" />
                  <Text style={[s.label, { marginTop: 12 }]}>NOTES</Text>
                  <TextInput style={[s.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Free text…"
                    placeholderTextColor={C.muted} value={bNotes} onChangeText={setBNotes} multiline />
                </View>
              )}
              <View style={s.formActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => { resetBlockForm(); setShowBlockForm(false); }}>
                  <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.primaryBtn, { flex: 1, marginLeft: 10 }]} onPress={handleAddBlock}>
                  <Text style={s.primaryBtnText}>Add block</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={s.addBlockBtn} onPress={() => setShowBlockForm(true)} activeOpacity={0.8}>
              <Text style={s.addBlockBtnText}>+  Add a block</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backTap: { paddingVertical: 8, paddingRight: 16 },
  backText: { fontSize: 15, color: C.accent, fontWeight: '600', fontFamily: MF },
  saveBtn: { backgroundColor: 'rgba(90,158,87,0.7)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, fontFamily: MF },
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 6 },
  pillText: { fontSize: 13, fontWeight: '700', fontFamily: MF },
  stepTitle: { fontSize: 26, fontWeight: '800', color: DARK, fontFamily: MB, marginBottom: 2 },
  stepSub: { fontSize: 14, color: 'rgba(80,40,60,0.5)', marginTop: 4, fontFamily: MR },
  label: { fontSize: 11, fontWeight: '700', color: 'rgba(80,40,60,0.5)', letterSpacing: 1.5, marginBottom: 8, textTransform: 'uppercase', fontFamily: MF },
  fieldGroup: { marginTop: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: DARK, fontFamily: MR },
  inputError: { borderColor: C.error },
  errText: { fontSize: 13, color: C.error, marginTop: 5, fontFamily: MR },
  primaryBtn: { backgroundColor: 'rgba(112,80,160,0.7)', borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', fontFamily: MF },
  fmtCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 20, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' },
  fmtIcon: { fontSize: 28, marginRight: 16 },
  fmtLabel: { fontSize: 18, fontWeight: '700', color: DARK, fontFamily: MF },
  fmtDesc: { fontSize: 13, color: 'rgba(80,40,60,0.5)', marginTop: 3, fontFamily: MR },
  fmtDot: { width: 9, height: 9, borderRadius: 5, marginLeft: 8 },
  emptyBlocks: { fontSize: 14, color: 'rgba(80,40,60,0.45)', fontStyle: 'italic', marginBottom: 12, fontFamily: MR },
  blockRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  blockNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  blockNumText: { fontSize: 13, fontWeight: '700', color: DARK, fontFamily: MF },
  blockLabel: { fontSize: 15, fontWeight: '600', color: DARK, fontFamily: MF },
  blockMeta: { fontSize: 12, color: 'rgba(80,40,60,0.5)', marginTop: 3, fontFamily: MR },
  blockCtrl: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  ctrlBtn: { padding: 8 },
  ctrlIcon: { fontSize: 18, color: C.accent },
  ctrlDisabled: { color: 'rgba(80,40,60,0.2)' },
  addBlockBtn: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(112,80,160,0.5)', borderRadius: 16, paddingVertical: 20, alignItems: 'center', marginTop: 10 },
  addBlockBtnText: { fontSize: 16, fontWeight: '600', color: C.accent, fontFamily: MF },
  blockForm: { backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 18, padding: 16, marginTop: 10, borderWidth: 1, borderColor: 'rgba(112,80,160,0.35)' },
  blockFormTitle: { fontSize: 16, fontWeight: '700', color: DARK, marginBottom: 14, fontFamily: MF },
  segRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  seg: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  segActive: { backgroundColor: 'rgba(112,80,160,0.65)', borderColor: 'rgba(255,255,255,0.4)' },
  segText: { fontSize: 14, fontWeight: '600', color: DARK, fontFamily: MF },
  segActiveText: { color: '#fff' },
  advToggle: { marginTop: 14, paddingVertical: 8 },
  advToggleText: { fontSize: 14, color: C.accent, fontWeight: '600', fontFamily: MF },
  advSection: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.4)', marginTop: 8, paddingTop: 8 },
  formActions: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12 },
  cancelText: { fontSize: 15, fontWeight: '600', color: 'rgba(80,40,60,0.5)', fontFamily: MF },
  capRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  capField:{ flex: 1, alignItems: 'center', gap: 4 },
  capUnit: { fontSize: 11, fontWeight: '700', color: 'rgba(80,40,60,0.5)', letterSpacing: 1.5, fontFamily: MF },
  capSep:  { fontSize: 28, fontWeight: '700', color: DARK, marginTop: 18, fontFamily: MB },
  photoCta: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(42,26,36,0.75)', borderRadius: 22,
    paddingVertical: 20, paddingHorizontal: 22,
    marginTop: 24, marginBottom: 8, gap: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  photoCtaIcon:  { fontSize: 28 },
  photoCtaTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: MF, marginBottom: 3 },
  photoCtaSub:   { fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: MR },
  photoCtaArrow: { fontSize: 20, color: 'rgba(255,255,255,0.35)' },
  dividerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.4)' },
  dividerText: { fontSize: 12, color: 'rgba(80,40,60,0.45)', fontFamily: MR },
  importOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(240,196,160,0.95)',
    zIndex: 99, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
  },
  importThumb: { width: 160, height: 160, borderRadius: 20, resizeMode: 'cover', opacity: 0.6 },
  importingText: { fontSize: 18, fontWeight: '700', color: DARK, fontFamily: MF, marginTop: 16, textAlign: 'center' },
  importingSub: { fontSize: 14, color: 'rgba(80,40,60,0.6)', marginTop: 6, fontFamily: MR, textAlign: 'center' },
});
