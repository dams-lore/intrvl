import { Tabs } from 'expo-router';
import { Home, Activity, BarChart2, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(232,200,220,0.72)',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(255,255,255,0.6)',
          height: 76,
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor:   '#7050a0',
        tabBarInactiveTintColor: 'rgba(80,40,60,0.4)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: 'Manrope_600SemiBold',
        },
      }}
    >
      <Tabs.Screen name="index"      options={{ title: 'Home',       tabBarIcon: ({ color, size }) => <Home     color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="activities" options={{ title: 'Activities', tabBarIcon: ({ color, size }) => <Activity color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="analytics"  options={{ title: 'Analytics',  tabBarIcon: ({ color, size }) => <BarChart2 color={color} size={size} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="profile"    options={{ title: 'Profile',    tabBarIcon: ({ color, size }) => <User     color={color} size={size} strokeWidth={1.8} /> }} />
    </Tabs>
  );
}
