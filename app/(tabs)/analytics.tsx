import { View, Text, StyleSheet, SafeAreaView } from "react-native";
export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.title}>Analytics</Text>
        <Text style={s.sub}>Track your progress</Text>
        <View style={s.stats}>
          {[{ label: "Workouts", value: "0" }, { label: "This week", value: "0" }].map(stat => (
            <View key={stat.label} style={s.statCard}>
              <Text style={s.statLabel}>{stat.label}</Text>
              <Text style={s.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
        <View style={s.empty}>
          <Text style={s.emptyTitle}>Coming soon</Text>
          <Text style={s.emptyText}>Charts appear after your first workouts</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0EFEB" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 36, fontWeight: "700", color: "#1A1714", letterSpacing: -1, marginBottom: 8 },
  sub: { fontSize: 14, color: "#6B6561", marginBottom: 24 },
  stats: { flexDirection: "row", gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#E8E7E3", borderRadius: 16, padding: 20 },
  statLabel: { fontSize: 11, fontWeight: "600", color: "#6B6561", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: "700", color: "#1A1714" },
  empty: { backgroundColor: "#E8E7E3", borderRadius: 16, padding: 32, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "600", color: "#1A1714", marginBottom: 6 },
  emptyText: { fontSize: 14, color: "#6B6561", textAlign: "center" },
});
