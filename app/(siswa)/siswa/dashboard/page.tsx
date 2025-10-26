"use client";

import MapelPendukung from "@/components/dashboard/siswa/MapelPendukung";
import RiasecProgramStudi from "@/components/dashboard/siswa/RiasecProgramStudi";
import RiasecRadarChart from "@/components/dashboard/siswa/RiasecRadarChart";
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
  YAxis
} from "recharts";

export default function SiswaDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Use TanStack Query hooks
  const { data: dashboardData, isLoading: loadingDashboard, error: dashboardError } = useSiswaDashboard();
  const { data: user, isLoading: loadingUser } = useCurrentUser();

  // Extract data from API response
  const nilaiAkademik = dashboardData?.nilaiAkademik || [];
  const tesMinat = dashboardData?.tesMinat || [];
  const rekomendasiProdi = dashboardData?.hasilPerhitungan || [];
  const pilihanProdi = dashboardData?.pilihanProdi || [];
  const averageScore = dashboardData?.averageScore || 0;
  const topMatch = dashboardData?.topMatch;
  const rumpunIlmuDistribution = dashboardData?.rumpunIlmuDistribution || [];

  // Process tesMinat data for RIASEC
  const riasecCount: Record<string, number> = {};
  tesMinat.forEach((test: any) => {
    riasecCount[test.tipe] = (riasecCount[test.tipe] || 0) + 1;
  });

  // Map RIASEC types to full names
  const riasecTypeNames: Record<string, string> = {
    R: "Realistic",
    I: "Investigative",
    A: "Artistic",
    S: "Social",
    E: "Enterprising",
    C: "Conventional",
  };

  // Convert to chart data format
  const riasecChartData = Object.entries(riasecCount).map(([tipe, count]) => ({
    subject: riasecTypeNames[tipe] || tipe,
    A: count,
  }));

  // Find dominant RIASEC type
  const dominantRiasec = Object.entries(riasecCount).reduce(
    (max, [tipe, count]) => (count > max.count ? { tipe, count } : max),
    { tipe: "", count: 0 }
  );

  const dominantRiasecName = riasecTypeNames[dominantRiasec.tipe] || "-";
  const totalMinatTests = tesMinat.length;
  const dominantRiasecPercentage = totalMinatTests > 0
    ? Math.round((dominantRiasec.count / totalMinatTests) * 100)
    : 0;

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
  ];

  // Loading state
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
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 text-xs sm:text-sm">
            Profil: Lengkap
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs sm:text-sm">
            Tes Minat: Selesai
          </Badge>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-3 sm:space-y-4"
      >
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

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Rata-rata Nilai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageScore}</div>
                <p className="text-xs text-muted-foreground">
                  Dari {nilaiAkademik.length} mata pelajaran
                </p>
                <Progress value={averageScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tipe RIASEC Dominan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dominantRiasecName}</div>
                <p className="text-xs text-muted-foreground">
                  {dominantRiasec.count} dari {totalMinatTests} tes
                </p>
                <Progress value={dominantRiasecPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Kesesuaian Tertinggi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{topMatch?.name || "-"}</div>
                <p className="text-xs text-muted-foreground">Match: {topMatch?.match?.toFixed(1) || 0}%</p>
                <Progress value={topMatch?.match || 0} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Status Evaluasi</CardTitle>
                <CardDescription>Progres evaluasi kriteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>Nilai Akademik</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      Selesai
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>Tes Minat RIASEC</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      Selesai
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      <span>Evaluasi Kriteria</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      Selesai
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>Pilihan Program Studi</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50">
                      2/3 Dipilih
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Lengkapi Profil
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rekomendasi Teratas</CardTitle>
                <CardDescription>Berdasarkan nilai dan minat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rekomendasiProdi.length > 0 ? (
                    rekomendasiProdi.slice(0, 3).map((prodi, index) => (
                      <div
                        key={prodi.id || index}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{prodi.name}</p>
                          <div className="flex flex-wrap items-center text-xs sm:text-sm text-muted-foreground gap-1">
                            <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Akreditasi {prodi.akreditasi}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">{prodi.biaya}</span>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 flex-shrink-0 w-fit">
                          {prodi.match.toFixed(1)}% Match
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
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab("recommendations")}
                >
                  Lihat Semua Rekomendasi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nilai Akademik</CardTitle>
              <CardDescription>Nilai per mata pelajaran</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChartComponent
                  data={nilaiAkademik}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="pelajaran" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nilai" fill="#8884d8" />
                </BarChartComponent>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Mata Pelajaran Pendukung</CardTitle>
                <CardDescription>
                  Berdasarkan program studi yang direkomendasikan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MapelPendukung />
              </CardContent>
            </Card>
B
            <Card>
              <CardHeader>
                <CardTitle>Statistik Nilai</CardTitle>
                <CardDescription>Perbandingan dengan rata-rata</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChartComponent
                    data={nilaiAkademik.map((item) => ({
                      ...item,
                      "Rata-rata Kelas": Math.floor(Math.random() * 15) + 70,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pelajaran" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="nilai" name="Nilai Kamu" fill="#8884d8" />
                    <Bar dataKey="Rata-rata Kelas" fill="#82ca9d" />
                  </BarChartComponent>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="interest" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <RiasecRadarChart data={riasecChartData}/>

            <Card>
              <CardHeader>
                <CardTitle>Interpretasi RIASEC</CardTitle>
                <CardDescription>
                  Kode Holland: SAE (Social, Artistic, Enterprising)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-blue-600">
                      Social (S) - Dominan
                    </h3>
                    <p className="text-sm mt-1">
                      Kamu memiliki kecenderungan untuk bekerja dengan orang
                      lain, membantu, mengajar, atau memberikan informasi. Kamu
                      menikmati aktivitas yang melibatkan interaksi sosial dan
                      membantu orang lain.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-purple-600">
                      Artistic (A) - Sekunder
                    </h3>
                    <p className="text-sm mt-1">
                      Kamu memiliki kecenderungan untuk mengekspresikan diri
                      secara kreatif, menikmati seni, musik, atau bentuk
                      ekspresi kreatif lainnya.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium text-orange-600">
                      Enterprising (E) - Tersier
                    </h3>
                    <p className="text-sm mt-1">
                      Kamu memiliki kecenderungan untuk memimpin, mempengaruhi
                      orang lain, dan menikmati aktivitas yang melibatkan
                      pengambilan risiko dan pengambilan keputusan.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <RiasecProgramStudi />

          <Card>
            <CardHeader>
              <CardTitle>Data Nilai Hasil Tes Minat (RIASEC)</CardTitle>
              <CardDescription>
                Distribusi hasil tes minat berdasarkan tipe RIASEC
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tesMinat.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChartComponent
                          data={riasecChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="A" name="Jumlah" fill="#8884d8" />
                        </BarChartComponent>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Ringkasan Hasil Tes</h4>
                      {Object.entries(riasecCount)
                        .sort(([, a], [, b]) => b - a)
                        .map(([tipe, count]) => (
                          <div
                            key={tipe}
                            className="flex items-center justify-between border-b pb-2"
                          >
                            <div>
                              <span className="font-medium">
                                {riasecTypeNames[tipe]}
                              </span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({tipe})
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {count} tes
                              </span>
                              <Progress
                                value={totalMinatTests > 0 ? (count / totalMinatTests) * 100 : 0}
                                className="w-24"
                              />
                              <Badge variant="outline">
                                {totalMinatTests > 0
                                  ? Math.round((count / totalMinatTests) * 100)
                                  : 0}
                                %
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Total Tes Minat: {totalMinatTests}
                    </h4>
                    <p className="text-sm text-blue-700">
                      Tipe dominan: <strong>{dominantRiasecName}</strong> dengan {dominantRiasec.count} tes ({dominantRiasecPercentage}%)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    Belum ada data hasil tes minat
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Silakan lengkapi tes minat RIASEC terlebih dahulu
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rekomendasi Program Studi</CardTitle>
              <CardDescription>
                Berdasarkan nilai akademik dan profil minat
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                {rekomendasiProdi.length > 0 ? (
                  rekomendasiProdi.map((prodi, index) => (
                    <div key={prodi.id || index} className="border rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-base sm:text-lg truncate">{prodi.name}</h3>
                          <div className="flex flex-wrap items-center text-xs sm:text-sm text-muted-foreground mt-1 gap-1">
                            <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span>Akreditasi {prodi.akreditasi}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="truncate">{prodi.biaya}</span>
                          </div>
                        </div>
                        <Badge
                          className={`text-sm sm:text-lg px-2 sm:px-3 py-1 flex-shrink-0 ${
                            prodi.match >= 90
                              ? "bg-green-100 text-green-800"
                              : prodi.match >= 80
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {prodi.match.toFixed(1)}% Match
                        </Badge>
                      </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium">
                          Mata Pelajaran Pendukung
                        </h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {[
                            "Matematika",
                            "B. Indonesia",
                            "B. Inggris",
                            "Biologi",
                          ]
                            .slice(0, 3 + (index % 2))
                            .map((mp, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs"
                              >
                                {mp}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium">Tipe RIASEC</h4>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(index === 0
                            ? ["Social", "Artistic", "Enterprising"]
                            : index === 1
                            ? ["Social", "Enterprising", "Conventional"]
                            : index === 2
                            ? ["Social", "Artistic"]
                            : ["Social", "Conventional"]
                          ).map((type, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs"
                            >
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium">Rumpun Ilmu</h4>
                        <Badge variant="outline" className="mt-2">
                          {index === 0
                            ? "Sosial Humaniora"
                            : index === 1
                            ? "Ekonomi & Bisnis"
                            : index === 2
                            ? "Sosial Humaniora"
                            : "Pendidikan"}
                        </Badge>
                      </div>
                    </div>

                      <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                          Lihat Detail
                        </Button>
                        <Button size="sm">Pilih Program Studi</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Belum ada rekomendasi program studi.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Silakan lengkapi nilai akademik dan tes minat terlebih dahulu.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {rumpunIlmuDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
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

            <Card>
              <CardHeader>
                <CardTitle>Program Studi Pilihan</CardTitle>
                <CardDescription>
                  Program studi yang telah kamu pilih
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Psikologi</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Award className="h-4 w-4 mr-1" />
                          <span>Akreditasi A</span>
                          <span className="mx-2">•</span>
                          <span>Rp 8jt/semester</span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Pilihan #1
                      </Badge>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Manajemen SDM</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Award className="h-4 w-4 mr-1" />
                          <span>Akreditasi A</span>
                          <span className="mx-2">•</span>
                          <span>Rp 7.5jt/semester</span>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        Pilihan #2
                      </Badge>
                    </div>
                  </div>

                  <div className="border border-dashed rounded-lg p-4 flex items-center justify-center">
                    <Button variant="outline">+ Tambah Pilihan #3</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
