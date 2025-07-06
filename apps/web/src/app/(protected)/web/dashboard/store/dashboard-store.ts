import { create } from "zustand";
import { devtools } from "zustand/middleware";

type DashboardTab = "apps" | "deployments" | "ads" | "payments" | "claims" | "suggestions";

interface DashboardState {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set) => ({
      activeTab: "apps",
      setActiveTab: (tab) => set({ activeTab: tab }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
    }),
    { name: "dashboard-store" }
  )
); 