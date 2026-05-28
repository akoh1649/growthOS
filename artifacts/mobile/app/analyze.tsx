import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import { useColors } from "@/hooks/useColors";
import { AGENT_MAP, AgentType } from "@/constants/agents";
import { analyzeUrl, AnalyzeResult, SeoIssue } from "@/lib/api";

const SEVERITY_COLOR = {
  high: "destructive",
  medium: "agentAmber",
  low: "agentBlue",
} as const;

const SEVERITY_LABEL = { high: "High", medium: "Medium", low: "Low" } as const;

const AGENT_TYPES: AgentType[] = ["seo", "geo", "writer", "reddit", "hackernews", "x"];

function ScoreRing({ score, colors }: { score: number; colors: ReturnType<typeof useColors> }) {
  const color =
    score >= 80 ? colors.primary :
    score >= 50 ? colors.colorOf("agentAmber") :
    colors.destructive;

  return (
    <View style={[scoreRingStyles.wrapper, { borderColor: color + "30", backgroundColor: color + "10" }]}>
      <Text style={[scoreRingStyles.number, { color }]}>{score}</Text>
      <Text style={[scoreRingStyles.label, { color: colors.mutedForeground }]}>/100</Text>
    </View>
  );
}

const scoreRingStyles = StyleSheet.create({
  wrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  number: { fontSize: 40, fontWeight: "700", fontFamily: "Inter_700Bold", lineHeight: 44 },
  label: { fontSize: 12, fontFamily: "Inter_400Regular" },
});

function IssueBadge({ issue, colors }: { issue: SeoIssue; colors: ReturnType<typeof useColors> }) {
  const colorKey = SEVERITY_COLOR[issue.severity];
  const color = colorKey === "destructive" ? colors.destructive : colors.colorOf(colorKey);
  const bg = colorKey === "destructive" ? colors.destructive + "18" : colors.colorOf(colorKey + "Bg");

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10 }}>
      <View style={[{ width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0, backgroundColor: bg }]}>
        <Feather
          name={issue.severity === "high" ? "alert-circle" : issue.severity === "medium" ? "alert-triangle" : "info"}
          size={13}
          color={color}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", color, marginBottom: 2 }}>
          {SEVERITY_LABEL[issue.severity]}
        </Text>
        <Text style={{ fontSize: 13, fontFamily: "Inter_400Regular", color: colors.foreground, lineHeight: 18 }}>
          {issue.message}
        </Text>
      </View>
    </View>
  );
}

