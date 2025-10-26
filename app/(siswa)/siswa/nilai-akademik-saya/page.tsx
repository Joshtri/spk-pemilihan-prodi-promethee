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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <PageHeader
        title="Nilai Akademik Saya"
        description="Berikut adalah nilai akademik Anda berdasarkan mata pelajaran yang telah dinilai."
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base">Memuat data nilai akademik...</p>
        </div>
      ) : data.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
          <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium mb-2">Belum Ada Nilai</h3>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md">
            Belum ada nilai akademik yang tersedia untuk Anda. Nilai akan
            ditampilkan setelah guru melakukan penilaian.
          </p>
        </Card>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Average Grade */}
            <Card className="p-3 sm:p-4 border-l-4 border-l-primary">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Rata-rata Nilai
                  </p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold">{averageGrade}</h3>
                    <Badge
                      className={cn("font-bold text-xs", getGradeColor(averageGrade))}
                    >
                      {getGradeLetter(averageGrade)}
                    </Badge>
                  </div>
                </div>
                <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
              </div>
              <Progress
                value={averageGrade}
                max={100}
                className="h-2 mt-3 sm:mt-4"
                // indicatorClassName={getProgressColor(averageGrade)}
              />
            </Card>

            {/* Highest Grade */}
            <Card className="p-3 sm:p-4 border-l-4 border-l-emerald-500">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Nilai Tertinggi
                  </p>
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <h3 className="text-xl sm:text-2xl font-bold">
                      {highestGrade?.nilai || 0}
                    </h3>
                    {highestGrade && (
                      <Badge
                        className={cn(
                          "font-bold text-xs",
                          getGradeColor(highestGrade.nilai)
                        )}
                      >
                        {getGradeLetter(highestGrade.nilai)}
                      </Badge>
                    )}
                  </div>
                  {highestGrade && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {highestGrade.pelajaran}
                    </p>
                  )}
                </div>
                <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                </div>
              </div>
            </Card>

            {/* Grade Distribution */}
            <Card className="p-3 sm:p-4 border-l-4 border-l-blue-500 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    Distribusi Nilai
                  </p>
                  <div className="flex items-center gap-1 sm:gap-1.5 mt-2">
                    <TooltipProvider>
                      {Object.entries(gradeCounts).map(([letter, count]) => (
                        <Tooltip key={letter}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "flex flex-col items-center px-1.5 sm:px-2 py-1 rounded-md cursor-pointer",
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
                              <span className="font-bold text-xs sm:text-sm">{letter}</span>
                              <span className="text-[10px] sm:text-xs">{count}</span>
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
                <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Grades Table */}
          <Card className="overflow-hidden border">
            <div className="bg-muted/50 px-3 sm:px-4 py-2.5 sm:py-3 border-b">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="truncate">Daftar Nilai Mata Pelajaran</span>
                </h3>
                <Badge variant="outline" className="text-xs flex-shrink-0">{data.length} Mapel</Badge>
              </div>
            </div>

            <ScrollArea className="max-h-[400px] sm:max-h-[500px]">
              <Table>
                <TableHeader className="bg-muted/30 sticky top-0">
                  <TableRow>
                    <TableHead className="w-8 sm:w-12 text-center text-xs">#</TableHead>
                    <TableHead className="text-xs sm:text-sm">Mata Pelajaran</TableHead>
                    <TableHead className="w-16 sm:w-24 text-center text-xs sm:text-sm">Nilai</TableHead>
                    <TableHead className="w-16 sm:w-24 text-center text-xs sm:text-sm">Grade</TableHead>
                    <TableHead className="hidden md:table-cell w-[180px] text-xs sm:text-sm">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-xs sm:text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{item.pelajaran}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm sm:text-base font-bold">
                        {item.nilai}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={cn("font-bold text-[10px] sm:text-xs", getGradeColor(item.nilai))}
                        >
                          {getGradeLetter(item.nilai)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
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

          </Card>
            <div className="bg-muted/20 px-3 sm:px-4 py-2.5 sm:py-3 border-t mt-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                  <span>Semua nilai telah diperbarui</span>
                </div>
                <div className="text-xs sm:text-sm">
                  Rata-rata:{" "}
                  <span className="font-medium">
                    {averageGrade} ({getGradeLetter(averageGrade)})
                  </span>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
