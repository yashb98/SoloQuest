import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useHunterStore } from "@/lib/stores/hunter-store";
import "../global.css";

export default function RootLayout() {
  const fetch = useHunterStore((s) => s.fetch);

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0a0a0a" },
          animation: "fade",
        }}
      />
    </>
  );
}
