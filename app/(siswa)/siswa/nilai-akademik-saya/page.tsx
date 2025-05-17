"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Award,
  Loader2,
  FileText,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NilaiAkademik {
  id: string;
  pelajaran: string;
  nilai: number;
}

export default function NilaiAkademikSayaPage() {
  const [data, setData] = useState<NilaiAkademik[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/nilai-akademik/me") // ← asumsi ambil nilai berdasarkan auth
      .then((res) => {
        setData(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Gagal memuat nilai saya:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Get grade color based on value
  const getGradeColor = (nilai: number) => {
    if (nilai >= 90) return "text-emerald-600 bg-emerald-50";
    if (nilai >= 80) return "text-green-600 bg-green-50";
    if (nilai >= 70) return "text-blue-600 bg-blue-50";
    if (nilai >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  // Get progress color based on value
  const getProgressColor = (nilai: number) => {
    if (nilai >= 90) return "bg-emerald-500";
    if (nilai >= 80) return "bg-green-500";
    if (nilai >= 70) return "bg-blue-500";
    if (nilai >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Get grade letter based on value
  const getGradeLetter = (nilai: number) => {
    if (nilai >= 90) return "A";
    if (nilai >= 80) return "B";
    if (nilai >= 70) return "C";
    if (nilai >= 60) return "D";
    return "E";
  };

  // Calculate average grade
  const calculateAverage = () => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + item.nilai, 0);
    return Math.round(sum / data.length);
  };

  // Get highest and lowest grades
  const getHighestGrade = () => {
    if (data.length === 0) return null;
    return data.reduce(
      (max, item) => (item.nilai > max.nilai ? item : max),
      data[0]
    );
  };

  const getLowestGrade = () => {
    if (data.length === 0) return null;
    return data.reduce(
      (min, item) => (item.nilai < min.nilai ? item : min),
      data[0]
    );
  };

  // Count grades by letter
  const countGradesByLetter = () => {
    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    data.forEach((item) => {
      const letter = getGradeLetter(item.nilai);
      counts[letter as keyof typeof counts]++;
    });
    return counts;
  };

  const gradeCounts = countGradesByLetter();
  const averageGrade = calculateAverage();
  const highestGrade = getHighestGrade();
  const lowestGrade = getLowestGrade();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <PageHeader
        title="Nilai Akademik Saya"
        description="Berikut adalah nilai akademik Anda berdasarkan mata pelajaran yang telah dinilai."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Memuat data nilai akademik...</p>
        </div>
      ) : data.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Belum Ada Nilai</h3>
          <p className="text-muted-foreground max-w-md">
            Belum ada nilai akademik yang tersedia untuk Anda. Nilai akan
            ditampilkan setelah guru melakukan penilaian.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Grade */}
            <Card className="p-4 border-l-4 border-l-primary">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Rata-rata Nilai
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold">{averageGrade}</h3>
                    <Badge
                      className={cn("font-bold", getGradeColor(averageGrade))}
                    >
                      {getGradeLetter(averageGrade)}
                    </Badge>
                  </div>
                </div>
                <div className="bg-primary/10 p-2 rounded-full">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
              </div>
              <Progress
                value={averageGrade}
                max={100}
                className="h-2 mt-4"
                // indicatorClassName={getProgressColor(averageGrade)}
              />
            </Card>

            {/* Highest Grade */}
            <Card className="p-4 border-l-4 border-l-emerald-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Nilai Tertinggi
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold">
                      {highestGrade?.nilai || 0}
                    </h3>
                    {highestGrade && (
                      <Badge
                        className={cn(
                          "font-bold",
                          getGradeColor(highestGrade.nilai)
                        )}
                      >
                        {getGradeLetter(highestGrade.nilai)}
                      </Badge>
                    )}
                  </div>
                  {highestGrade && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {highestGrade.pelajaran}
                    </p>
                  )}
                </div>
                <div className="bg-emerald-100 p-2 rounded-full">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </Card>

            {/* Grade Distribution */}
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Distribusi Nilai
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TooltipProvider>
                      {Object.entries(gradeCounts).map(([letter, count]) => (
                        <Tooltip key={letter}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "flex flex-col items-center px-2 py-1 rounded-md",
                                count > 0
                                  ? {
                                      A: "bg-emerald-50 text-emerald-600",
                                      B: "bg-green-50 text-green-600",
                                      C: "bg-blue-50 text-blue-600",
                                      D: "bg-yellow-50 text-yellow-600",
                                      E: "bg-red-50 text-red-600",
                                    }[letter]
                                  : "bg-gray-50 text-gray-400"
                              )}
                            >
                              <span className="font-bold">{letter}</span>
                              <span className="text-xs">{count}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {count} mata pelajaran dengan nilai {letter}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Award className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Grades Table */}
          <Card className="overflow-hidden border">
            <div className="bg-muted/50 px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Daftar Nilai Mata Pelajaran
                </h3>
                <Badge variant="outline">{data.length} Mata Pelajaran</Badge>
              </div>
            </div>

            <ScrollArea className="max-h-[500px]">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0">
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead className="w-32 text-center">Nilai</TableHead>
                    <TableHead className="w-32 text-center">Grade</TableHead>
                    <TableHead className="w-[180px]">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{item.pelajaran}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {item.nilai}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={cn("font-bold", getGradeColor(item.nilai))}
                        >
                          {getGradeLetter(item.nilai)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={item.nilai}
                            max={100}
                            className="h-2"
                            // indicatorClassName={getProgressColor(item.nilai)}
                          />
                          <span className="text-xs w-8 text-right">
                            {item.nilai}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="bg-muted/20 px-4 py-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Semua nilai telah diperbarui</span>
                </div>
                <div className="text-sm">
                  Rata-rata:{" "}
                  <span className="font-medium">
                    {averageGrade} ({getGradeLetter(averageGrade)})
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
