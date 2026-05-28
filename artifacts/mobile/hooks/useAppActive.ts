import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function useAppActive(): boolean {
  const [isActive, setIsActive] = useState(AppState.currentState === "active");
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (next: AppStateStatus) => {
      const wasActive = appState.current === "active";
      const nowActive = next === "active";
      appState.current = next;
      if (wasActive !== nowActive) {
        setIsActive(nowActive);
      }
    });
    return () => subscription.remove();
  }, []);

  return isActive;
}
