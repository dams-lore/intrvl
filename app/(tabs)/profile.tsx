import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { User, ChevronRight } from "lucide-react-native";
const ITEMS = [{ label: "Units", sub: "kg / km" }, { label: "Connected devices", sub: "Apple Watch, Garmin" }, { label: "Notifications", sub: "Enabled" }, { label: "About", sub: "v1.0.0" }];
export default function ProfileScreen() {
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.title}>Profile</Text>
        <View style={s.avatarWrap}>
          <View style={s.avatar}><User color="#fff" size={36} strokeWidth={1.5} /></View>
          <Text style={s.name}>Athlete</Text>
          <Text style={s.tagline}>Let's get to work</Text>
        </View>
        <View style={s.menu}>
          {ITEMS.map((item, idx) => (
            <TouchableOpacity key={item.label} style={[s.row, idx < ITEMS.length - 1 && s.border]} activeOpacity={0.7}>
              <View>
                <Text style={s.rowLabel}>{item.label}</Text>
                <Text style={s.rowSub}>{item.sub}</Text>
              </View>
              <ChevronRight color="#6B6561" size={18} strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F0EFEB" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontSize: 36, fontWeight: "700", color: "#1A1714", letterSpacing: -1, marginBottom: 32 },
  avatarWrap: { alignItems: "center", marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#A793AC", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  name: { fontSize: 20, fontWeight: "700", color: "#1A1714" },
  tagline: { fontSize: 14, color: "#6B6561", marginTop: 4 },
  menu: { backgroundColor: "#E8E7E3", borderRadius: 16, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  border: { borderBottomWidth: 1, borderBottomColor: "#D8D7D3" },
  rowLabel: { fontSize: 14, fontWeight: "600", color: "#1A1714" },
  rowSub: { fontSize: 12, color: "#6B6561", marginTop: 2 },
});
