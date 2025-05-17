// This file centralizes all data fetching logic for the dashboard

export async function fetchDashboardData() {
    try {
        // Fetch all data in parallel
        const [
            userStatsRes,
            programStudiStatsRes,
            riasecDistributionRes,
            monthlyActivityRes,
            recentStudentsRes,
            academicScoresRes,
            programStudiListRes,
        ] = await Promise.all([
            fetch("/api/dashboard/user-stats"),
            fetch("/api/dashboard/program-studi-stats"),
            fetch("/api/dashboard/riasec-distribution"),
            fetch("/api/dashboard/monthly-activity"),
            fetch("/api/dashboard/recent-students"),
            fetch("/api/dashboard/academic-scores"),
            fetch("/api/dashboard/program-studi"),
        ])

        // Parse responses
        const [
            userStatsData,
            programStudiStatsData,
            riasecDistributionData,
            monthlyActivityData,
            recentStudentsData,
            academicScoresData,
            programStudiListData,
        ] = await Promise.all([
            userStatsRes.json(),
            programStudiStatsRes.json(),
            riasecDistributionRes.json(),
            monthlyActivityRes.json(),
            recentStudentsRes.json(),
            academicScoresRes.json(),
            programStudiListRes.json(),
        ])

        // Ensure all data is in array format
        return {
            userStats: Array.isArray(userStatsData) ? userStatsData : [],
            programStudiStats: Array.isArray(programStudiStatsData) ? programStudiStatsData : [],
            riasecDistribution: Array.isArray(riasecDistributionData) ? riasecDistributionData : [],
            monthlyActivity: Array.isArray(monthlyActivityData) ? monthlyActivityData : [],
            recentStudents: Array.isArray(recentStudentsData) ? recentStudentsData : [],
            academicScores: Array.isArray(academicScoresData) ? academicScoresData : [],
            programStudiList: Array.isArray(programStudiListData) ? programStudiListData : [],
        }
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // Return empty arrays as fallback
        return {
            userStats: [],
            programStudiStats: [],
            riasecDistribution: [],
            monthlyActivity: [],
            recentStudents: [],
            academicScores: [],
            programStudiList: [],
        }
    }
}


type RiasecType = "Realistic" | "Investigative" | "Artistic" | "Social" | "Enterprising" | "Conventional";

const RIASEC_LABELS: Record<string, RiasecType> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

export function generateRiasecRadarData(tesMinat: { tipe: string }[]) {
  const countMap: Record<RiasecType, number> = {
    Realistic: 0,
    Investigative: 0,
    Artistic: 0,
    Social: 0,
    Enterprising: 0,
    Conventional: 0,
  };

  tesMinat.forEach((item) => {
    const label = RIASEC_LABELS[item.tipe];
    if (label) countMap[label]++;
  });

  // Total maksimal, misal skor dari 0 - 100 berdasarkan jumlah jawaban
  const total = Math.max(...Object.values(countMap), 1);

  return Object.entries(countMap).map(([subject, value]) => ({
    subject,
    A: Math.round((value / total) * 100),
    fullMark: 100,
  }));
}


export async function fetchSiswaDashboardData() {
  const res = await fetch("/api/dashboard/siswa");
  if (!res.ok) throw new Error("Gagal memuat data dashboard siswa");
  return res.json();
}
