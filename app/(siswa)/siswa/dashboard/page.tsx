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
import {
  fetchSiswaDashboardData
} from "@/lib/dashboard-data";
import axios from "axios";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  PieChart,
} from "lucide-react";
import { useEffect, useState } from "react";
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

interface ProgramStudi {
  name: string;
  akreditasi: string;
  biaya: string;
  match: number;
}

export default function SiswaDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{name: string} | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", {
          withCredentials: true, // penting buat ambil cookie
        });

        if (res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchSiswaDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Gagal mengambil data dashboard siswa:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Define interfaces for dashboard data
  interface NilaiAkademik {
    pelajaran: string;
    nilai: number;
  }

  // Mock data - in a real app, this would come from your database
  const nilaiAkademik = (dashboardData?.nilaiAkademik || []) as NilaiAkademik[];
  // const riasecData = generateRiasecRadarData(dashboardData?.tesMinat || []);
  const rekomendasiProdi = dashboardData?.hasilPerhitungan || [];
  const pilihanProdi = dashboardData?.pilihanProdi || [];
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
  ];

  const riasecData = [
    { subject: "Realistic", A: 75 },
    { subject: "Investigative", A: 60 },
    { subject: "Artistic", A: 85 },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Siswa</h1>
          <p className="text-muted-foreground">
            Selamat datang kembali,{user?.name}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Badge className="mr-2 bg-green-100 text-green-800 hover:bg-green-200">
            Profil: Lengkap
          </Badge>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            Tes Minat: Selesai
          </Badge>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="overview">
            <BarChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="academic">
            <BookOpen className="h-4 w-4 mr-2" />
            Akademik
          </TabsTrigger>
          <TabsTrigger value="interest">
            <PieChart className="h-4 w-4 mr-2" />
            Minat
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <GraduationCap className="h-4 w-4 mr-2" />
            Rekomendasi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Rata-rata Nilai
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">83.0</div>
                <p className="text-xs text-muted-foreground">
                  Dari 6 mata pelajaran
                </p>
                <Progress value={83} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tipe RIASEC Dominan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Social</div>
                <p className="text-xs text-muted-foreground">Skor: 90/100</p>
                <Progress value={90} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Kesesuaian Tertinggi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Psikologi</div>
                <p className="text-xs text-muted-foreground">Match: 95%</p>
                <Progress value={95} className="mt-2" />
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
                  {rekomendasiProdi.slice(0, 3).map((prodi: ProgramStudi, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{prodi.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Award className="h-4 w-4 mr-1" />
                          <span>Akreditasi {prodi.akreditasi}</span>
                          <span className="mx-2">•</span>
                          <span>{prodi.biaya}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {prodi.match}% Match
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
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

            <RiasecRadarChart data={riasecData}/>

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
              <div className="space-y-6">
                {rekomendasiProdi.map((prodi: ProgramStudi, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{prodi.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Award className="h-4 w-4 mr-1" />
                          <span>Akreditasi {prodi.akreditasi}</span>
                          <span className="mx-2">•</span>
                          <span>{prodi.biaya}</span>
                        </div>
                      </div>
                      <Badge
                        className={`text-lg px-3 py-1 ${
                          prodi.match >= 90
                            ? "bg-green-100 text-green-800"
                            : prodi.match >= 80
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {prodi.match}% Match
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

                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="mr-2">
                        Lihat Detail
                      </Button>
                      <Button size="sm">Pilih Program Studi</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Rekomendasi</CardTitle>
                <CardDescription>Berdasarkan rumpun ilmu</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChartComponent>
                    <Pie
                      data={[
                        { name: "Sosial Humaniora", value: 45 },
                        { name: "Ekonomi & Bisnis", value: 25 },
                        { name: "Pendidikan", value: 15 },
                        { name: "Kesehatan", value: 10 },
                        { name: "Teknik", value: 5 },
                      ]}
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
                      {riasecData.map((entry, index) => (
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
