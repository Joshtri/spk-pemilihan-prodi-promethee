"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { GraduationCap, Check, Award, Coins, Loader2, Search, X } from "lucide-react";
import { PrometheeResultSection } from "@/components/promethee/PrometheeResultSection";

interface ProgramStudi {
  id: string;
  nama_program_studi: string;
  akreditasi: string;
  biaya_kuliah: number;
}

const AKREDITASI_OPTIONS = ["Semua", "A", "B", "C"];

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

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const matchSearch = p.nama_program_studi.toLowerCase().includes(search.toLowerCase());
      const matchAkreditasi = filterAkreditasi === "Semua" || p.akreditasi.toUpperCase() === filterAkreditasi;
      return matchSearch && matchAkreditasi;
    });
  }, [programs, search, filterAkreditasi]);

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
  };

  const handleSubmit = async () => {
    const selectedList = Array.from(selected);
    if (selectedList.length < 3) {
      toast.error("Pilih minimal 3 program studi untuk perbandingan");
      return;
    }
    try {
      setIsSubmitting(true);
      setShowResults(false);
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
      case "A": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "B": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "C": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:  return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const selectedPrograms = programs.filter((p) => selected.has(p.id));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat program studi...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-40">
      <PageHeader
        title="Pilih Program Studi"
        description="Pilih minimal 3 program studi yang ingin kamu bandingkan menggunakan metode PROMETHEE."
      />

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
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

      <p className="text-sm text-muted-foreground mt-3">
        Menampilkan {filtered.length} dari {programs.length} program studi
        {selected.size > 0 && (
          <span className="ml-2 font-medium text-primary">· {selected.size} dipilih</span>
        )}
      </p>

      {/* Program Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {filtered.map((program) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`h-full transition-all duration-200 overflow-hidden cursor-pointer ${
                selected.has(program.id)
                  ? "ring-2 ring-primary shadow-md"
                  : "hover:shadow-md"
              }`}
              onClick={() => toggleSelection(program.id)}
            >
              <div className={`h-1.5 w-full ${selected.has(program.id) ? "bg-primary" : "bg-muted"}`} />
              <CardContent className="p-5">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h3 className="text-base font-semibold leading-snug line-clamp-2 flex-1">
                    {program.nama_program_studi}
                  </h3>
                  {selected.has(program.id) && (
                    <div className="shrink-0 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Akreditasi:</span>
                    <Badge variant="secondary" className={`text-xs ${getAkreditasiColor(program.akreditasi)}`}>
                      {program.akreditasi}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">Biaya:</span>
                    <span className="text-xs font-medium">Rp {program.biaya_kuliah.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="px-5 pb-4 pt-0">
                <Button
                  variant={selected.has(program.id) ? "default" : "outline"}
                  size="sm"
                  className="w-full text-xs"
                  onClick={(e) => { e.stopPropagation(); toggleSelection(program.id); }}
                >
                  {selected.has(program.id) ? "✓ Terpilih" : "Pilih"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mb-3" />
            <p className="font-medium">Tidak ada program studi ditemukan</p>
            <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur shadow-lg">
        <div className="container mx-auto px-4 py-3">
          {selected.size > 0 ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Selected chips */}
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {selectedPrograms.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium max-w-[180px]"
                  >
                    <GraduationCap className="h-3 w-3 shrink-0" />
                    <span className="truncate">{p.nama_program_studi}</span>
                    <button
                      onClick={() => toggleSelection(p.id)}
                      className="ml-0.5 hover:text-destructive shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={resetAll}>
                  Reset
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={selected.size < 2 || isSubmitting}
                  size="sm"
                  className="shadow"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Menghitung...
                    </>
                  ) : (
                    <>Hitung Rekomendasi ({selected.size})</>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
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
          <div className="mt-6 flex justify-end">
            <Button
              onClick={async () => {
                try {
                  const res = await axios.post("/api/promethee/save", { details: rankingData.details });
                  toast.success("Berhasil menyimpan hasil rekomendasi!", {
                    description: `Disimpan sebanyak ${res.data.count} entri.`,
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
