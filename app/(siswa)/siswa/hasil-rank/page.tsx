"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Loader2, Trophy, GraduationCap } from "lucide-react";

import { PrometheeResultSection } from "@/components/promethee/PrometheeResultSection";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HistoryResult {
  data: {
    programStudiId: string;
    nama: string;
    universitas_nama?: string | null;
    netFlow: number;
    leavingFlow: number;
    enteringFlow: number;
  }[];
  details: {
    programStudiId: string;
    nama: string;
    universitas_nama?: string | null;
    criteria: {
      name: string;
      value: number;
      weight: number;
      subName?: string;
    }[];
    leavingFlow: number;
    enteringFlow: number;
    netFlow: number;
  }[];
  savedAt: string | null;
  programStudiIds: string[];
}

export default function HasilRankPage() {
  const router = useRouter();
  const [result, setResult] = useState<HistoryResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get("/api/promethee/history-result");
        setResult(res.data);
      } catch {
        toast.error("Gagal memuat riwayat hasil rekomendasi");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memuat riwayat hasil rekomendasi...</p>
      </div>
    );
  }

  const isEmpty = !result || result.data.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Riwayat Hasil Rekomendasi"
        description="Hasil perhitungan PROMETHEE dari sesi terakhir kamu."
        breadcrumbs={[
          { label: "Dashboard", href: "/siswa/dashboard" },
          { label: "Hasil Rekomendasi" },
        ]}
      />

      {isEmpty ? (
        <div className="mt-16 flex flex-col items-center justify-center text-muted-foreground">
          <GraduationCap className="h-16 w-16 mb-4 opacity-25" />
          <p className="text-lg font-medium text-foreground">Belum ada riwayat rekomendasi</p>
          <p className="text-sm mt-1 mb-6">
            Pilih program studi dan hitung rekomendasi terlebih dahulu.
          </p>
          <Button onClick={() => router.push("/siswa/pilih-program-studi")}>
            <Trophy className="mr-2 h-4 w-4" />
            Mulai Pilih Program Studi
          </Button>
        </div>
      ) : (
        <>
          {result.savedAt && (
            <p className="text-sm text-muted-foreground mt-2">
              Disimpan pada:{" "}
              <span className="font-medium text-foreground">
                {format(new Date(result.savedAt), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
              </span>
            </p>
          )}

          <PrometheeResultSection
            hasilRanking={result.data}
            calculationDetails={result.details}
            programStudiIds={result.programStudiIds}
          />
        </>
      )}
    </div>
  );
}
