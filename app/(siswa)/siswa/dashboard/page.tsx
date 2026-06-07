"use client";

import MapelPendukung from "@/components/dashboard/siswa/MapelPendukung";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSiswaDashboard, useCurrentUser } from "@/hooks/useDashboard";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Loader2,
  PieChart,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart as BarChartComponent,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart as PieChartComponent,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RIASEC_INFO: Record<string, { name: string; color: string; description: string }> = {
  R: {
    name: "Realistic",
    color: "text-green-600",
    description:
      "Kamu cenderung menyukai pekerjaan praktis — menggunakan alat, mesin, atau bekerja di luar ruangan. Cocok untuk teknik, pertanian, dan bidang vokasi.",
  },
  I: {
    name: "Investigative",
    color: "text-blue-600",
    description:
      "Kamu menikmati analisis, riset, dan pemecahan masalah secara ilmiah. Cocok untuk sains, teknologi, kedokteran, dan penelitian.",
  },
  A: {
    name: "Artistic",
    color: "text-purple-600",
    description:
      "Kamu memiliki kecenderungan ekspresif dan kreatif. Cocok untuk seni, desain, sastra, musik, dan bidang kreatif lainnya.",
  },
  S: {
    name: "Social",
    color: "text-orange-600",
    description:
      "Kamu menikmati berinteraksi, membantu, dan bekerja sama dengan orang lain. Cocok untuk pendidikan, konseling, dan layanan sosial.",
  },
  E: {
    name: "Enterprising",
    color: "text-red-600",
    description:
      "Kamu cenderung memimpin dan memengaruhi orang lain. Cocok untuk manajemen, bisnis, hukum, dan kewirausahaan.",
  },
  C: {
    name: "Conventional",
    color: "text-gray-600",
    description:
      "Kamu menyukai keteraturan dan bekerja dengan data atau sistem terstruktur. Cocok untuk akuntansi, administrasi, dan sistem informasi.",
  },
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

export default function SiswaDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: dashboardData, isLoading: loadingDashboard, error: dashboardError } = useSiswaDashboard();
  const { data: user, isLoading: loadingUser } = useCurrentUser();

  const nilaiAkademik = dashboardData?.nilaiAkademik || [];
  const tesMinat = dashboardData?.tesMinat || [];
  const rekomendasiProdi = dashboardData?.hasilPerhitungan || [];
  const pilihanProdi = dashboardData?.pilihanProdi || [];
  const averageScore = dashboardData?.averageScore || 0;
  const topMatch = dashboardData?.topMatch;
  const rumpunIlmuDistribution = dashboardData?.rumpunIlmuDistribution || [];

  // RIASEC count from real tesMinat data
  const riasecCount: Record<string, number> = {};
  tesMinat.forEach((test: any) => {
    riasecCount[test.tipe] = (riasecCount[test.tipe] || 0) + 1;
  });
  const totalMinatTests = tesMinat.length;

  const riasecChartData = Object.entries(riasecCount).map(([tipe, count]) => ({
    subject: RIASEC_INFO[tipe]?.name || tipe,
    jumlah: count,
  }));

  // Top 3 dominant RIASEC types sorted by count
  const topRiasec = Object.entries(riasecCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const dominantRiasec = topRiasec[0];
  const dominantRiasecName = dominantRiasec ? (RIASEC_INFO[dominantRiasec[0]]?.name || dominantRiasec[0]) : "-";
  const dominantRiasecPercentage =
    dominantRiasec && totalMinatTests > 0
      ? Math.round((dominantRiasec[1] / totalMinatTests) * 100)
      : 0;

  // Status evaluasi from real data
  const hasNilaiAkademik = nilaiAkademik.length > 0;
  const hasTesMinat = tesMinat.length > 0;
  const hasRekomendasiProdi = rekomendasiProdi.length > 0;
  const pilihanCount = pilihanProdi.length;

  const isLoading = loadingDashboard || loadingUser;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat data dashboard...</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Gagal Memuat Data</p>
        <p className="text-muted-foreground">Terjadi kesalahan saat mengambil data dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Siswa</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Selamat datang kembali, {user?.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={`text-xs sm:text-sm ${hasNilaiAkademik ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
            Nilai Akademik: {hasNilaiAkademik ? "Lengkap" : "Belum"}
          </Badge>
          <Badge className={`text-xs sm:text-sm ${hasTesMinat ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
            Tes Minat: {hasTesMinat ? "Selesai" : "Belum"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-full sm:max-w-xl h-auto gap-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm py-2">
            <BarChart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="academic" className="text-xs sm:text-sm py-2">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Akademik</span>
          </TabsTrigger>
          <TabsTrigger value="interest" className="text-xs sm:text-sm py-2">
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Minat</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="text-xs sm:text-sm py-2">
            <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Rekomendasi</span>
          </TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW ── */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageScore}</div>
                <p className="text-xs text-muted-foreground">Dari {nilaiAkademik.length} mata pelajaran</p>
                <Progress value={averageScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tipe RIASEC Dominan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dominantRiasecName}</div>
                <p className="text-xs text-muted-foreground">
                  {dominantRiasec ? `${dominantRiasec[1]} dari ${totalMinatTests} tes` : "Belum ada tes"}
                </p>
                <Progress value={dominantRiasecPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Kesesuaian Tertinggi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{topMatch?.name || "-"}</div>
                <p className="text-xs text-muted-foreground">
                  {topMatch ? `Match: ${topMatch.match}%` : "Belum ada perhitungan"}
                </p>
                <Progress value={topMatch?.match || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Evaluasi — real data */}
            <Card>
              <CardHeader>
                <CardTitle>Status Evaluasi</CardTitle>
                <CardDescription>Progres evaluasi kriteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatusRow
                    label="Nilai Akademik"
                    done={hasNilaiAkademik}
                    note={hasNilaiAkademik ? `${nilaiAkademik.length} mata pelajaran` : "Belum diisi"}
                  />
                  <StatusRow
                    label="Tes Minat RIASEC"
                    done={hasTesMinat}
                    note={hasTesMinat ? `${totalMinatTests} tes` : "Belum selesai"}
                  />
                  <StatusRow
                    label="Perhitungan PROMETHEE"
                    done={hasRekomendasiProdi}
                    note={hasRekomendasiProdi ? `${rekomendasiProdi.length} prodi tersimpan` : "Belum dihitung"}
                  />
                  <StatusRow
                    label="Pilihan Program Studi"
                    done={pilihanCount > 0}
                    note={pilihanCount > 0 ? `${pilihanCount} dipilih` : "Belum ada pilihan"}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("recommendations")}>
                  Lihat Rekomendasi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            {/* Rekomendasi teratas — real data */}
            <Card>
              <CardHeader>
                <CardTitle>Rekomendasi Teratas</CardTitle>
                <CardDescription>Berdasarkan hasil perhitungan PROMETHEE</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rekomendasiProdi.length > 0 ? (
                    rekomendasiProdi.slice(0, 3).map((prodi: any, index: number) => (
                      <div key={prodi.id || index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{prodi.name}</p>
                          <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-1">
                            <Award className="h-3 w-3 flex-shrink-0" />
                            <span>Akreditasi {prodi.akreditasi}</span>
                            <span>•</span>
                            <span className="truncate">{prodi.biaya}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 flex-shrink-0 w-fit">
                          {prodi.match}% Match
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada rekomendasi program studi
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("recommendations")}>
                  Lihat Semua Rekomendasi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* ── AKADEMIK ── */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nilai Akademik</CardTitle>
              <CardDescription>Nilai per mata pelajaran</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {nilaiAkademik.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChartComponent data={nilaiAkademik} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pelajaran" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="nilai" fill="#8884d8" name="Nilai" />
                  </BarChartComponent>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Belum ada data nilai akademik</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mata Pelajaran Pendukung</CardTitle>
              <CardDescription>Berdasarkan program studi yang tersedia</CardDescription>
            </CardHeader>
            <CardContent>
              <MapelPendukung />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MINAT ── */}
        <TabsContent value="interest" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Radar/Bar chart dari data nyata */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Tipe RIASEC</CardTitle>
                <CardDescription>Berdasarkan hasil tes minat</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {riasecChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChartComponent data={riasecChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="jumlah" name="Jumlah Tes" fill="#8884d8" />
                    </BarChartComponent>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Belum ada data tes minat</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interpretasi RIASEC — dynamic dari data nyata */}
            <Card>
              <CardHeader>
                <CardTitle>Interpretasi RIASEC</CardTitle>
                <CardDescription>
                  {topRiasec.length > 0
                    ? `Kode Holland dominan: ${topRiasec.map(([t]) => t).join("")}`
                    : "Belum ada data tes minat"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topRiasec.length > 0 ? (
                  <div className="space-y-4">
                    {topRiasec.map(([tipe, count], idx) => {
                      const info = RIASEC_INFO[tipe];
                      const label = idx === 0 ? "Dominan" : idx === 1 ? "Sekunder" : "Tersier";
                      return (
                        <div key={tipe}>
                          <h3 className={`font-medium ${info?.color || "text-foreground"}`}>
                            {info?.name || tipe} ({tipe}) — {label}
                          </h3>
                          <p className="text-sm mt-1 text-muted-foreground">{info?.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {count} tes ({totalMinatTests > 0 ? Math.round((count / totalMinatTests) * 100) : 0}%)
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Belum ada data tes minat RIASEC
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Ringkasan semua tipe RIASEC */}
          {tesMinat.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Hasil Tes Minat</CardTitle>
                <CardDescription>Total {totalMinatTests} tes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(riasecCount)
                    .sort(([, a], [, b]) => b - a)
                    .map(([tipe, count]) => (
                      <div key={tipe} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <span className={`font-medium ${RIASEC_INFO[tipe]?.color || ""}`}>
                            {RIASEC_INFO[tipe]?.name || tipe}
                          </span>
                          <span className="text-sm text-muted-foreground ml-2">({tipe})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{count} tes</span>
                          <Progress
                            value={totalMinatTests > 0 ? (count / totalMinatTests) * 100 : 0}
                            className="w-24"
                          />
                          <Badge variant="outline">
                            {totalMinatTests > 0 ? Math.round((count / totalMinatTests) * 100) : 0}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── REKOMENDASI ── */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rekomendasi Program Studi</CardTitle>
              <CardDescription>Berdasarkan hasil perhitungan PROMETHEE</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                {rekomendasiProdi.length > 0 ? (
                  rekomendasiProdi.map((prodi: any, index: number) => (
                    <div key={prodi.id || index} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-base sm:text-lg truncate">{prodi.name}</h3>
                          <div className="flex flex-wrap items-center text-xs sm:text-sm text-muted-foreground mt-1 gap-1">
                            <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Akreditasi {prodi.akreditasi}</span>
                            <span>•</span>
                            <span className="truncate">{prodi.biaya}</span>
                          </div>
                        </div>
                        <Badge
                          className={`text-sm px-3 py-1 flex-shrink-0 w-fit ${
                            prodi.match >= 80
                              ? "bg-green-100 text-green-800"
                              : prodi.match >= 60
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {prodi.match}% Match
                        </Badge>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Mata Pelajaran Pendukung — real data */}
                        {prodi.mataPelajaran?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Mata Pelajaran Pendukung</h4>
                            <div className="flex flex-wrap gap-1">
                              {prodi.mataPelajaran.map((mp: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{mp}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tipe RIASEC — real data */}
                        {prodi.riasecTypes?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Tipe RIASEC</h4>
                            <div className="flex flex-wrap gap-1">
                              {[...new Set<string>(prodi.riasecTypes)].map((t: string, i: number) => (
                                <Badge key={i} variant="outline" className={`text-xs ${RIASEC_INFO[t]?.color || ""}`}>
                                  {t} — {RIASEC_INFO[t]?.name || t}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rumpun Ilmu — real data */}
                        {prodi.rumpunIlmu && (
                          <div>
                            <h4 className="text-sm font-medium mb-1">Rumpun Ilmu</h4>
                            <Badge variant="outline" className="text-xs">{prodi.rumpunIlmu}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">Belum ada rekomendasi program studi.</p>
                    <p className="text-sm text-muted-foreground">
                      Silakan lengkapi nilai akademik, tes minat, dan lakukan perhitungan PROMETHEE.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribusi rumpun ilmu — real data */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Rekomendasi</CardTitle>
                <CardDescription>Berdasarkan rumpun ilmu</CardDescription>
              </CardHeader>
              <CardContent className="h-64 sm:h-80">
                {rumpunIlmuDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChartComponent>
                      <Pie
                        data={rumpunIlmuDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {rumpunIlmuDistribution.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChartComponent>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Tidak ada data distribusi</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Program Studi Pilihan — real data dari pilihanProdi */}
            <Card>
              <CardHeader>
                <CardTitle>Program Studi Pilihan</CardTitle>
                <CardDescription>Program studi yang telah kamu pilih</CardDescription>
              </CardHeader>
              <CardContent>
                {pilihanProdi.length > 0 ? (
                  <div className="space-y-3">
                    {pilihanProdi.map((pilihan: any, index: number) => (
                      <div key={pilihan.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{pilihan.programStudi.nama_program_studi}</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1 gap-1">
                              <Award className="h-3.5 w-3.5" />
                              <span>Akreditasi {pilihan.programStudi.akreditasi}</span>
                              <span>•</span>
                              <span>Rp {(pilihan.programStudi.biaya_kuliah / 1_000_000).toFixed(1)}jt/sem</span>
                            </div>
                            {pilihan.programStudi.RumpunIlmu && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {pilihan.programStudi.RumpunIlmu.nama}
                              </Badge>
                            )}
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 shrink-0">
                            Pilihan #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">Belum ada pilihan program studi.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatusRow({ label, done, note }: { label: string; done: boolean; note: string }) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 shrink-0" />
        )}
        <span>{label}</span>
      </div>
      <Badge variant="outline" className={done ? "bg-green-50" : "bg-yellow-50"}>
        {note}
      </Badge>
    </div>
  );
}
