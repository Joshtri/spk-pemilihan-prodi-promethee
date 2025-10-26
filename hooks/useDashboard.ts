import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  siswa: () => [...dashboardKeys.all, "siswa"] as const,
  user: () => ["user"] as const,
};

// Custom hooks
export function useSiswaDashboard() {
  return useQuery({
    queryKey: dashboardKeys.siswa(),
    queryFn: dashboardService.getSiswaDashboard,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: dashboardKeys.user(),
    queryFn: dashboardService.getCurrentUser,
  });
}
