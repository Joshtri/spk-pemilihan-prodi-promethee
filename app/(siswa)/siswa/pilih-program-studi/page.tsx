"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Check,
  Award,
  Coins,
  Loader2,
  Search,
  X,
  Building2,
  ChevronUp,
  Trash2,
  ListChecks,
  ArrowRight,
  CircleCheck,
} from "lucide-react";
import { PrometheeResultSection } from "@/components/promethee/PrometheeResultSection";

interface ProgramStudi {
  id: string;
  nama_program_studi: string;
  akreditasi: string;
  biaya_kuliah: number;
  universitas?: { id: string; nama: string } | null;
}

const AKREDITASI_OPTIONS = ["Semua", "A", "B", "C"];
const MIN_SELECTED = 3;

export default function PilihProgramStudiPage() {
  const [programs, setPrograms] = useState<ProgramStudi[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [rankingData, setRankingData] = useState<any>(null);
  const [submittedOrder, setSubmittedOrder] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterAkreditasi, setFilterAkreditasi] = useState("Semua");
  const [filterUniversitas, setFilterUniversitas] = useState("Semua");
  const [sheetOpen, setSheetOpen] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/api/program-studi");
        setPrograms(res.data.data || []);
      } catch {
        toast.error("Gagal memuat data program studi", { description: "Silakan coba lagi nanti." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  const universitasOptions = useMemo(() => {
    const names = programs
      .map((p) => p.universitas?.nama)
      .filter((n): n is string => Boolean(n));
    return ["Semua", ...Array.from(new Set(names)).sort()];
  }, [programs]);

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch = p.nama_program_studi.toLowerCase().includes(search.toLowerCase());
      const matchAkreditasi = filterAkreditasi === "Semua" || p.akreditasi.toUpperCase() === filterAkreditasi;
      const matchUniversitas = filterUniversitas === "Semua" || p.universitas?.nama === filterUniversitas;
      return matchSearch && matchAkreditasi && matchUniversitas;
    });
  }, [programs, search, filterAkreditasi, filterUniversitas]);

  const selectedPrograms = programs.filter((p) => selected.has(p.id));

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  const resetAll = () => {
    setSelected(new Set());
    setShowResults(false);
    setRankingData(null);
    setSheetOpen(false);
  };

  const handleSubmit = async () => {
    const selectedList = Array.from(selected);
    if (selectedList.length < MIN_SELECTED) {
      toast.error(`Pilih minimal ${MIN_SELECTED} program studi untuk perbandingan`);
      return;
    }
    try {
      setIsSubmitting(true);
      setShowResults(false);
      setSheetOpen(false);
      const res = await axios.post("/api/promethee/preview", {
        programStudiIds: selectedList,
        includeDetails: true,
      });
      setRankingData(res.data);
      setSubmittedOrder(selectedList);
      setShowResults(true);
      toast.success("Berhasil menghitung rekomendasi!", { description: "Hasil perankingan telah ditampilkan." });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error: any) {
      toast.error("Gagal memproses perhitungan", {
        description: error.response?.data?.message || "Terjadi kesalahan saat menghitung PROMETHEE",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAkreditasiColor = (akreditasi: string) => {
    switch (akreditasi.toUpperCase()) {
      case "A": return "bg-green-100 text-green-800 border-green-200";
      case "B": return "bg-blue-100 text-blue-800 border-blue-200";
      case "C": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:  return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const remaining = Math.max(0, MIN_SELECTED - selected.size);
  const isReady = selected.size >= MIN_SELECTED;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat program studi...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-36">
      <PageHeader
        title="Pilih Program Studi"
        description="Pilih minimal 3 program studi yang ingin kamu bandingkan. Klik kartu untuk memilih."
      />

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 mt-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama program studi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {AKREDITASI_OPTIONS.map((opt) => (
              <Button
                key={opt}
                variant={filterAkreditasi === opt ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterAkreditasi(opt)}
              >
                {opt === "Semua" ? "Semua Akreditasi" : `Akreditasi ${opt}`}
              </Button>
            ))}
          </div>
        </div>
        {/* {universitasOptions.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {universitasOptions.map((opt) => (
              <Button
                key={opt}
                variant={filterUniversitas === opt ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterUniversitas(opt)}
              >
                <Building2 className="mr-1.5 h-3.5 w-3.5" />
                {opt === "Semua" ? "Semua Universitas" : opt}
              </Button>
            ))}
          </div>
        )} */}
      </div>

      <p className="text-sm text-muted-foreground mt-3">
        Menampilkan {filtered.length} dari {programs.length} program studi
        {selected.size > 0 && (
          <span className="ml-2 font-medium text-primary">· {selected.size} dipilih</span>
        )}
      </p>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {filtered.map((program) => {
          const isSelected = selected.has(program.id);
          return (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`h-full transition-all duration-200 overflow-hidden cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary shadow-lg bg-primary/5"
                    : "hover:shadow-md"
                }`}
                onClick={() => toggleSelection(program.id)}
              >
                {/* Top accent bar */}
                <div className={`h-1.5 w-full transition-colors ${isSelected ? "bg-primary" : "bg-muted"}`} />

                <CardContent className="p-5">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="text-base font-semibold leading-snug line-clamp-2 flex-1">
                      {program.nama_program_studi}
                    </h3>
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          className="shrink-0 bg-primary text-primary-foreground rounded-full p-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-2">
                    {program.universitas && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">{program.universitas.nama}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Award className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">Akreditasi:</span>
                      <Badge
                        variant="outline"
                        className={`text-xs px-1.5 py-0 border ${getAkreditasiColor(program.akreditasi)}`}
                      >
                        {program.akreditasi}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">Biaya/semester:</span>
                      <span className="text-xs font-semibold">
                        Rp {program.biaya_kuliah.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-5 pb-4 pt-0">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="w-full text-xs"
                    onClick={(e) => { e.stopPropagation(); toggleSelection(program.id); }}
                  >
                    {isSelected ? (
                      <><Check className="mr-1.5 h-3.5 w-3.5" /> Terpilih — Klik untuk batal</>
                    ) : (
                      "Pilih Program Studi Ini"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mb-3 opacity-40" />
            <p className="font-medium text-foreground">Tidak ada program studi ditemukan</p>
            <p className="text-sm mt-1">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <AnimatePresence>
        {!sheetOpen && (
          <motion.button
            key="fab"
            onClick={() => setSheetOpen(true)}
            className={`fixed bottom-20 right-5 z-40 flex items-center gap-2.5 rounded-full px-5 py-3.5 shadow-xl text-white font-semibold text-sm transition-colors ${
              isReady
                ? "bg-primary hover:bg-primary/90"
                : "bg-zinc-700 hover:bg-zinc-600"
            }`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="relative">
              <ListChecks className="h-5 w-5" />
              {selected.size > 0 && (
                <motion.span
                  key={selected.size}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2.5 -right-2.5 bg-white text-primary text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow"
                >
                  {selected.size}
                </motion.span>
              )}
            </div>
            <span>
              {selected.size === 0
                ? "Pilihan Saya"
                : isReady
                ? "Lihat Pilihan"
                : `Tambah ${remaining} lagi`}
            </span>
            <ChevronUp className="h-4 w-4 opacity-70" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Bottom Sheet ── */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Sheet Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b shrink-0">
                <div>
                  <h2 className="font-semibold text-base">Program Studi Pilihanmu</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selected.size === 0
                      ? "Belum ada yang dipilih"
                      : isReady
                      ? `${selected.size} program dipilih — siap dihitung!`
                      : `${selected.size} dipilih, butuh ${remaining} lagi untuk melanjutkan`}
                  </p>
                </div>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="rounded-full p-1.5 hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="px-5 py-3 border-b shrink-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs text-muted-foreground">Progres pilihan</span>
                  <span className="text-xs font-semibold text-primary">
                    {selected.size}/{MIN_SELECTED} minimal
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {Array.from({ length: Math.max(selected.size, MIN_SELECTED) }).map((_, i) => (
                    <motion.div
                      key={i}
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        i < selected.size ? "bg-primary" : "bg-muted"
                      }`}
                      initial={i === selected.size - 1 ? { scaleX: 0 } : {}}
                      animate={{ scaleX: 1 }}
                      style={{ transformOrigin: "left" }}
                    />
                  ))}
                </div>
                {isReady && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5 mt-2"
                  >
                    <CircleCheck className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">
                      Sudah cukup! Kamu bisa hitung sekarang.
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Selected List */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 min-h-0">
                {selected.size === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mb-2 opacity-30" />
                    <p className="text-sm font-medium">Belum ada pilihan</p>
                    <p className="text-xs mt-1">Tutup panel ini lalu klik program studi yang kamu minati</p>
                  </div>
                ) : (
                  selectedPrograms.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border"
                    >
                      {/* Number badge */}
                      <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-snug line-clamp-2">
                          {p.nama_program_studi}
                        </p>
                        {p.universitas && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">{p.universitas.nama}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 border ${getAkreditasiColor(p.akreditasi)}`}
                          >
                            Akreditasi {p.akreditasi}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            Rp {p.biaya_kuliah.toLocaleString("id-ID")}/sem
                          </span>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => toggleSelection(p.id)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Sheet Footer Actions */}
              <div className="px-5 py-4 border-t shrink-0 space-y-2.5">
                {!isReady && selected.size > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    Pilih <span className="font-semibold text-foreground">{remaining} program studi lagi</span> untuk bisa menghitung rekomendasi
                  </p>
                )}
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={!isReady || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sedang menghitung...
                    </>
                  ) : (
                    <>
                      Hitung Rekomendasi
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-destructive"
                  size="sm"
                  onClick={resetAll}
                  disabled={selected.size === 0}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Hapus Semua Pilihan
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Sticky Footer Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur shadow-lg">
        <div className="container mx-auto px-4 py-2.5">
          {selected.size > 0 ? (
            <div className="flex items-center gap-3">
              {/* Chips */}
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0 overflow-hidden max-h-10">
                {selectedPrograms.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium max-w-[180px]"
                  >
                    <GraduationCap className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {p.nama_program_studi}
                      {p.universitas && <span className="opacity-60"> · {p.universitas.nama}</span>}
                    </span>
                    <button
                      onClick={() => toggleSelection(p.id)}
                      className="ml-0.5 hover:text-destructive shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={resetAll} className="text-muted-foreground">
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!isReady || isSubmitting}
                  className="shadow gap-1.5"
                >
                  {isSubmitting ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Menghitung...</>
                  ) : (
                    <>Hitung ({selected.size})<ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-0.5">
              Pilih minimal 3 program studi untuk memulai perhitungan PROMETHEE
            </p>
          )}
        </div>
      </div>

      {/* Results */}
      {showResults && rankingData && (
        <div className="mt-10" ref={resultsRef}>
          <PrometheeResultSection
            hasilRanking={rankingData.data}
            calculationDetails={rankingData.details}
            programStudiIds={submittedOrder}
          />
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border bg-muted/40 p-4">
            <div>
              <p className="text-sm font-medium">Simpan hasil ini?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hasil perankingan{" "}
                {rankingData?.data?.map((r: any, i: number) => (
                  <span key={r.programStudiId}>
                    {i > 0 && " · "}
                    <span className="font-medium text-foreground">
                      {r.nama}
                      {r.universitas_nama ? ` (${r.universitas_nama})` : ""}
                    </span>
                  </span>
                ))}{" "}
                akan disimpan ke riwayat kamu.
              </p>
            </div>
            <Button
              className="shrink-0"
              onClick={async () => {
                try {
                  await axios.post("/api/promethee/save", { details: rankingData.details });
                  const top = rankingData?.data?.[0];
                  toast.success("Hasil rekomendasi berhasil disimpan!", {
                    description: top
                      ? `Rekomendasi terbaik: ${top.nama}${top.universitas_nama ? ` — ${top.universitas_nama}` : ""}`
                      : "Data berhasil disimpan.",
                  });
                } catch (err: any) {
                  toast.error("Gagal menyimpan hasil", {
                    description: err.response?.data?.message || "Terjadi kesalahan saat menyimpan.",
                  });
                }
              }}
            >
              Simpan Hasil Rekomendasi
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
