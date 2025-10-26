import { apiClient } from "./api";

// Types
export interface NilaiAkademik {
  id: string;
  pelajaran: string;
  nilai: number;
}

export interface TesMinat {
  id: string;
  tipe: string;
}

export interface ProgramStudiRekomendasi {
  id: string;
  name: string;
  akreditasi: string;
  biaya: string;
  biaya_kuliah: number;
  match: number;
  rumpunIlmu: string;
}

export interface PilihanProdi {
  id: string;
  programStudiId: string;
  programStudi: {
    id: string;
    nama_program_studi: string;
    akreditasi: string;
    biaya_kuliah: number;
    RumpunIlmu: {
      nama: string;
    } | null;
  };
}

export interface RumpunIlmuDistribution {
  name: string;
  value: number;
}

export interface DashboardSiswaData {
  nilaiAkademik: NilaiAkademik[];
  tesMinat: TesMinat[];
  hasilPerhitungan: ProgramStudiRekomendasi[];
  pilihanProdi: PilihanProdi[];
  averageScore: number;
  topMatch: ProgramStudiRekomendasi | null;
  rumpunIlmuDistribution: RumpunIlmuDistribution[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SISWA";
}

// API Functions
export const dashboardService = {
  // Get siswa dashboard data
  getSiswaDashboard: async (): Promise<DashboardSiswaData> => {
    const response = await apiClient.get<DashboardSiswaData>("/dashboard/siswa");
    return response.data;
  },

  // Get current user data
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<{ user: User }>("/auth/me");
    return response.data.user;
  },
};
