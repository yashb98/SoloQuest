import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, RefreshControl } from "react-native";
import { useTodoStore } from "@/lib/stores/todo-store";
import { agents } from "@/lib/api";

export default function TodosScreen() {
  const { todos, loading, fetch, create, complete, remove } = useTodoStore();
  const [newTitle, setNewTitle] = useState("");
  const [focusSetting, setFocusSetting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(today);
  }, []);

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await create({ title: newTitle.trim(), date: today });
    setNewTitle("");
  };

  const handleDailyFocus = async (focus: string) => {
    setFocusSetting(true);
    try {
      await agents.dailyFocus(focus);
      await fetch(today);
    } finally {
      setFocusSetting(false);
    }
  };

  const pending = todos.filter((t: any) => !t.isCompleted);
  const done = todos.filter((t: any) => t.isCompleted);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0a" }}
      contentContainerStyle={{ padding: 20, paddingTop: 60 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => fetch(today)} tintColor="#e94560" />}
    >
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 8 }}>Today's Todos</Text>
      <Text style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>{today}</Text>

      {/* Quick Focus Buttons */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: "#999", fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
          Set Focus (AI reshuffles your day)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {["Health", "Learning", "Jobs", "Finance", "Focus", "Rest"].map((f) => (
            <Pressable
              key={f}
              onPress={() => handleDailyFocus(f.toLowerCase())}
              disabled={focusSetting}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: "#1a1a2e",
                marginRight: 8,
                opacity: focusSetting ? 0.5 : 1,
              }}
            >
              <Text style={{ color: "#e94560", fontSize: 13, fontWeight: "600" }}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Add Todo */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
        <TextInput
          value={newTitle}
          onChangeText={setNewTitle}
          placeholder="Add a todo..."
          placeholderTextColor="#666"
          onSubmitEditing={handleAdd}
          style={{
            flex: 1,
            backgroundColor: "#1a1a2e",
            borderRadius: 8,
            paddingHorizontal: 14,
            paddingVertical: 12,
            color: "#fff",
            fontSize: 14,
          }}
        />
        <Pressable
          onPress={handleAdd}
          style={{
            backgroundColor: "#e94560",
            borderRadius: 8,
            paddingHorizontal: 16,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>+</Text>
        </Pressable>
      </View>

      {/* Pending */}
      {pending.map((todo: any) => (
        <Pressable
          key={todo.id}
          onPress={() => complete(todo.id)}
          onLongPress={() => remove(todo.id)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#1a1a2e",
            borderRadius: 10,
            padding: 14,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 2,
              borderColor: "#e94560",
              marginRight: 12,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 14 }}>{todo.title}</Text>
            {todo.category && (
              <Text style={{ color: "#666", fontSize: 11, marginTop: 2, textTransform: "capitalize" }}>
                {todo.category} {todo.aiGenerated ? "• AI" : ""}
              </Text>
            )}
            {/* Progress Bar */}
            {(todo.progressTarget > 0 || todo.progress > 0) && (
              <View style={{ marginTop: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                  <Text style={{ color: "#999", fontSize: 10 }}>
                    {todo.progressCurrent ?? 0}{todo.progressUnit ? ` ${todo.progressUnit}` : ""} / {todo.progressTarget}
                  </Text>
                  <Text style={{ color: "#e94560", fontSize: 10, fontWeight: "700" }}>{todo.progress ?? 0}%</Text>
                </View>
                <View style={{ height: 4, backgroundColor: "#0a0a0a", borderRadius: 2 }}>
                  <View
                    style={{
                      height: 4,
                      width: `${Math.min(todo.progress ?? 0, 100)}%`,
                      backgroundColor: (todo.progress ?? 0) >= 100 ? "#10b981" : "#e94560",
                      borderRadius: 2,
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </Pressable>
      ))}

      {/* Done */}
      {done.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: "#666", fontSize: 13, fontWeight: "600", marginBottom: 8 }}>
            Completed ({done.length})
          </Text>
          {done.map((todo: any) => (
            <View
              key={todo.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#1a1a2e",
                borderRadius: 10,
                padding: 14,
                marginBottom: 6,
                opacity: 0.5,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: "#10b981",
                  marginRight: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
              </View>
              <Text style={{ color: "#999", fontSize: 14, textDecorationLine: "line-through" }}>
                {todo.title}
              </Text>
            </View>
          ))}
        </View>
      )}

      {todos.length === 0 && !loading && (
        <View style={{ alignItems: "center", paddingVertical: 40 }}>
          <Text style={{ color: "#666", fontSize: 14 }}>No todos yet. Set a focus or add one!</Text>
        </View>
      )}
    </ScrollView>
  );
}
