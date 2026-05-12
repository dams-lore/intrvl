import { View, Text, StyleSheet, SafeAreaView } from "react-native";
export default function ActivitiesScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.title}>Activities</Text>
        <Text style={s.sub}>Your workout library</Text>
        <View style={s.empty}>
          <Text style={s.emptyTitle}>No workouts yet</Text>
          <Text style={s.emptyText}>Workouts you create will appear here</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0EFEB" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 36, fontWeight: "700", color: "#1A1714", letterSpacing: -1, marginBottom: 8 },
  sub: { fontSize: 14, color: "#6B6561", marginBottom: 32 },
  empty: { backgroundColor: "#E8E7E3", borderRadius: 16, padding: 32, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#1A1714", marginBottom: 6 },
  emptyText: { fontSize: 14, color: "#6B6561", textAlign: "center" },
});
