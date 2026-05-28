import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

type PermResult = { granted: boolean; canAskAgain: boolean };

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const existing = (await Notifications.getPermissionsAsync()) as unknown as PermResult;
  if (existing.granted) return true;

  const result = (await Notifications.requestPermissionsAsync()) as unknown as PermResult;
  return result.granted;
}

export async function scheduleGenerationNotification(
  agentName: string,
  agentType: string
): Promise<void> {
  if (Platform.OS === "web") return;

  const perms = (await Notifications.getPermissionsAsync()) as unknown as PermResult;
  if (!perms.granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${agentName} finished`,
      body: "Your content is ready — tap to view it.",
      data: { agentType },
    },
    trigger: null,
  });
}
