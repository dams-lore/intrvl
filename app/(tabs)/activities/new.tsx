import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWorkoutStore } from '../../../store/workoutStore';
import { WorkoutFormat, StepType, Step } from '../../../types/workout';
import { generateId } from '../../../utils/id';

const C = {
  bg: '#F0EFEB', accent: '#A793AC', green: '#7DB87A', blue: '#5B8DB8',
  text: '#1A1714', muted: '#6B6560', white: '#FFFFFF', border: '#E0DED9', error: '#E05555',
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
  stepperBtnText: { fontSize: 26, color: C.text, fontWeight: '300' },
  stepperVal: { minWidth: 72, textAlign: 'center', fontSize: 22, fontWeight: '700', color: C.text },
});

export default function NewWorkoutScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { createWorkout, updateWorkout, getById } = useWorkoutStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [format, setFormat] = useState<WorkoutFormat>('for_time');
  const [name, setName] = useState('');
  const [capTimeMin, setCapTimeMin] = useState(20);
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

  useEffect(() => {
    if (!editId) return;
    const w = getById(editId);
    if (!w) return;
    setFormat(w.format);
    setName(w.name);
    if (w.cap_time) setCapTimeMin(w.cap_time / 60);
    if (w.rounds) setRounds(w.rounds);
    setBlocks(w.steps);
    setStep(3);
  }, [editId]);

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
      ...(format === 'amrap' ? { cap_time: capTimeMin * 60 } : {}),
      ...(format === 'intervals' ? { rounds } : {}),
    };
    if (editId) { updateWorkout(editId, payload); } else { createWorkout(payload); }
    router.back();
  }

  function blockLabel(b: Step): string {
    if (b.type === 'reps') return `${b.value} reps — ${b.movement}`;
    if (b.type === 'distance') return `${b.value} ${b.unit} — ${b.movement}`;
    if (b.type === 'time') return `${b.value}${b.unit} — ${b.movement}`;
    return b.movement;
  }

  if (step === 1) {
    return (
      <SafeAreaView style={s.container}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={handleBack} style={s.backTap}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.stepTitle}>New workout</Text>
          <Text style={s.stepSub}>Choose a format</Text>
          <View style={{ marginTop: 24 }}>
            {(Object.entries(FORMAT_CONFIG) as [WorkoutFormat, (typeof FORMAT_CONFIG)[WorkoutFormat]][]).map(([key, cfg]) => (
              <TouchableOpacity key={key} style={[s.fmtCard, { borderColor: cfg.color, borderWidth: 2 }]}
                onPress={() => { setFormat(key); setStep(2); }} activeOpacity={0.82}>
                <Text style={s.fmtIcon}>{cfg.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.fmtLabel}>{cfg.label}</Text>
                  <Text style={s.fmtDesc}>{cfg.desc}</Text>
                </View>
                <View style={[s.fmtDot, { backgroundColor: cfg.color }]} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (step === 2) {
    const cfg = FORMAT_CONFIG[format];
    return (
      <SafeAreaView style={s.container}>
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
                <Text style={s.label}>TIME CAP (MINUTES)</Text>
                <Stepper value={capTimeMin} onChange={setCapTimeMin} min={1} max={120} />
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
    );
  }

  const cfg = FORMAT_CONFIG[format];
  return (
    <SafeAreaView style={s.container}>
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
          {format === 'amrap' && <Text style={s.stepSub}>Cap: {capTimeMin} min</Text>}
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
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backTap: { paddingVertical: 8, paddingRight: 16 },
  backText: { fontSize: 16, color: C.accent, fontWeight: '500' },
  saveBtn: { backgroundColor: C.green, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { color: C.white, fontWeight: '700', fontSize: 15 },
  content: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40 },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 6 },
  pillText: { fontSize: 13, fontWeight: '700' },
  stepTitle: { fontSize: 26, fontWeight: '700', color: C.text },
  stepSub: { fontSize: 15, color: C.muted, marginTop: 4 },
  label: { fontSize: 12, fontWeight: '700', color: C.muted, letterSpacing: 0.6, marginBottom: 8 },
  fieldGroup: { marginTop: 20 },
  input: { backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: C.text },
  inputError: { borderColor: C.error },
  errText: { fontSize: 13, color: C.error, marginTop: 5 },
  primaryBtn: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 17, alignItems: 'center', marginTop: 28 },
  primaryBtnText: { color: C.white, fontSize: 16, fontWeight: '700' },
  fmtCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderRadius: 18, padding: 20, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  fmtIcon: { fontSize: 30, marginRight: 16 },
  fmtLabel: { fontSize: 18, fontWeight: '700', color: C.text },
  fmtDesc: { fontSize: 13, color: C.muted, marginTop: 3 },
  fmtDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
  emptyBlocks: { fontSize: 14, color: C.muted, fontStyle: 'italic', marginBottom: 12 },
  blockRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.white, borderRadius: 12, padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  blockNum: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1 },
  blockNumText: { fontSize: 13, fontWeight: '700', color: C.text },
  blockLabel: { fontSize: 15, fontWeight: '600', color: C.text },
  blockMeta: { fontSize: 12, color: C.muted, marginTop: 3 },
  blockCtrl: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 },
  ctrlBtn: { padding: 8 },
  ctrlIcon: { fontSize: 18, color: C.accent },
  ctrlDisabled: { color: '#D0CEC9' },
  addBlockBtn: { borderWidth: 2, borderStyle: 'dashed', borderColor: C.accent, borderRadius: 14, paddingVertical: 20, alignItems: 'center', marginTop: 10 },
  addBlockBtnText: { fontSize: 16, fontWeight: '600', color: C.accent },
  blockForm: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginTop: 10, borderWidth: 1.5, borderColor: C.accent },
  blockFormTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 14 },
  segRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  seg: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border },
  segActive: { backgroundColor: C.accent, borderColor: C.accent },
  segText: { fontSize: 14, fontWeight: '600', color: C.text },
  segActiveText: { color: C.white },
  advToggle: { marginTop: 14, paddingVertical: 8 },
  advToggleText: { fontSize: 14, color: C.accent, fontWeight: '600' },
  advSection: { borderTopWidth: 1, borderTopColor: C.border, marginTop: 8, paddingTop: 8 },
  formActions: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  cancelBtn: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: C.bg },
  cancelText: { fontSize: 15, fontWeight: '600', color: C.muted },
});
