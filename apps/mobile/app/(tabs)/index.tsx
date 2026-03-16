import { useEffect } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { useHunterStore } from "@/lib/stores/hunter-store";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useTodoStore } from "@/lib/stores/todo-store";

const STAT_COLORS: Record<string, string> = {
  vitality: "#ef4444",
  intel: "#3b82f6",
  hustle: "#f59e0b",
  wealth: "#10b981",
  focus: "#8b5cf6",
  agentIQ: "#06b6d4",
};

function StatBar({ name, value, max = 100 }: { name: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = STAT_COLORS[name] || "#666";
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
        <Text style={{ color: "#999", fontSize: 12, textTransform: "uppercase" }}>{name}</Text>
        <Text style={{ color, fontSize: 12, fontWeight: "700" }}>{value}</Text>
      </View>
      <View style={{ height: 6, backgroundColor: "#1a1a2e", borderRadius: 3 }}>
        <View style={{ height: 6, width: `${pct}%`, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { hunter, loading, fetch } = useHunterStore();
  const { quests, fetch: fetchQuests } = useQuestStore();
  const { todos, fetch: fetchTodos } = useTodoStore();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch();
    fetchQuests();
    fetchTodos(today);
  }, []);

  const onRefresh = async () => {
    await Promise.all([fetch(), fetchQuests(), fetchTodos(today)]);
  };

  if (!hunter) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#666", fontSize: 16 }}>{loading ? "Loading..." : "Connect to server"}</Text>
      </View>
    );
  }

  const activeQuests = quests.filter((q: any) => q.isActive && !q.isCompleted);
  const completedToday = quests.filter((q: any) => q.isCompleted).length;
  const todosLeft = todos.filter((t: any) => !t.isCompleted).length;
  const xpPct = hunter.xpToNext > 0 ? Math.min((hunter.xp / hunter.xpToNext) * 100, 100) : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0a" }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#e94560" />}
    >
      {/* Header */}
      <View style={{ marginBottom: 24 }}>
        <Text style={{ color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: 2 }}>
          System Interface
        </Text>
        <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 }}>
          {hunter.hunterName}
        </Text>
        <Text style={{ color: "#e94560", fontSize: 14, fontWeight: "600", marginTop: 2 }}>
          {hunter.class || "Unclassed"}
        </Text>
      </View>

      {/* XP Bar */}
      <View style={{ backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ color: "#00d4ff", fontSize: 14, fontWeight: "700" }}>XP</Text>
          <Text style={{ color: "#666", fontSize: 12 }}>
            {hunter.xp} / {hunter.xpToNext}
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: "#0a0a0a", borderRadius: 4 }}>
          <View
            style={{
              height: 8,
              width: `${xpPct}%`,
              backgroundColor: "#00d4ff",
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Quick Stats Row */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: "#1a1a2e", borderRadius: 12, padding: 12, alignItems: "center" }}>
          <Text style={{ color: "#ffd700", fontSize: 20, fontWeight: "800" }}>{hunter.gold}</Text>
          <Text style={{ color: "#666", fontSize: 10, marginTop: 2 }}>GOLD</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: "#1a1a2e", borderRadius: 12, padding: 12, alignItems: "center" }}>
          <Text style={{ color: "#e94560", fontSize: 20, fontWeight: "800" }}>{hunter.streak || 0}</Text>
          <Text style={{ color: "#666", fontSize: 10, marginTop: 2 }}>STREAK</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: "#1a1a2e", borderRadius: 12, padding: 12, alignItems: "center" }}>
          <Text style={{ color: "#00d4ff", fontSize: 20, fontWeight: "800" }}>{completedToday}</Text>
          <Text style={{ color: "#666", fontSize: 10, marginTop: 2 }}>DONE</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: "#1a1a2e", borderRadius: 12, padding: 12, alignItems: "center" }}>
          <Text style={{ color: "#8b5cf6", fontSize: 20, fontWeight: "800" }}>{todosLeft}</Text>
          <Text style={{ color: "#666", fontSize: 10, marginTop: 2 }}>TODO</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={{ backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Stats</Text>
        {Object.keys(STAT_COLORS).map((stat) => (
          <StatBar key={stat} name={stat} value={hunter[stat] || 0} />
        ))}
      </View>

      {/* Active Quests Preview */}
      <View style={{ backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
          Active Quests ({activeQuests.length})
        </Text>
        {activeQuests.slice(0, 3).map((q: any) => {
          const hasProgress = (q.progressTarget > 0 || q.progress > 0);
          const progress = q.progress ?? 0;
          const catColor = STAT_COLORS[q.statTarget] || "#e94560";
          const diffColor = q.difficulty === "hard" ? "#e94560" : q.difficulty === "medium" ? "#f59e0b" : "#10b981";

          return (
            <View
              key={q.id}
              style={{
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#0a0a0a22",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: diffColor,
                    marginRight: 10,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 14 }}>{q.title}</Text>
                  <Text style={{ color: "#666", fontSize: 11 }}>
                    +{q.xpReward} XP • {q.category}
                  </Text>
                </View>
                {hasProgress && (
                  <Text style={{ color: catColor, fontSize: 12, fontWeight: "700" }}>{progress}%</Text>
                )}
              </View>

              {/* Mini Progress Bar */}
              {hasProgress && (
                <View style={{ marginTop: 6, marginLeft: 18 }}>
                  <View style={{ height: 4, backgroundColor: "#0a0a0a", borderRadius: 2 }}>
                    <View
                      style={{
                        height: 4,
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: progress >= 100 ? "#10b981" : catColor,
                        borderRadius: 2,
                      }}
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}
        {activeQuests.length === 0 && (
          <Text style={{ color: "#666", fontSize: 13 }}>No active quests — check the Quest board!</Text>
        )}
      </View>
    </ScrollView>
  );
}
