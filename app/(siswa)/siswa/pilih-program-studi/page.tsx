"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Check, Award, Coins, Loader2 } from "lucide-react";
import { PrometheeResultSection } from "@/components/promethee/PrometheeResultSection";

interface ProgramStudi {
  id: string;
  nama_program_studi: string;
  akreditasi: string;
  biaya_kuliah: number;
}

export default function PilihProgramStudiPage() {
  const [programs, setPrograms] = useState<ProgramStudi[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [rankingData, setRankingData] = useState<any>(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get("/api/program-studi");
        setPrograms(res.data.data || []);
      } catch (error) {
        toast.error("Gagal memuat data program studi", {
          description: "Silakan coba lagi nanti.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const handleSubmit = async () => {
    const selectedList = Array.from(selected);
    if (selectedList.length < 2) {
      toast.error("Pilih minimal dua program studi untuk perbandingan", {
        description: "Perhatian",
      });
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
      setShowResults(true);

      toast.success("Berhasil menghitung rekomendasi!", {
        description: "Hasil perankingan telah ditampilkan",
      });
    } catch (error: any) {
      toast.error("Gagal memproses perhitungan", {
        description:
          error.response?.data?.message ||
          "Terjadi kesalahan saat menghitung PROMETHEE",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAkreditasiBadgeColor = (akreditasi: string) => {
    switch (akreditasi.toUpperCase()) {
      case "A":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "B":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "C":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat program studi...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Pilih Program Studi"
        description="Silakan pilih program studi yang kamu minati untuk proses seleksi selanjutnya. Pilih minimal 2 program untuk perhitungan PROMETHEE."
      />

      {selected.size > 0 && (
        <div className="bg-muted rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-primary" />
            <span>
              <span className="font-medium">{selected.size}</span> program studi
              dipilih
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelected(new Set());
              setShowResults(false);
              setRankingData(null);
            }}
          >
            Reset
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {programs.map((program) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`h-full transition-all duration-200 overflow-hidden ${
                selected.has(program.id)
                  ? "ring-2 ring-primary shadow-md"
                  : "hover:shadow-md"
              }`}
            >
              <div
                className={`h-2 w-full ${
                  selected.has(program.id) ? "bg-primary" : "bg-muted"
                }`}
              />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold line-clamp-2">
                    {program.nama_program_studi}
                  </h3>
                  {selected.has(program.id) && (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground mr-2">
                      Akreditasi:
                    </span>
                    <Badge
                      variant="secondary"
                      className={getAkreditasiBadgeColor(program.akreditasi)}
                    >
                      {program.akreditasi}
                    </Badge>
                  </div>

                  <div className="flex items-center">
                    <Coins className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Biaya:
                    </span>
                    <span className="ml-2 font-medium">
                      Rp {program.biaya_kuliah.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-end">
                <Button
                  variant={selected.has(program.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSelection(program.id)}
                  className="w-full"
                >
                  {selected.has(program.id) ? "Terpilih" : "Pilih Program"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end mt-8 sticky bottom-4">
        <Button
          onClick={handleSubmit}
          disabled={selected.size < 2 || isSubmitting}
          size="lg"
          className="shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menghitung...
            </>
          ) : (
            <>Hitung Rekomendasi ({selected.size})</>
          )}
        </Button>
      </div>

      {showResults && rankingData && (
        <PrometheeResultSection
          hasilRanking={rankingData.data}
          calculationDetails={rankingData.details}
        />
      )}
    </div>
  );
}
