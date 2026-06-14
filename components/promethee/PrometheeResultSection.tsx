import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, Calculator, Info, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface RankingResult {
  programStudiId: string;
  nama: string;
  universitas_nama?: string | null;
  netFlow: number | null;
  leavingFlow: number | null;
  enteringFlow: number | null;
}

interface CalculationDetail {
  programStudiId: string;
  nama: string;
  universitas_nama?: string | null;
  criteria: {
    name: string;
    value: number;
    weight: number;
    subName?: string;
  }[];
  leavingFlow: number | null;
  enteringFlow: number | null;
  netFlow: number | null;
}

interface Props {
  hasilRanking: RankingResult[];
  calculationDetails: CalculationDetail[];
  programStudiIds?: string[];
}

export function PrometheeResultSection({
  hasilRanking,
  calculationDetails,
  programStudiIds = [],
}: Props) {
  // Build alternative code map: A1, A2, A3, ... based on submission order
  const altCodeMap = Object.fromEntries(
    programStudiIds.map((id, i) => [id, `A${i + 1}`])
  );
  const [showCalculation, setShowCalculation] = useState(false);

  const formatFlow = (value: number | null | undefined): string => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value.toFixed(4);
    }
    return "N/A";
  };

  const getRankingColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white";
      case 1:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white";
      case 2:
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white";
      default:
        return "bg-muted";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-12 space-y-6"
    >
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center">
            <Trophy className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-2xl font-bold">Hasil Rekomendasi</h2>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Berdasarkan perhitungan metode PROMETHEE
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {/* Narasi rekomendasi */}
          {hasilRanking.length > 0 && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-5 py-4">
              <p className="text-sm font-medium text-yellow-800 mb-1">Rekomendasi Utama</p>
              <p className="text-base text-yellow-900">
                Berdasarkan perhitungan metode PROMETHEE, program studi yang paling direkomendasikan
                untuk kamu adalah{" "}
                <span className="font-bold">{hasilRanking[0].nama}</span>
                {/* {hasilRanking[0].universitas_nama && (
                  <span className="font-normal"></span>
                )}{" "} */}
                dengan <em>net flow</em> tertinggi sebesar{" "}
                <span className="font-semibold">{formatFlow(hasilRanking[0].netFlow)}</span>.
              </p>
              {hasilRanking.length > 1 && (
                <p className="text-sm text-yellow-700 mt-2">
                  Alternatif berikutnya:{" "}
                  {hasilRanking.slice(1).map((item, i) => (
                    <span key={item.programStudiId}>
                      {i > 0 && ", "}
                      <span className="font-medium">{item.nama}</span>
                      {/* {item.universitas_nama && (
                        <span className="font-normal opacity-80"> ({item.universitas_nama})</span>
                      )}{" "} */}
                      <span className="text-yellow-600">[{formatFlow(item.netFlow)}]</span>
                    </span>
                  ))}.
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            {hasilRanking.map((item, index) => (
              <div
                key={item.programStudiId}
                className={`p-4 rounded-md flex items-center justify-between ${getRankingColor(
                  index
                )}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 font-bold shrink-0">
                    {index + 1}
                  </div>
                  {altCodeMap[item.programStudiId] && (
                    <span className="font-mono text-xs bg-white/20 px-1.5 py-0.5 rounded shrink-0">
                      {altCodeMap[item.programStudiId]}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug">{item.nama}</p>
                    {item.universitas_nama && (
                      <div className="flex items-center gap-1 mt-0.5 opacity-80">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="text-xs truncate">{item.universitas_nama}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm shrink-0">
                  Skor:{" "}
                  <span className="font-semibold">
                    {formatFlow(item.netFlow)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="h-6 w-6 mr-2 text-primary" />
              <h2 className="text-2xl font-bold">Detail Perhitungan</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalculation(!showCalculation)}
            >
              {showCalculation ? "Sembunyikan" : "Tampilkan"}
            </Button>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Kriteria dan nilai yang digunakan dalam perhitungan
          </p>
        </CardHeader>

        {showCalculation && (
          <CardContent className="p-6">
            <Accordion type="multiple" className="w-full">
              {calculationDetails.map((detail) => (
                <AccordionItem
                  key={detail.programStudiId}
                  value={detail.programStudiId}
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-start flex-wrap gap-2 text-left">
                      {altCodeMap[detail.programStudiId] && (
                        <span className="font-mono text-xs font-bold bg-muted px-1.5 py-0.5 rounded border shrink-0">
                          {altCodeMap[detail.programStudiId]}
                        </span>
                      )}
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-medium leading-snug">{detail.nama}</span>
                        {detail.universitas_nama && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="text-xs">{detail.universitas_nama}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5 ml-auto">
                        <Badge variant="outline" className="text-xs">
                          Net Flow: {formatFlow(detail.netFlow)}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          φ+: {formatFlow(detail.leavingFlow)}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          φ−: {formatFlow(detail.enteringFlow)}
                        </Badge>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kriteria</TableHead>
                            <TableHead>Kode Sub-Kriteria</TableHead>
                            <TableHead className="text-center">Nilai (1–5)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detail.criteria.map((crit, idx) => {
                            const val = crit.value != null ? Math.round(crit.value) : null;
                            const badgeClass =
                              val === 5 ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                              val === 4 ? "bg-green-100 text-green-700 border-green-300" :
                              val === 3 ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                              val === 2 ? "bg-orange-100 text-orange-700 border-orange-300" :
                              "bg-red-100 text-red-700 border-red-300";
                            return (
                              <TableRow key={`${crit.name}-${idx}`}>
                                <TableCell className="font-medium">{crit.name}</TableCell>
                                <TableCell>
                                  <span className="font-mono text-sm">{crit.subName || "-"}</span>
                                </TableCell>
                                <TableCell className="text-center">
                                  {val != null ? (
                                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${badgeClass}`}>
                                      {val}
                                    </span>
                                  ) : "-"}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <h4 className="font-medium text-blue-800 text-sm">Cara Membaca Hasil</h4>
              </div>
              <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
                <li><strong>Nilai (1–5)</strong>: skor sub-kriteria yang dipilih berdasarkan data siswa — makin tinggi makin cocok.</li>
                <li><strong>Net Flow</strong>: skor akhir PROMETHEE. Makin besar = makin direkomendasikan.</li>
                <li><strong>φ+ (leaving flow)</strong>: seberapa kuat program studi ini unggul dibanding pilihan lain.</li>
                <li><strong>φ− (entering flow)</strong>: seberapa kuat program studi lain unggul dibanding yang ini.</li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