export default function AnalyzeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const s = makeStyles(colors);

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const inputRef = useRef<TextInput>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  function normalizeUrl(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return trimmed;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  async function handleAnalyze() {
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    try {
      new URL(normalized);
    } catch {
      setError("Please enter a valid URL (e.g. example.com)");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeUrl(normalized);
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setError(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  function handleAgentPress(type: AgentType) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/agent/${type}` as never);
  }

  const highCount = result?.issues.filter((i) => i.severity === "high").length ?? 0;
  const medCount = result?.issues.filter((i) => i.severity === "medium").length ?? 0;
  const lowCount = result?.issues.filter((i) => i.severity === "low").length ?? 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.content, { paddingTop: topPad + 8, paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [s.backBtn, { opacity: pressed ? 0.6 : 1, backgroundColor: colors.card, borderColor: colors.border }]}
            hitSlop={8}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <Text style={s.title}>Analyze Site</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={s.subtitle}>
          Enter a URL to crawl it and kick off all 6 GrowthOS agents automatically.
        </Text>

        <View style={[s.inputCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[s.inputIconBox, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="globe" size={16} color={colors.primary} />
          </View>
          <TextInput
            ref={inputRef}
            style={[s.input, { color: colors.foreground }]}
            placeholder="example.com"
            placeholderTextColor={colors.mutedForeground}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleAnalyze}
            editable={!loading}
          />
          {url.length > 0 && !loading && (
            <Pressable onPress={() => { setUrl(""); setResult(null); setError(null); }} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        {error && (
          <View style={[s.errorBox, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "40" }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[s.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            s.analyzeBtn,
            { backgroundColor: loading ? colors.primary + "80" : colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleAnalyze}
          disabled={loading || !url.trim()}
        >
          {loading ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator color={colors.primaryForeground} size="small" />
              <Text style={[s.analyzeBtnText, { color: colors.primaryForeground }]}>Analyzing…</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Feather name="zap" size={16} color={colors.primaryForeground} />
              <Text style={[s.analyzeBtnText, { color: colors.primaryForeground }]}>Analyze</Text>
            </View>
          )}
        </Pressable>

        {result && (
          <>
            <View style={[s.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.scoreSection}>
                <ScoreRing score={result.score} colors={colors} />
                <View style={s.scoreMeta}>
                  <Text style={[s.scoreTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {result.title ?? "No title found"}
                  </Text>
                  {result.description ? (
                    <Text style={[s.scoreDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {result.description}
                    </Text>
                  ) : null}
                  <View style={s.statsRow}>
                    <View style={s.statPill}>
                      <Feather name="link" size={11} color={colors.mutedForeground} />
                      <Text style={[s.statText, { color: colors.mutedForeground }]}>{result.linksCount}</Text>
                    </View>
                    <View style={s.statPill}>
                      <Feather name="image" size={11} color={colors.mutedForeground} />
                      <Text style={[s.statText, { color: colors.mutedForeground }]}>{result.imagesCount}</Text>
                    </View>
                    <View style={s.statPill}>
                      <Feather name="clock" size={11} color={colors.mutedForeground} />
                      <Text style={[s.statText, { color: colors.mutedForeground }]}>{result.loadTimeMs}ms</Text>
                    </View>
                  </View>
                </View>
              </View>

              {result.issues.length > 0 && (
                <View style={[s.issueSummary, { borderTopColor: colors.border }]}>
                  <View style={s.issueCounts}>
                    {highCount > 0 && (
                      <View style={[s.issueCountBadge, { backgroundColor: colors.destructive + "15" }]}>
                        <Text style={[s.issueCountText, { color: colors.destructive }]}>{highCount} High</Text>
                      </View>
                    )}
                    {medCount > 0 && (
                      <View style={[s.issueCountBadge, { backgroundColor: colors.colorOf("agentAmberBg") }]}>
                        <Text style={[s.issueCountText, { color: colors.colorOf("agentAmber") }]}>{medCount} Medium</Text>
                      </View>
                    )}
                    {lowCount > 0 && (
                      <View style={[s.issueCountBadge, { backgroundColor: colors.colorOf("agentBlueBg") }]}>
                        <Text style={[s.issueCountText, { color: colors.colorOf("agentBlue") }]}>{lowCount} Low</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {result.issues.length > 0 && (
              <>
                <Text style={s.sectionTitle}>Issues Found</Text>
                <View style={[s.issuesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {result.issues.map((issue, idx) => (
                    <View
                      key={issue.type}
                      style={[
                        { paddingHorizontal: 14 },
                        idx < result.issues.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      ]}
                    >
                      <IssueBadge issue={issue} colors={colors} />
                    </View>
                  ))}
                </View>
              </>
            )}

            {result.issues.length === 0 && (
              <View style={[s.perfectCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "30" }]}>
                <Feather name="check-circle" size={22} color={colors.primary} />
                <Text style={[s.perfectText, { color: colors.primary }]}>No issues detected — great score!</Text>
              </View>
            )}

            <Text style={s.sectionTitle}>Jump to Agent</Text>
            <Text style={[s.agentHint, { color: colors.mutedForeground }]}>
              Tasks have been seeded for each agent. Tap one to view and generate content.
            </Text>
            <View style={s.agentsGrid}>
              {AGENT_TYPES.map((type) => {
                const agent = AGENT_MAP[type];
                const ck = agent.colorKey;
                const color = colors.colorOf(`agent${ck}`);
                const bg = colors.colorOf(`agent${ck}Bg`);
                return (
                  <Pressable
                    key={type}
                    style={({ pressed }) => [
                      s.agentCard,
                      { backgroundColor: colors.card, borderColor: color + "40", opacity: pressed ? 0.75 : 1 },
                    ]}
                    onPress={() => handleAgentPress(type)}
                  >
                    <View style={[s.agentIconBox, { backgroundColor: bg }]}>
                      <Feather name={agent.icon as never} size={16} color={color} />
                    </View>
                    <Text style={[s.agentName, { color: colors.foreground }]} numberOfLines={1}>
                      {agent.name}
                    </Text>
                    <Feather name="arrow-right" size={12} color={colors.mutedForeground} style={{ marginTop: 4 }} />
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    content: { paddingHorizontal: 16 },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    subtitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 19, marginBottom: 20 },
    inputCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 12,
    },
    inputIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
    input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", paddingVertical: 2 },
    errorBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 12 },
    errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
    analyzeBtn: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    analyzeBtnText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    resultCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 20 },
    scoreSection: { flexDirection: "row", gap: 16, padding: 16, alignItems: "center" },
    scoreMeta: { flex: 1, minWidth: 0 },
    scoreTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 4, lineHeight: 19 },
    scoreDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 8 },
    statsRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    statPill: { flexDirection: "row", alignItems: "center", gap: 4 },
    statText: { fontSize: 11, fontFamily: "Inter_400Regular" },
    issueSummary: { borderTopWidth: 1, paddingHorizontal: 16, paddingVertical: 10 },
    issueCounts: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
    issueCountBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    issueCountText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", marginBottom: 10 },
    issuesCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
    perfectCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 14,
      borderWidth: 1,
      padding: 14,
      marginBottom: 24,
    },
    perfectText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    agentHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 12, lineHeight: 17 },
    agentsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    agentCard: { width: "30.8%", borderRadius: 14, borderWidth: 1, padding: 12, alignItems: "flex-start" },
    agentIconBox: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    agentName: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  });
