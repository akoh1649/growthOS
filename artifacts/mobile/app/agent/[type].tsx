import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";
import { useAppActive } from "@/hooks/useAppActive";
import { AGENT_MAP, AgentType } from "@/constants/agents";
import { fetchAgent, generateContent } from "@/lib/api";

interface Task {
  id: string;
  agentType: string;
  title: string;
  status: string;
  content: string | null;
  createdAt: string;
  completedAt: string | null;
}

interface ContentItem {
  id: string;
  title: string;
  body: string;
  status: string;
  createdAt: string;
}

interface AgentData {
  agent: { type: string; name: string; description: string };
  tasks: Task[];
  content: ContentItem[];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

const STATUS_ICON: Record<string, string> = {
  completed: "check-circle",
  running: "refresh-cw",
  pending: "clock",
  failed: "alert-circle",
};

const TASK_TITLE: Record<string, string> = {
  seo: "SEO Recommendations",
  geo: "GEO Analysis Report",
  writer: "Blog Post Generation",
  reddit: "Reddit Reply Draft",
  hackernews: "HN Launch Post",
  x: "Tweet Thread",
};

function SpinningIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [rotation]);
  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Feather name={name as never} size={size} color={color} />
    </Animated.View>
  );
}

export default function AgentDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const queryClient = useQueryClient();
  const [generateResult, setGenerateResult] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const agent = AGENT_MAP[type as AgentType];
  const ck = agent?.colorKey ?? "Blue";
  const colorMap = colors as unknown as Record<string, string>;
  const agentColor = colorMap[`agent${ck}`] ?? colors.primary;
  const agentBg = colorMap[`agent${ck}Bg`] ?? colors.muted;
  const isAppActive = useAppActive();

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<AgentData>({
    queryKey: ["agent", type],
    queryFn: () => fetchAgent(type!),
    enabled: !!type,
    retry: 2,
    refetchInterval: isAppActive ? 30_000 : false,
    refetchIntervalInBackground: false,
  });

  const mutation = useMutation({
    mutationFn: () => generateContent(type!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["agent", type] });
      const previous = queryClient.getQueryData<AgentData>(["agent", type]);
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticTask: Task = {
        id: optimisticId,
        agentType: type!,
        title: TASK_TITLE[type!] ?? "Generating…",
        status: "running",
        content: null,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      queryClient.setQueryData<AgentData>(["agent", type], (old) => {
        if (!old) return old;
        return { ...old, tasks: [optimisticTask, ...old.tasks] };
      });
      setGenerateResult(null);
      setGenerateError(null);
      return { previous, optimisticId };
    },
    onSuccess: (json, _vars, context) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const content = json.content ?? json.task?.content ?? "Generated successfully!";
      setGenerateResult(content);
      setGenerateError(null);
      queryClient.setQueryData<AgentData>(["agent", type], (old) => {
        if (!old || !context) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === context.optimisticId
              ? { ...t, status: "completed", content, completedAt: new Date().toISOString() }
              : t
          ),
        };
      });
    },
    onError: (err: Error, _vars, context) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setGenerateError(err.message);
      setGenerateResult(null);
      queryClient.setQueryData<AgentData>(["agent", type], (old) => {
        if (!old || !context) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === context.optimisticId
              ? { ...t, status: "failed", content: err.message }
              : t
          ),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["agent", type] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;
  const s = makeStyles(colors);

  if (!agent) {
    return (
      <View style={[s.centered, { paddingTop: topPad + 20 }]}>
        <Feather name="alert-circle" size={40} color={colors.destructive} />
        <Text style={[s.errorText, { marginTop: 12 }]}>Agent not found</Text>
        <Pressable onPress={() => router.back()} style={[s.backBtn, { marginTop: 16 }]}>
          <Text style={s.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={[s.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      <Pressable
        style={({ pressed }) => [s.backRow, { opacity: pressed ? 0.6 : 1 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
        testID="back-button"
      >
        <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
        <Text style={s.backText}>Agents</Text>
      </Pressable>

      <View style={[s.agentHeader, { backgroundColor: agentBg + "80", borderColor: agentColor + "40" }]}>
        <View style={[s.agentIcon, { backgroundColor: agentBg, borderColor: agentColor + "60" }]}>
          <Feather name={agent.icon as never} size={28} color={agentColor} />
        </View>
        <Text style={s.agentName}>{agent.name}</Text>
        <Text style={s.agentDesc}>{agent.description}</Text>
      </View>

      <View style={[s.generateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.generateTop}>
          <View>
            <Text style={s.generateTitle}>Generate Content</Text>
            <Text style={s.generateSub}>Let {agent.name} create something new</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              s.generateBtn,
              { backgroundColor: agentBg, borderColor: agentColor + "60", opacity: pressed || mutation.isPending ? 0.75 : 1 },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); mutation.mutate(); }}
            disabled={mutation.isPending}
            testID="generate-button"
          >
            {mutation.isPending ? (
              <ActivityIndicator size="small" color={agentColor} />
            ) : (
              <Feather name="zap" size={15} color={agentColor} />
            )}
            <Text style={[s.generateBtnText, { color: agentColor }]}>
              {mutation.isPending ? "Generating…" : agent.generateLabel}
            </Text>
          </Pressable>
        </View>

        {generateResult && (
          <View style={[s.resultBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={s.resultHeader}>
              <Feather name="check-circle" size={13} color={colors.primary} />
              <Text style={[s.resultLabel, { color: colors.primary }]}>Generated</Text>
            </View>
            <Text style={s.resultText}>{generateResult}</Text>
          </View>
        )}
        {generateError && (
          <View style={[s.resultBox, { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "30" }]}>
            <Text style={[s.resultText, { color: colors.destructive }]}>{generateError}</Text>
          </View>
        )}
      </View>

      <Text style={s.sectionTitle}>Recent Tasks</Text>
      {isLoading ? (
        <View style={s.loadingBox}>
          <ActivityIndicator color={agentColor} />
        </View>
      ) : isError ? (
        <View style={s.loadingBox}>
          <Text style={s.errorText}>Failed to load tasks</Text>
        </View>
      ) : (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {(!data?.tasks || data.tasks.length === 0) ? (
            <View style={s.emptyState}>
              <Feather name="inbox" size={28} color={colors.mutedForeground} />
              <Text style={s.emptyText}>No tasks yet</Text>
              <Text style={s.emptySubtext}>Tap Generate to create your first one</Text>
            </View>
          ) : (
            data.tasks.map((task, idx) => {
              const statusColor =
                task.status === "completed" ? colors.primary :
                task.status === "running" ? colors.colorOf("agentBlue") :
                task.status === "failed" ? colors.destructive :
                colors.mutedForeground;
              const iconName = STATUS_ICON[task.status] ?? "clock";
              return (
                <View
                  key={task.id}
                  style={[s.taskRow, idx < data.tasks.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                >
                  <View style={s.taskMain}>
                    <Text style={s.taskTitle}>{task.title}</Text>
                    {task.content && task.content.length > 0 && (
                      <Text style={s.taskContent} numberOfLines={2}>{task.content}</Text>
                    )}
                    <Text style={s.taskTime}>{formatDate(task.createdAt)}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: statusColor + "20" }]}>
                    {task.status === "running" ? (
                      <SpinningIcon name={iconName} size={11} color={statusColor} />
                    ) : (
                      <Feather name={iconName as never} size={11} color={statusColor} />
                    )}
                    <Text style={[s.statusText, { color: statusColor }]}>{task.status}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {data && data.content && data.content.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Generated Content</Text>
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {data.content.map((item, idx) => (
              <View
                key={item.id}
                style={[s.taskRow, idx < data.content.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <View style={s.taskMain}>
                  <Text style={s.taskTitle}>{item.title}</Text>
                  <Text style={s.taskContent} numberOfLines={3}>{item.body}</Text>
                  <Text style={s.taskTime}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={[s.statusBadge, {
                  backgroundColor: item.status === "published"
                    ? colors.primary + "20"
                    : colors.muted,
                }]}>
                  <Text style={[s.statusText, {
                    color: item.status === "published" ? colors.primary : colors.mutedForeground,
                  }]}>{item.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    scroll: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16 },
    centered: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 },
    errorText: { color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 15 },
    backBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    backBtnText: { color: colors.primaryForeground, fontFamily: "Inter_600SemiBold", fontSize: 14 },
    backRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 16 },
    backText: { fontSize: 15, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    agentHeader: { borderRadius: 16, borderWidth: 1, padding: 20, alignItems: "center", marginBottom: 16, gap: 10 },
    agentIcon: { width: 64, height: 64, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    agentName: { fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: "center" },
    agentDesc: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 19 },
    generateCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 24, gap: 12 },
    generateTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
    generateTitle: { fontSize: 15, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    generateSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    generateBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    generateBtnText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    resultBox: { borderRadius: 10, borderWidth: 1, padding: 12 },
    resultHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
    resultLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    resultText: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 18 },
    sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
    listCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
    loadingBox: { alignItems: "center", padding: 24 },
    emptyState: { padding: 28, alignItems: "center", gap: 6 },
    emptyText: { fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    emptySubtext: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" },
    taskRow: { flexDirection: "row", alignItems: "flex-start", padding: 12, gap: 10 },
    taskMain: { flex: 1, minWidth: 0 },
    taskTitle: { fontSize: 13, fontWeight: "500", color: colors.foreground, fontFamily: "Inter_500Medium" },
    taskContent: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 3, lineHeight: 16 },
    taskTime: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 4 },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, flexShrink: 0 },
    statusText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  });
