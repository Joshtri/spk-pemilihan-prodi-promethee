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
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{detail.nama}</span>
                      <Badge variant="outline">
                        Net Flow: {formatFlow(detail.netFlow)}
                      </Badge>
                      <Badge variant="outline">
                        Leaving: {formatFlow(detail.leavingFlow)}
                      </Badge>
                      <Badge variant="outline">
                        Entering: {formatFlow(detail.enteringFlow)}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Kriteria:</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kriteria</TableHead>
                            <TableHead>Subkriteria</TableHead>
                            <TableHead>Bobot Sub</TableHead>
                            <TableHead>Bobot Kriteria</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detail.criteria.map((crit, idx) => (
                            <TableRow key={`${crit.name}-${idx}`}>
                              <TableCell className="font-medium">
                                {crit.name}
                              </TableCell>
                              <TableCell>{crit.subName || "-"}</TableCell>
                              <TableCell>{formatFlow(crit.value)}</TableCell>
                              <TableCell>{formatFlow(crit.weight)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800">
                    Penjelasan Metode PROMETHEE
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Metode PROMETHEE menghitung preferensi berdasarkan kriteria
                    yang ditentukan. Net Flow dihitung dari selisih Leaving Flow
                    (preferensi terhadap alternatif lain) dan Entering Flow
                    (preferensi dari alternatif lain).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}
