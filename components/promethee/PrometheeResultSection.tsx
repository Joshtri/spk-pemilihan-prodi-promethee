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
import { Calculator, Info, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState } from "react";

interface RankingResult {
  programStudiId: string;
  nama: string;
  netFlow: number | null;
  leavingFlow: number | null;
  enteringFlow: number | null;
}

interface CalculationDetail {
  programStudiId: string;
  nama: string;
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
}

export function PrometheeResultSection({
  hasilRanking,
  calculationDetails,
}: Props) {
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
          <div className="space-y-3">
            {hasilRanking.map((item, index) => (
              <div
                key={item.programStudiId}
                className={`p-4 rounded-md flex items-center justify-between ${getRankingColor(
                  index
                )}`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 mr-3">
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <span className="font-medium">{item.nama}</span>
                </div>
                <div className="text-sm">
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
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-medium">{detail.nama}</span>
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
