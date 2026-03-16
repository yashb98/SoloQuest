import { Tabs } from "expo-router";
import { Text, View } from "react-native";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: "⚔️",
    Quests: "📜",
    Todos: "✅",
    Agents: "🤖",
    Profile: "👤",
  };
  return (
    <View style={{ alignItems: "center", paddingTop: 4 }}>
      <Text style={{ fontSize: 20 }}>{icons[label] || "•"}</Text>
      <Text style={{ color: focused ? "#e94560" : "#666", fontSize: 10, marginTop: 2 }}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopColor: "#1a1a2e",
          height: 70,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="quests"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Quests" focused={focused} /> }}
      />
      <Tabs.Screen
        name="todos"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Todos" focused={focused} /> }}
      />
      <Tabs.Screen
        name="agents"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Agents" focused={focused} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} /> }}
      />
    </Tabs>
  );
}
