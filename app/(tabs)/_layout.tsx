import { Tabs } from "expo-router";
import { Home, Activity, BarChart2, User } from "lucide-react-native";
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: "#F0EFEB", borderTopColor: "#D8D7D3", borderTopWidth: 1, height: 72, paddingBottom: 8, paddingTop: 8 }, tabBarActiveTintColor: "#A793AC", tabBarInactiveTintColor: "#6B6561", tabBarLabelStyle: { fontSize: 11, fontWeight: "600" } }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="activities" options={{ title: "Activities", tabBarIcon: ({ color, size }) => <Activity color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics", tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={1.8} /> }} />
    </Tabs>
  );
}
