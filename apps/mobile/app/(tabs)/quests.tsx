import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl, Alert } from "react-native";
import { useQuestStore } from "@/lib/stores/quest-store";
import { useHunterStore } from "@/lib/stores/hunter-store";

const CATEGORY_COLORS: Record<string, string> = {
  health: "#ef4444",
  learning: "#3b82f6",
  jobs: "#f59e0b",
  finance: "#10b981",
  focus: "#8b5cf6",
  mental: "#06b6d4",
};

const DIFFICULTY_BADGE: Record<string, { color: string; label: string }> = {
  easy: { color: "#10b981", label: "E" },
  medium: { color: "#f59e0b", label: "M" },
  hard: { color: "#e94560", label: "H" },
};

export default function QuestsScreen() {
  const { quests, loading, fetch, complete, fail } = useQuestStore();
  const refresh = useHunterStore((s) => s.refresh);
  const [filter, setFilter] = useState<string>("active");

  useEffect(() => {
    fetch();
  }, []);

  const onRefresh = async () => {
    await fetch();
  };

  const handleComplete = (quest: any) => {
    Alert.alert("Complete Quest", `Mark "${quest.title}" as done?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          await complete(quest.id);
          refresh();
        },
      },
    ]);
  };

  const handleFail = (quest: any) => {
    Alert.alert("Fail Quest", `Give up on "${quest.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Fail",
        style: "destructive",
        onPress: async () => {
          await fail(quest.id);
          refresh();
        },
      },
    ]);
  };

  const filtered =
    filter === "active"
      ? quests.filter((q: any) => q.isActive && !q.isCompleted)
      : filter === "completed"
        ? quests.filter((q: any) => q.isCompleted)
        : quests;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0a" }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#e94560" />}
    >
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 16 }}>Quest Board</Text>

      {/* Filter Tabs */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {["active", "completed", "all"].map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor: filter === f ? "#e94560" : "#1a1a2e",
            }}
          >
            <Text style={{ color: filter === f ? "#fff" : "#999", fontSize: 13, fontWeight: "600", textTransform: "capitalize" }}>
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Quest Cards */}
      {filtered.map((quest: any) => {
        const catColor = CATEGORY_COLORS[quest.category] || "#666";
        const diff = DIFFICULTY_BADGE[quest.difficulty] || DIFFICULTY_BADGE.easy;
        return (
          <View
            key={quest.id}
            style={{
              backgroundColor: "#1a1a2e",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              borderLeftWidth: 3,
              borderLeftColor: catColor,
              opacity: quest.isCompleted ? 0.6 : 1,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>{quest.title}</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                  <Text style={{ color: "#00d4ff", fontSize: 12 }}>+{quest.xpReward} XP</Text>
                  <Text style={{ color: "#ffd700", fontSize: 12 }}>+{quest.goldReward}g</Text>
                  <Text style={{ color: catColor, fontSize: 12, textTransform: "capitalize" }}>{quest.category}</Text>
                  <View style={{ backgroundColor: diff.color + "33", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <Text style={{ color: diff.color, fontSize: 10, fontWeight: "700" }}>{diff.label}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            {(quest.progressTarget > 0 || quest.progress > 0) && !quest.isCompleted && (
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ color: "#999", fontSize: 11 }}>
                    {quest.progressCurrent ?? 0}{quest.progressUnit ? ` ${quest.progressUnit}` : ""} / {quest.progressTarget}{quest.progressUnit ? ` ${quest.progressUnit}` : ""}
                  </Text>
                  <Text style={{ color: catColor, fontSize: 11, fontWeight: "700" }}>{quest.progress ?? 0}%</Text>
                </View>
                <View style={{ height: 6, backgroundColor: "#0a0a0a", borderRadius: 3 }}>
                  <View
                    style={{
                      height: 6,
                      width: `${Math.min(quest.progress ?? 0, 100)}%`,
                      backgroundColor: (quest.progress ?? 0) >= 100 ? "#10b981" : catColor,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>
            )}

            {!quest.isCompleted && quest.isActive && (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <Pressable
                  onPress={() => handleComplete(quest)}
                  style={{ flex: 1, backgroundColor: "#10b981", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>Complete</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleFail(quest)}
                  style={{ flex: 1, backgroundColor: "#ef444433", paddingVertical: 10, borderRadius: 8, alignItems: "center" }}
                >
                  <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 13 }}>Fail</Text>
                </Pressable>
              </View>
            )}

            {quest.isCompleted && (
              <Text style={{ color: "#10b981", fontSize: 12, marginTop: 8, fontWeight: "600" }}>✓ Completed</Text>
            )}
          </View>
        );
      })}

      {filtered.length === 0 && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ color: "#666", fontSize: 14 }}>No quests to show</Text>
        </View>
      )}
    </ScrollView>
  );
}
