import { useEffect } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useHunterStore } from "@/lib/stores/hunter-store";

const RANK_COLORS: Record<string, string> = {
  E: "#9ca3af",
  D: "#22c55e",
  C: "#3b82f6",
  B: "#a855f7",
  A: "#f59e0b",
  S: "#e94560",
};

const STAT_LABELS: Record<string, { label: string; color: string }> = {
  vitality: { label: "Vitality", color: "#ef4444" },
  intel: { label: "Intelligence", color: "#3b82f6" },
  hustle: { label: "Hustle", color: "#f59e0b" },
  wealth: { label: "Wealth", color: "#10b981" },
  focus: { label: "Focus", color: "#8b5cf6" },
  agentIQ: { label: "Agent IQ", color: "#06b6d4" },
};

export default function ProfileScreen() {
  const { hunter, loading, fetch } = useHunterStore();

  useEffect(() => {
    fetch();
  }, []);

  if (!hunter) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#666" }}>Loading profile...</Text>
      </View>
    );
  }

  const rankColor = RANK_COLORS[hunter.rank] || "#666";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0a" }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetch} tintColor="#e94560" />}
    >
      {/* Profile Card */}
      <View style={{ backgroundColor: "#1a1a2e", borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 20 }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: rankColor + "33",
            borderWidth: 3,
            borderColor: rankColor,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: rankColor, fontSize: 28, fontWeight: "900" }}>{hunter.rank}</Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>{hunter.hunterName}</Text>
        <Text style={{ color: rankColor, fontSize: 15, fontWeight: "600", marginTop: 4 }}>
          {hunter.rank}-Rank Hunter • Level {hunter.rankLevel}
        </Text>
        {hunter.class && (
          <Text style={{ color: "#e94560", fontSize: 13, marginTop: 4 }}>Class: {hunter.class}</Text>
        )}
      </View>

      {/* Progress */}
      <View style={{ backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Progress</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <StatBox label="Total Level" value={hunter.level} color="#00d4ff" />
          <StatBox label="XP" value={`${hunter.xp}/${hunter.xpToNext}`} color="#00d4ff" />
          <StatBox label="Gold" value={hunter.gold} color="#ffd700" />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <StatBox label="Streak" value={`${hunter.streak || 0}d`} color="#e94560" />
          <StatBox label="Best Streak" value={`${hunter.bestStreak || 0}d`} color="#f59e0b" />
          <StatBox label="Shields" value={hunter.streakShields || 0} color="#8b5cf6" />
        </View>
      </View>

      {/* Detailed Stats */}
      <View style={{ backgroundColor: "#1a1a2e", borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 12 }}>Stats Breakdown</Text>
        {Object.entries(STAT_LABELS).map(([key, { label, color }]) => {
          const val = hunter[key] || 0;
          return (
            <View key={key} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#0a0a0a" }}>
              <Text style={{ color: "#999", fontSize: 14 }}>{label}</Text>
              <Text style={{ color, fontSize: 16, fontWeight: "800" }}>{val}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color, fontSize: 18, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: "#666", fontSize: 10, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
