import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";
import { AGENT_MAP, AgentType } from "@/constants/agents";
import { fetchDashboard } from "@/lib/api";

interface Site {
  id: string;
  url: string;
  name: string;
  lastAnalysis: { score: number; issues: number; created_at: string } | null;
}

interface Task {
  id: string;
  agentType: string;
  title: string;
  status: string;
  createdAt: string;
}

interface DashboardData {
  sites: Site[];
  recentTasks: Task[];
  agentCounts: Record<string, number>;
  totalAnalyses: number;
  contentGenerated: number;
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
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const STATUS_ICON: Record<string, string> = {
  completed: "check-circle",
  running: "refresh-cw",
  pending: "clock",
  failed: "alert-circle",
};

function AgentColorBadge({ agentType, colors }: { agentType: string; colors: ReturnType<typeof useColors> }) {
  const config = AGENT_MAP[agentType as AgentType];
  if (!config) return null;
  const ck = config.colorKey;
  const color = (colors as Record<string, string>)[`agent${ck}`];
  const bg = (colors as Record<string, string>)[`agent${ck}Bg`];
  return (
    <View style={[styles.agentDot, { backgroundColor: bg, borderColor: color + "40" }]}>
      <Feather name={config.icon as never} size={10} color={color} />
    </View>
  );
}

function StatusDot({ status, colors }: { status: string; colors: ReturnType<typeof useColors> }) {
  const color =
    status === "completed" ? colors.primary :
    status === "running" ? (colors as Record<string, string>).agentBlue :
    status === "failed" ? colors.destructive :
    colors.mutedForeground;
  const icon = STATUS_ICON[status] ?? "clock";
  return <Feather name={icon as never} size={13} color={color} />;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = makeStyles(colors);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard,
    retry: 2,
  });

  const handleAgentPress = useCallback((type: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/agent/${type}` as never);
  }, [router]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  if (isLoading) {
    return (
      <View style={[s.container, { paddingTop: topPad + 20 }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[s.loadingText, { marginTop: 12 }]}>Loading dashboard…</Text>
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[s.container, { paddingTop: topPad + 20 }]}>
        <Feather name="alert-circle" size={40} color={colors.destructive} />
        <Text style={[s.errorText, { marginTop: 12 }]}>Failed to load dashboard</Text>
        <Pressable onPress={() => refetch()} style={[s.retryBtn, { marginTop: 16 }]}>
          <Text style={s.retryBtnText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const avgScore =
    data.sites.length > 0
      ? Math.round(data.sites.reduce((sum, s) => sum + (s.lastAnalysis?.score ?? 0), 0) / data.sites.length)
      : 0;
  const runningTasks = data.recentTasks.filter((t) => t.status === "running").length;

  const kpis = [
    { label: "Sites", value: String(data.sites.length), icon: "globe", color: colors.primary, bg: colors.primary + "18" },
    { label: "SEO Score", value: `${avgScore}`, suffix: "/100", icon: "bar-chart-2", color: (colors as Record<string, string>).agentBlue, bg: (colors as Record<string, string>).agentBlueBg },
    { label: "Running", value: String(runningTasks), icon: "activity", color: (colors as Record<string, string>).agentPurple, bg: (colors as Record<string, string>).agentPurpleBg },
    { label: "Content", value: String(data.contentGenerated), icon: "file-text", color: (colors as Record<string, string>).agentAmber, bg: (colors as Record<string, string>).agentAmberBg },
  ];

  const agentTypes: AgentType[] = ["seo", "geo", "writer", "reddit", "hackernews", "x"];

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={[s.content, { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
      }
    >
      <View style={s.headerRow}>
        <View>
          <Text style={s.greeting}>Growth Dashboard</Text>
          <Text style={s.subtitle}>{data.sites.length} site{data.sites.length !== 1 ? "s" : ""} under management</Text>
        </View>
        <View style={[s.logoContainer, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
          <Feather name="trending-up" size={18} color={colors.primary} />
        </View>
      </View>

      <View style={s.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.label} style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[s.kpiIconBox, { backgroundColor: kpi.bg }]}>
              <Feather name={kpi.icon as never} size={16} color={kpi.color} />
            </View>
            <Text style={s.kpiLabel}>{kpi.label}</Text>
            <View style={s.kpiValueRow}>
              <Text style={[s.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              {kpi.suffix && <Text style={s.kpiSuffix}>{kpi.suffix}</Text>}
            </View>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>AI Agents</Text>
      <View style={s.agentsGrid}>
        {agentTypes.map((type) => {
          const agent = AGENT_MAP[type];
          const count = data.agentCounts[type] ?? 0;
          const ck = agent.colorKey;
          const color = (colors as Record<string, string>)[`agent${ck}`];
          const bg = (colors as Record<string, string>)[`agent${ck}Bg`];
          return (
            <Pressable
              key={type}
              style={({ pressed }) => [
                s.agentCard,
                { backgroundColor: colors.card, borderColor: color + "40", opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={() => handleAgentPress(type)}
            >
              <View style={[s.agentIconBox, { backgroundColor: bg }]}>
                <Feather name={agent.icon as never} size={18} color={color} />
              </View>
              <Text style={[s.agentName, { color: colors.foreground }]} numberOfLines={1}>{agent.name}</Text>
              <Text style={s.agentCount}>{count} task{count !== 1 ? "s" : ""}</Text>
              <Feather name="chevron-right" size={13} color={colors.mutedForeground} style={{ marginTop: 6 }} />
            </Pressable>
          );
        })}
      </View>

      <Text style={s.sectionTitle}>Recent Activity</Text>
      <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.recentTasks.length === 0 && (
          <View style={s.emptyState}>
            <Feather name="clock" size={28} color={colors.mutedForeground} />
            <Text style={s.emptyText}>No activity yet</Text>
            <Text style={s.emptySubtext}>Run an analysis to get started</Text>
          </View>
        )}
        {data.recentTasks.slice(0, 8).map((task, idx) => (
          <View
            key={task.id}
            style={[s.activityRow, idx < Math.min(data.recentTasks.length, 8) - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <AgentColorBadge agentType={task.agentType} colors={colors} />
            <View style={s.activityMid}>
              <Text style={s.activityTitle} numberOfLines={1}>{task.title}</Text>
              <Text style={s.activityAgent}>{AGENT_MAP[task.agentType as AgentType]?.name ?? task.agentType}</Text>
            </View>
            <View style={s.activityRight}>
              <StatusDot status={task.status} colors={colors} />
              <Text style={s.activityTime}>{formatDate(task.createdAt)}</Text>
            </View>
          </View>
        ))}
      </View>

      {data.sites.length > 0 && (
        <>
          <Text style={s.sectionTitle}>Sites</Text>
          <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {data.sites.map((site, idx) => (
              <View
                key={site.id}
                style={[s.siteRow, idx < data.sites.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
              >
                <View style={[s.siteDomain, { backgroundColor: colors.primary + "15" }]}>
                  <Feather name="globe" size={14} color={colors.primary} />
                </View>
                <View style={s.siteMid}>
                  <Text style={s.siteName} numberOfLines={1}>{site.name}</Text>
                  <Text style={s.siteUrl} numberOfLines={1}>{site.url}</Text>
                </View>
                {site.lastAnalysis && (
                  <View style={s.siteScore}>
                    <Text style={[s.scoreNum, {
                      color: site.lastAnalysis.score >= 80 ? colors.primary :
                        site.lastAnalysis.score >= 50 ? (colors as Record<string, string>).agentAmber :
                          colors.destructive
                    }]}>{site.lastAnalysis.score}</Text>
                    <Text style={s.scoreSuffix}>/100</Text>
                  </View>
                )}
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
    container: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 24 },
    content: { paddingHorizontal: 16 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    greeting: { fontSize: 24, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    subtitle: { fontSize: 13, color: colors.mutedForeground, marginTop: 2, fontFamily: "Inter_400Regular" },
    logoContainer: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 },
    errorText: { color: colors.destructive, fontFamily: "Inter_500Medium", fontSize: 15 },
    retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    retryBtnText: { color: colors.primaryForeground, fontWeight: "600", fontFamily: "Inter_600SemiBold", fontSize: 14 },
    kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
    kpiCard: { flex: 1, minWidth: "45%", borderRadius: 14, borderWidth: 1, padding: 14 },
    kpiIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    kpiLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 4 },
    kpiValueRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
    kpiValue: { fontSize: 26, fontWeight: "700", fontFamily: "Inter_700Bold" },
    kpiSuffix: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 12 },
    agentsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
    agentCard: { width: "30.8%", borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "flex-start" },
    agentIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    agentName: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    agentCount: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    listCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
    activityRow: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
    agentDot: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    activityMid: { flex: 1, minWidth: 0 },
    activityTitle: { fontSize: 13, fontWeight: "500", color: colors.foreground, fontFamily: "Inter_500Medium" },
    activityAgent: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 },
    activityRight: { flexDirection: "row", alignItems: "center", gap: 5, flexShrink: 0 },
    activityTime: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    emptyState: { padding: 28, alignItems: "center", gap: 6 },
    emptyText: { fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    emptySubtext: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" },
    siteRow: { flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
    siteDomain: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    siteMid: { flex: 1, minWidth: 0 },
    siteName: { fontSize: 13, fontWeight: "500", color: colors.foreground, fontFamily: "Inter_500Medium" },
    siteUrl: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 1 },
    siteScore: { flexDirection: "row", alignItems: "baseline", gap: 1, flexShrink: 0 },
    scoreNum: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
    scoreSuffix: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
  });
