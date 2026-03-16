import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, RefreshControl, Alert } from "react-native";
import { useAgentStore } from "@/lib/stores/agent-store";

const AGENT_INFO: Record<string, { icon: string; description: string }> = {
  steps_agent: { icon: "🚶", description: "Auto-completes health quests from step count" },
  screen_time_agent: { icon: "📱", description: "Tracks screen time, penalizes excess social media" },
  expense_agent: { icon: "💰", description: "Parses bank notifications, logs spending" },
  todo_agent: { icon: "📝", description: "Generates daily plan, reprioritizes, carries over" },
  quest_agent: { icon: "⚔️", description: "Curates daily quests, adaptive difficulty" },
  streak_guardian: { icon: "🔥", description: "Protects streaks, warns when at risk" },
  sleep_agent: { icon: "🌙", description: "Auto-completes sleep quests, recovery mode" },
  weekly_strategist: { icon: "📊", description: "Weekly reports, next-week planning" },
  daily_focus: { icon: "🎯", description: "Reshuffles quests/todos for your focus" },
  notion_sync: { icon: "📓", description: "Syncs expenses and journal to Notion" },
  adaptive_learning: { icon: "🧠", description: "Detects knowledge gaps, micro-learning" },
  calendar: { icon: "📅", description: "Adjusts quest load for busy days" },
  social_accountability: { icon: "🏆", description: "Progress cards, milestone celebrations" },
};

export default function AgentsScreen() {
  const { configs, runs, loading, fetchConfigs, fetchRuns, toggleAgent, triggerAgent } = useAgentStore();
  const [triggering, setTriggering] = useState<string | null>(null);

  useEffect(() => {
    fetchConfigs();
    fetchRuns(20);
  }, []);

  const onRefresh = async () => {
    await Promise.all([fetchConfigs(), fetchRuns(20)]);
  };

  const handleTrigger = async (name: string) => {
    setTriggering(name);
    try {
      const result = await triggerAgent(name);
      Alert.alert("Agent Run", `${name} completed.\nActions: ${result?.actions?.length || 0}`);
      await fetchRuns(20);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setTriggering(null);
    }
  };

  const configMap = Object.fromEntries(configs.map((c: any) => [c.agentName, c]));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0a" }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#e94560" />}
    >
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 4 }}>AI Agents</Text>
      <Text style={{ color: "#666", fontSize: 13, marginBottom: 20 }}>
        13 agents tracking, planning, and optimizing your progress
      </Text>

      {/* Agent Cards */}
      {Object.entries(AGENT_INFO).map(([name, info]) => {
        const config = configMap[name];
        const enabled = config?.enabled !== false;
        return (
          <View
            key={name}
            style={{
              backgroundColor: "#1a1a2e",
              borderRadius: 12,
              padding: 16,
              marginBottom: 10,
              opacity: enabled ? 1 : 0.5,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Text style={{ fontSize: 24, marginRight: 12 }}>{info.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
                    {name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Text>
                  <Text style={{ color: "#999", fontSize: 11, marginTop: 2 }}>{info.description}</Text>
                </View>
              </View>
              <Switch
                value={enabled}
                onValueChange={(v) => toggleAgent(name, v)}
                trackColor={{ false: "#333", true: "#e9456066" }}
                thumbColor={enabled ? "#e94560" : "#666"}
              />
            </View>

            {enabled && (
              <Pressable
                onPress={() => handleTrigger(name)}
                disabled={triggering === name}
                style={{
                  marginTop: 10,
                  backgroundColor: "#0a0a0a",
                  paddingVertical: 8,
                  borderRadius: 6,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#e94560", fontSize: 12, fontWeight: "600" }}>
                  {triggering === name ? "Running..." : "Trigger Now"}
                </Text>
              </Pressable>
            )}
          </View>
        );
      })}

      {/* Recent Runs */}
      {runs.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Recent Actions</Text>
          {runs.slice(0, 10).map((run: any, i: number) => (
            <View
              key={run.id || i}
              style={{
                backgroundColor: "#1a1a2e",
                borderRadius: 8,
                padding: 12,
                marginBottom: 6,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#e94560", fontSize: 12, fontWeight: "600" }}>{run.agentName}</Text>
                <Text style={{ color: "#666", fontSize: 11 }}>
                  {run.createdAt ? new Date(run.createdAt).toLocaleTimeString() : ""}
                </Text>
              </View>
              <Text style={{ color: "#999", fontSize: 12, marginTop: 4 }}>
                {run.eventType} — {run.status || "done"}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
