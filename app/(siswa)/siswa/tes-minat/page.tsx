"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  Brain,
  Palette,
  Users,
  TrendingUp,
  ClipboardList,
  Wrench,
  BarChart3,
  Trophy,
} from "lucide-react";

// ─── Soal RIASEC ─────────────────────────────────────────────────────────────
// Soal 1-5: Realistic, 6-10: Investigative, 11-15: Artistic,
// 16-20: Social, 21-25: Enterprising, 26-30: Conventional
// Update soal sesuai Tabel 2.10 proposal jika diperlukan.
const SOAL: string[] = [
  // Realistic (R) — 1-5
  "Saya suka bekerja dengan peralatan, mesin, atau alat-alat praktis.",
  "Saya senang melakukan kegiatan fisik di luar ruangan atau di lapangan.",
  "Saya tertarik memperbaiki atau merakit benda-benda secara langsung.",
  "Saya lebih suka bekerja dengan tangan daripada pekerjaan administratif.",
  "Saya menikmati kegiatan yang berhubungan dengan teknik atau konstruksi.",
  // Investigative (I) — 6-10
  "Saya suka menganalisis masalah secara mendalam dan sistematis.",
  "Saya senang membaca tentang ilmu pengetahuan, sains, atau teknologi.",
  "Saya menikmati kegiatan yang memerlukan berpikir kritis dan logis.",
  "Saya tertarik melakukan penelitian, eksperimen, atau penyelidikan.",
  "Saya suka memecahkan soal matematika atau teka-teki yang menantang.",
  // Artistic (A) — 11-15
  "Saya suka mengekspresikan diri melalui seni, musik, atau tulisan.",
  "Saya menikmati kegiatan kreatif seperti menggambar, melukis, atau desain.",
  "Saya senang menciptakan karya yang orisinal dan penuh imajinasi.",
  "Saya tertarik pada dunia seni, sastra, teater, atau pertunjukan.",
  "Saya lebih suka pekerjaan yang memberi kebebasan berekspresi dan berkreasi.",
  // Social (S) — 16-20
  "Saya suka membantu orang lain dalam menyelesaikan masalah mereka.",
  "Saya menikmati mengajar, melatih, atau menjelaskan sesuatu kepada orang lain.",
  "Saya senang berinteraksi dan bergaul dengan banyak orang setiap harinya.",
  "Saya tertarik terlibat dalam kegiatan sosial, komunitas, atau sukarela.",
  "Saya merasa puas dan bermakna ketika bisa memberi manfaat bagi orang lain.",
  // Enterprising (E) — 21-25
  "Saya suka memimpin dan mengorganisir orang lain dalam suatu proyek.",
  "Saya tertarik pada dunia bisnis, pemasaran, atau kewirausahaan.",
  "Saya senang meyakinkan, bernegosiasi, atau memengaruhi pendapat orang lain.",
  "Saya suka mengambil inisiatif dan membuat keputusan-keputusan penting.",
  "Saya menikmati kompetisi dan selalu berusaha mencapai target tertinggi.",
  // Conventional (C) — 26-30
  "Saya suka bekerja dengan angka, data, laporan, atau dokumen.",
  "Saya menikmati pekerjaan yang teratur, sistematis, dan terstruktur.",
  "Saya senang mengikuti prosedur dan aturan yang sudah ditetapkan dengan baik.",
  "Saya tertarik pada pekerjaan administrasi, akuntansi, atau manajemen data.",
  "Saya lebih suka lingkungan kerja yang terprediksi dan terorganisir dengan rapi.",
];

const RIASEC_ORDER = ["R", "I", "A", "S", "E", "C"] as const;
type RiasecType = (typeof RIASEC_ORDER)[number];

const RIASEC_META: Record<RiasecType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  R: { label: "Realistic",      color: "text-green-700",  bg: "bg-green-50 border-green-200",  icon: <Wrench className="h-4 w-4" /> },
  I: { label: "Investigative",  color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",    icon: <Brain className="h-4 w-4" /> },
  A: { label: "Artistic",       color: "text-purple-700", bg: "bg-purple-50 border-purple-200",icon: <Palette className="h-4 w-4" /> },
  S: { label: "Social",         color: "text-orange-700", bg: "bg-orange-50 border-orange-200",icon: <Users className="h-4 w-4" /> },
  E: { label: "Enterprising",   color: "text-red-700",    bg: "bg-red-50 border-red-200",      icon: <TrendingUp className="h-4 w-4" /> },
  C: { label: "Conventional",   color: "text-gray-700",   bg: "bg-gray-50 border-gray-200",    icon: <ClipboardList className="h-4 w-4" /> },
};

function getRiasecType(questionIndex: number): RiasecType {
  return RIASEC_ORDER[Math.floor(questionIndex / 5)];
}

