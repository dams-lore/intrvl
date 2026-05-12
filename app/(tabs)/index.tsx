import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Zap } from "lucide-react-native";
export default function HomeScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.eyebrow}>Good morning</Text>
        <Text style={s.title}>Ready to{"\n"}work?</Text>
        <TouchableOpacity style={s.card} activeOpacity={0.85}>
          <View>
            <Text style={s.cardEyebrow}>Quick Start</Text>
            <Text style={s.cardTitle}>New Workout</Text>
            <Text style={s.cardSub}>Choose your format</Text>
          </View>
          <Zap color="#fff" size={28} strokeWidth={2} />
        </TouchableOpacity>
        <View style={s.pills}>
          {["For Time","AMRAP","EMOM","HYROX"].map(f => (
            <TouchableOpacity key={f} style={s.pill} activeOpacity={0.7}>
              <Text style={s.pillText}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={s.sectionTitle}>Recent</Text>
        <View style={s.empty}>
          <Text style={s.emptyText}>No workouts yet. Start your first!</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0EFEB" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  eyebrow: { fontSize: 12, fontWeight: "600", color: "#6B6561", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 },
  title: { fontSize: 36, fontWeight: "700", color: "#1A1714", letterSpacing: -1, marginBottom: 32 },
  card: { backgroundColor: "#A793AC", borderRadius: 24, padding: 28, marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardEyebrow: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 },
  cardTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  cardSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  pills: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 32 },
  pill: { backgroundColor: "#E8E7E3", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  pillText: { fontSize: 12, fontWeight: "700", color: "#1A1714" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1A1714", marginBottom: 12 },
  empty: { backgroundColor: "#E8E7E3", borderRadius: 16, padding: 20, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#6B6561" },
});
