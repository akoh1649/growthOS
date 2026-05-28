import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { AGENTS, AgentConfig } from "@/constants/agents";

function AgentCard({ agent, onPress }: { agent: AgentConfig; onPress: () => void }) {
  const colors = useColors();
  const ck = agent.colorKey;
  const color = colors.colorOf(`agent${ck}`);
  const bg = colors.colorOf(`agent${ck}Bg`);

  return (
    <Pressable
      style={({ pressed }) => [
        styles(colors).agentCard,
        { borderColor: color + "40", opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
      testID={`agent-card-${agent.type}`}
    >
      <View style={[styles(colors).iconBox, { backgroundColor: bg }]}>
        <Feather name={agent.icon as never} size={24} color={color} />
      </View>
      <View style={styles(colors).cardBody}>
        <Text style={styles(colors).agentName}>{agent.name}</Text>
        <Text style={styles(colors).agentDesc} numberOfLines={2}>{agent.description}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={color} />
    </Pressable>
  );
}

export default function AgentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const handlePress = useCallback((type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/agent/${type}` as never);
  }, [router]);

  const s = styles(colors);

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={[s.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.headerRow}>
        <Text style={s.title}>AI Agents</Text>
        <Text style={s.subtitle}>6 autonomous growth engines</Text>
      </View>

      <View style={s.list}>
        {AGENTS.map((agent) => (
          <AgentCard
            key={agent.type}
            agent={agent}
            onPress={() => handlePress(agent.type)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16 },
    headerRow: { marginBottom: 20 },
    title: { fontSize: 24, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, fontFamily: "Inter_400Regular" },
    list: { gap: 10 },
    agentCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      gap: 14,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    cardBody: { flex: 1, minWidth: 0 },
    agentName: { fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    agentDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 17 },
  });