function computeScores(answers: (boolean | null)[]): Record<RiasecType, number> {
  const scores = {} as Record<RiasecType, number>;
  RIASEC_ORDER.forEach((type, i) => {
    const slice = answers.slice(i * 5, i * 5 + 5);
    scores[type] = slice.filter((a) => a === true).length * 5;
  });
  return scores;
}

function computeTop3(scores: Record<RiasecType, number>): RiasecType[] {
  return [...RIASEC_ORDER].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) return diff;
    return RIASEC_ORDER.indexOf(a) - RIASEC_ORDER.indexOf(b);
  }).slice(0, 3);
}

// ─── Komponen Tampilan Hasil ──────────────────────────────────────────────────
function HasilTes({
  scores,
  top3,
  answers,
  onRetake,
}: {
  scores: Record<RiasecType, number>;
  top3: RiasecType[];
  answers: (boolean | null)[];
  onRetake: () => void;
}) {
  const router = useRouter();

  const sorted = [...RIASEC_ORDER].sort((a, b) => {
    const diff = scores[b] - scores[a];
    if (diff !== 0) return diff;
    return RIASEC_ORDER.indexOf(a) - RIASEC_ORDER.indexOf(b);
  });

  return (
    <div className="space-y-6 mt-6">
      {/* Top 3 */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            3 Tipe RIASEC Dominan Kamu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {top3.map((type, rank) => {
              const meta = RIASEC_META[type];
              return (
                <div
                  key={type}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${meta.bg} font-semibold`}
                >
                  <span className="text-xs text-muted-foreground font-normal">#{rank + 1}</span>
                  <span className={meta.color}>{meta.icon}</span>
                  <span className={meta.color}>
                    {type} — {meta.label}
                  </span>
                  <Badge variant="secondary" className="text-xs">{scores[type]} poin</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Perhitungan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4" />
            Detail Perhitungan Skor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 pr-4 font-medium">Peringkat</th>
                  <th className="text-left py-2 pr-4 font-medium">Tipe</th>
                  <th className="text-left py-2 pr-4 font-medium">No. Soal</th>
                  <th className="text-center py-2 pr-4 font-medium">Jawaban "Iya"</th>
                  <th className="text-center py-2 font-medium">Skor (Iya × 5)</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((type, rank) => {
                  const meta = RIASEC_META[type];
                  const typeIndex = RIASEC_ORDER.indexOf(type);
                  const slice = answers.slice(typeIndex * 5, typeIndex * 5 + 5);
                  const yesCount = slice.filter((a) => a === true).length;
                  const isTop3 = top3.includes(type);
                  return (
                    <tr key={type} className={`border-b last:border-0 ${isTop3 ? "font-medium" : "text-muted-foreground"}`}>
                      <td className="py-2.5 pr-4">
                        {isTop3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {rank + 1}
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs">
                            {rank + 1}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`flex items-center gap-1.5 ${meta.color}`}>
                          {meta.icon}
                          <span>{type} ({meta.label})</span>
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                        {typeIndex * 5 + 1}–{typeIndex * 5 + 5}
                      </td>
                      <td className="py-2.5 pr-4 text-center">
                        <span className="font-semibold">{yesCount}</span>
                        <span className="text-muted-foreground text-xs"> / 5</span>
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`font-bold ${isTop3 ? "text-primary text-base" : ""}`}>
                          {scores[type]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Rumus: Skor = jumlah jawaban "Iya" × 5. Jika skor sama, urutan prioritas R &gt; I &gt; A &gt; S &gt; E &gt; C.
          </p>
        </CardContent>
      </Card>

      {/* Jawaban Per Soal */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rekap Jawaban Per Soal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {RIASEC_ORDER.map((type) => {
              const meta = RIASEC_META[type];
              const typeIndex = RIASEC_ORDER.indexOf(type);
              return (
                <div key={type}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5 ${meta.color}`}>
                    {meta.icon} {type} — {meta.label} (Soal {typeIndex * 5 + 1}–{typeIndex * 5 + 5})
                  </p>
                  <div className="space-y-1">
                    {SOAL.slice(typeIndex * 5, typeIndex * 5 + 5).map((soal, qi) => {
                      const globalIdx = typeIndex * 5 + qi;
                      const ans = answers[globalIdx];
                      return (
                        <div key={qi} className="flex items-start gap-2 text-sm">
                          <span className="text-xs text-muted-foreground w-4 shrink-0 mt-0.5">{globalIdx + 1}.</span>
                          <span className="flex-1 text-muted-foreground">{soal}</span>
                          <span className={`text-xs font-semibold shrink-0 ${ans ? "text-green-600" : "text-red-500"}`}>
                            {ans ? "Iya" : "Tidak"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 gap-2" onClick={() => router.push("/siswa/pilih-program-studi")}>
          Lanjut ke Pilih Program Studi
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" className="gap-2" onClick={onRetake}>
          <RotateCcw className="h-4 w-4" />
          Ulangi Tes
        </Button>
      </div>
    </div>
  );
}

// ─── Halaman Utama ─────────────────────────────────────────────────────────────
export default function TesMinatPage() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(30).fill(null));
  const [phase, setPhase] = useState<"loading" | "form" | "result">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultScores, setResultScores] = useState<Record<RiasecType, number> | null>(null);
  const [resultTop3, setResultTop3] = useState<RiasecType[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<(boolean | null)[]>(Array(30).fill(null));

  useEffect(() => {
    axios.get("/api/tes-minat/take").then((res) => {
      const data = res.data?.data;
      if (data && data.jawaban) {
        const jaw = data.jawaban as boolean[];
        setSavedAnswers(jaw);
        setAnswers(jaw);
        const scores = computeScores(jaw);
        const top3 = computeTop3(scores);
        setResultScores(scores);
        setResultTop3(top3);
        setPhase("result");
      } else {
        setPhase("form");
      }
    }).catch(() => setPhase("form"));
  }, []);

  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === 30;

  const setAnswer = (index: number, value: boolean) => {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!allAnswered) {
      toast.error("Jawab semua 30 pertanyaan terlebih dahulu");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post("/api/tes-minat/take", { jawaban: answers });
      setResultScores(res.data.scores);
      setResultTop3(res.data.top3);
      setSavedAnswers(answers);
      setPhase("result");
      toast.success("Tes minat berhasil disimpan!");
    } catch {
      toast.error("Gagal menyimpan tes minat. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers(Array(30).fill(null));
    setPhase("form");
  };

  if (phase === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat data tes minat...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <PageHeader
        title="Tes Minat RIASEC"
        description={
          phase === "result"
            ? "Hasil tes minatmu sudah tersimpan. Kamu bisa mengulang tes kapan saja."
            : "Jawab 30 pertanyaan berikut dengan jujur. Pilih 'Iya' jika pernyataan sesuai denganmu."
        }
      />

      {phase === "result" && resultScores ? (
        <HasilTes
          scores={resultScores}
          top3={resultTop3}
          answers={savedAnswers}
          onRetake={handleRetake}
        />
      ) : (
        <div className="mt-6 space-y-8">
          {/* Progress */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progres jawaban</span>
                <span className="font-semibold text-foreground">{answeredCount} / 30</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${(answeredCount / 30) * 100}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>
            {allAnswered && (
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
            )}
          </div>

          {/* Soal per kelompok */}
          {RIASEC_ORDER.map((type) => {
            const meta = RIASEC_META[type];
            const typeIndex = RIASEC_ORDER.indexOf(type);
            return (
              <div key={type}>
                <div className={`flex items-center gap-2 mb-3 px-1`}>
                  <span className={meta.color}>{meta.icon}</span>
                  <span className={`text-sm font-semibold ${meta.color}`}>
                    Kelompok {type} — {meta.label}
                  </span>
                  <span className="text-xs text-muted-foreground">(Soal {typeIndex * 5 + 1}–{typeIndex * 5 + 5})</span>
                </div>
                <div className="space-y-3">
                  {SOAL.slice(typeIndex * 5, typeIndex * 5 + 5).map((soal, qi) => {
                    const globalIdx = typeIndex * 5 + qi;
                    const ans = answers[globalIdx];
                    return (
                      <motion.div
                        key={qi}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: qi * 0.05 }}
                        className={`rounded-xl border p-4 transition-colors ${
                          ans !== null ? meta.bg : "bg-background"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xs text-muted-foreground font-medium w-5 shrink-0 mt-0.5">
                            {globalIdx + 1}.
                          </span>
                          <p className="flex-1 text-sm leading-relaxed">{soal}</p>
                        </div>
                        <div className="flex gap-2 mt-3 ml-8">
                          <Button
                            size="sm"
                            variant={ans === true ? "default" : "outline"}
                            className={`flex-1 text-xs ${ans === true ? "" : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"}`}
                            onClick={() => setAnswer(globalIdx, true)}
                          >
                            Iya
                          </Button>
                          <Button
                            size="sm"
                            variant={ans === false ? "default" : "outline"}
                            className={`flex-1 text-xs ${ans === false ? "bg-red-600 text-white hover:bg-red-700" : "hover:bg-red-50 hover:text-red-600 hover:border-red-300"}`}
                            onClick={() => setAnswer(globalIdx, false)}
                          >
                            Tidak
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Submit */}
          <div className="sticky bottom-4 pt-2">
            <Button
              className="w-full gap-2 shadow-lg"
              size="lg"
              onClick={handleSubmit}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : allAnswered ? (
                <>
                  <GraduationCap className="h-4 w-4" />
                  Lihat Hasil Tes Minat
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Jawab semua soal terlebih dahulu ({answeredCount}/30)
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
