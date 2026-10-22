import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useRecordsStore, parseTimeInput, fmtTime, calcPace } from '../store/recordsStore';

const C = {
  bg: '#F0EFEB', white: '#FFFFFF', text: '#1A1714',
  muted: '#6B6560', accent: '#A793AC', green: '#7DB87A',
  border: '#E0DED9', error: '#E05555',
};

export default function RecordsScreen() {
  const router = useRouter();
  const { runRecords, upsertRunRecord, deleteRunRecord } = useRecordsStore();

  // Form state pour custom record
  const [showAddForm, setShowAddForm] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customDist, setCustomDist]   = useState('');
  const [customTime, setCustomTime]   = useState('');
  const [customKg, setCustomKg]       = useState('');

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime]   = useState('');

  /** Auto-formate la saisie en MM:SS pendant la frappe */
  function handleTimeChange(raw: string, setter: (v: string) => void) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) setter(digits);
    else setter(digits.slice(0, 2) + ':' + digits.slice(2));
  }

  function handleSaveEdit(id: string, label: string, distance_m: number) {
    const secs = parseTimeInput(editTime);
    if (!secs) { Alert.alert('Temps invalide', 'Ex: 4\'30 ou 4:30'); return; }
    upsertRunRecord(label, distance_m, secs);
    setEditingId(null);
    setEditTime('');
  }

  function handleAddCustom() {
    if (!customLabel.trim()) { Alert.alert('Erreur', 'Entre un label (ex: 3k ou 1RM Squat)'); return; }
    const hasTime = customTime.trim().length > 0;
    const hasKg   = customKg.trim().length > 0;
    if (!hasTime && !hasKg) { Alert.alert('Erreur', 'Entre au moins un temps ou un poids'); return; }

    const secs = hasTime ? parseTimeInput(customTime) : 0;
    const distNum = parseFloat(customDist.replace(',', '.'));
    const distance_m = distNum > 0 ? (distNum < 100 ? distNum * 1000 : distNum) : 1000;
    const kg = hasKg ? parseFloat(customKg.replace(',', '.')) : undefined;

    upsertRunRecord(customLabel.trim().toLowerCase(), distance_m, secs, kg);
    setCustomLabel(''); setCustomDist(''); setCustomTime(''); setCustomKg('');
    setShowAddForm(false);
  }

  function confirmDelete(id: string, label: string) {
    Alert.alert(
      `Supprimer ${label} ?`,
      'Ce record sera effacé.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteRunRecord(id) },
      ]
    );
  }

  const defaultIds = ['run-1k', 'run-5k', 'run-10k'];

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>Records</Text>
          <TouchableOpacity onPress={() => setShowAddForm(true)} style={s.addBtn}>
            <Text style={s.addBtnText}>+ Custom</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Text style={s.sectionLabel}>🏃 RUNNING</Text>

          {runRecords.map((rec) => {
            const pace    = rec.time_s ? calcPace(rec.distance_m, rec.time_s) : null;
            const isEdit  = editingId === rec.id;
            const isDefault = defaultIds.includes(rec.id);

            return (
              <TouchableOpacity
                key={rec.id}
                style={s.recordCard}
                onLongPress={() => !isDefault && confirmDelete(rec.id, rec.label)}
                delayLongPress={500}
                activeOpacity={0.85}
              >
                <View style={s.recordLeft}>
                  <Text style={s.recordLabel}>{rec.label.toUpperCase()}</Text>
                  {isEdit ? (
                    <TextInput
                      style={s.timeInput}
                      value={editTime}
                      onChangeText={(v) => handleTimeChange(v, setEditTime)}
                      placeholder="00:00"
                      placeholderTextColor={C.muted}
                      keyboardType="number-pad"
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={() => handleSaveEdit(rec.id, rec.label, rec.distance_m)}
                    />
                  ) : (
                    <TouchableOpacity onPress={() => { setEditingId(rec.id); setEditTime(rec.time_s ? fmtTime(rec.time_s) : ''); }}>
                      <Text style={rec.time_s ? s.recordTime : s.recordTimePlaceholder}>
                        {rec.time_s ? fmtTime(rec.time_s) : 'Tap to set'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={s.recordRight}>
                  {pace && !isEdit && (
                    <View style={s.paceBlock}>
                      <Text style={s.paceLabel}>{pace.pace_label}</Text>
                      <Text style={s.speedLabel}>{pace.speed_label}</Text>
                    </View>
                  )}
                  {rec.kg != null && !isEdit && (
                    <View style={s.paceBlock}>
                      <Text style={s.paceLabel}>{rec.kg} kg</Text>
                    </View>
                  )}
                  {isEdit ? (
                    <View style={s.editActions}>
                      <TouchableOpacity style={s.saveBtn} onPress={() => handleSaveEdit(rec.id, rec.label, rec.distance_m)}>
                        <Text style={s.saveBtnText}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={s.cancelEditBtn} onPress={() => setEditingId(null)}>
                        <Text style={s.cancelEditText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add custom form */}
          {showAddForm && (
            <View style={s.addForm}>
              <Text style={s.addFormTitle}>Ajouter un record custom</Text>
              <View style={s.formRow}>
                <Text style={s.formFieldLabel}>LABEL</Text>
                <TextInput
                  style={s.formInput} value={customLabel} onChangeText={setCustomLabel}
                  placeholder="ex: 3k, 1RM Squat" placeholderTextColor={C.muted}
                />
              </View>
              <View style={s.formRow}>
                <Text style={s.formFieldLabel}>DISTANCE (km)</Text>
                <TextInput
                  style={s.formInput} value={customDist} onChangeText={setCustomDist}
                  placeholder="ex: 3  (laisser vide si force)" placeholderTextColor={C.muted}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={s.formRowDouble}>
                <View style={{ flex: 1 }}>
                  <Text style={s.formFieldLabel}>TEMPS (MM:SS)</Text>
                  <TextInput
                    style={s.formInput} value={customTime}
                    onChangeText={(v) => handleTimeChange(v, setCustomTime)}
                    placeholder="00:00" placeholderTextColor={C.muted}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.formFieldLabel}>POIDS (kg)</Text>
                  <TextInput
                    style={s.formInput} value={customKg} onChangeText={setCustomKg}
                    placeholder="ex: 150" placeholderTextColor={C.muted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={s.formActions}>
                <TouchableOpacity style={s.saveBtn} onPress={handleAddCustom}>
                  <Text style={s.saveBtnText}>Ajouter</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.cancelEditBtn} onPress={() => {
                  setShowAddForm(false);
                  setCustomLabel(''); setCustomDist('');
                  setCustomTime(''); setCustomKg('');
                }}>
                  <Text style={s.cancelEditText}>Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <Text style={s.hint}>
            💡 Ces records sont utilisés pour calculer ton allure cible pendant les workouts run.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingBottom: 60 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn:  { paddingVertical: 6, paddingRight: 12 },
  backText: { fontSize: 15, color: C.accent, fontWeight: '600', fontFamily: 'Inter_700Bold' },
  title:    { fontSize: 17, fontWeight: '700', color: C.text, fontFamily: 'Inter_700Bold' },
  addBtn:   { paddingVertical: 6, paddingLeft: 12 },
  addBtnText: { fontSize: 15, color: C.accent, fontWeight: '600', fontFamily: 'Inter_700Bold' },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 2, marginTop: 24, marginBottom: 12,
    fontFamily: 'Inter_700Bold',
  },

  recordCard: {
    backgroundColor: C.white, borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 14,
    marginBottom: 8, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
  },
  recordLeft:  { flex: 1 },
  recordRight: { alignItems: 'flex-end', gap: 6 },

  recordLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1.5, marginBottom: 4, fontFamily: 'Inter_700Bold',
  },
  recordTime: {
    fontSize: 22, fontWeight: '700', color: C.text, fontFamily: 'Inter_700Bold',
  },
  recordTimePlaceholder: {
    fontSize: 16, color: '#C0BDB9', fontStyle: 'italic', fontFamily: 'Inter_400Regular',
  },
  timeInput: {
    fontSize: 22, fontWeight: '700', color: C.text,
    borderBottomWidth: 2, borderBottomColor: C.accent,
    paddingBottom: 2, minWidth: 80, fontFamily: 'Inter_700Bold',
  },

  paceBlock:  { alignItems: 'flex-end' },
  paceLabel:  { fontSize: 15, fontWeight: '700', color: C.accent, fontFamily: 'Inter_700Bold' },
  speedLabel: { fontSize: 12, color: C.muted, fontFamily: 'Inter_400Regular' },

  editActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  saveBtn: {
    backgroundColor: C.accent, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  saveBtnText:    { color: '#FFF', fontWeight: '700', fontSize: 14, fontFamily: 'Inter_700Bold' },
  cancelEditBtn:  { paddingHorizontal: 10, paddingVertical: 8 },
  cancelEditText: { color: C.muted, fontWeight: '600', fontSize: 14, fontFamily: 'Inter_700Bold' },
  deleteBtn:      { padding: 8 },
  deleteBtnText:  { fontSize: 18 },

  addForm: {
    backgroundColor: C.white, borderRadius: 16, padding: 18,
    marginTop: 8, marginBottom: 8, gap: 10,
    borderWidth: 2, borderColor: C.accent,
  },
  addFormTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 4, fontFamily: 'Inter_700Bold' },
  formInput: {
    fontSize: 16, color: C.text,
    borderBottomWidth: 1, borderBottomColor: C.border,
    paddingVertical: 8, fontFamily: 'Inter_400Regular',
  },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
  formRow: { gap: 4 },
  formRowDouble: { flexDirection: 'row', gap: 16 },
  formFieldLabel: {
    fontSize: 10, fontWeight: '700', color: C.muted,
    letterSpacing: 1.5, marginBottom: 2, fontFamily: 'Inter_700Bold',
  },

  hint: {
    fontSize: 13, color: C.muted, marginTop: 24,
    lineHeight: 20, fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
