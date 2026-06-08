"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Hasil {
  id: string;
  programStudi: {
    nama_program_studi: string;
  };
  kriteria: {
    nama_kriteria: string;
    bobot_kriteria: number;
  };
  subKriteria: {
    nama_sub_kriteria: string;
    bobot_sub_kriteria: number;
  };
  nilai: number;
  createdAt: string;
}

export default function HasilRankPage() {
  const [hasil, setHasil] = useState<Hasil[]>([]);

  useEffect(() => {
    const fetchHasil = async () => {
      try {
        const res = await axios.get("/api/promethee/history");
        setHasil(res.data.data);
      } catch (err) {
        toast.error("Gagal memuat hasil perhitungan");
      }
    };

    fetchHasil();
  }, []);

  const grouped = hasil.reduce<Record<string, Hasil[]>>((acc, entry) => {
    const key = entry.programStudi.nama_program_studi;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const groupedByDate = hasil.reduce<Record<string, Hasil[]>>((acc, entry) => {
    const date = format(new Date(entry.createdAt), "dd MMMM yyyy", {
      locale: idLocale,
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">
        Riwayat Hasil Perhitungan PROMETHEE
      </h1>

      <Accordion type="multiple" className="w-full">
        {Object.entries(groupedByDate).map(([date, entries]) => {
          const groupedByProdi = entries.reduce<Record<string, Hasil[]>>(
            (acc, e) => {
              const psName = e.programStudi.nama_program_studi;
              if (!acc[psName]) acc[psName] = [];
              acc[psName].push(e);
              return acc;
            },
            {}
          );

          return (
            <AccordionItem value={date} key={date}>
              <AccordionTrigger>
                <h2 className="text-base font-medium">
                  Tanggal: {date} ({entries.length} entri)
                </h2>
              </AccordionTrigger>
              <AccordionContent>
                {Object.entries(groupedByProdi).map(([programName, items]) => (
                  <Card key={programName} className="mb-6">
                    <CardHeader>
                      <h3 className="text-xl font-semibold">{programName}</h3>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kriteria</TableHead>
                            <TableHead>Kode Sub-Kriteria</TableHead>
                            <TableHead className="text-center">Nilai (1–5)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((entry) => {
                            const val = entry.nilai;
                            const badgeClass =
                              val === 5 ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                              val === 4 ? "bg-green-100 text-green-700 border-green-300" :
                              val === 3 ? "bg-yellow-100 text-yellow-700 border-yellow-300" :
                              val === 2 ? "bg-orange-100 text-orange-700 border-orange-300" :
                              "bg-red-100 text-red-700 border-red-300";
                            return (
                              <TableRow key={entry.id}>
                                <TableCell className="font-medium">
                                  {entry.kriteria.nama_kriteria}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {entry.subKriteria.nama_sub_kriteria}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${badgeClass}`}>
                                    {val}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
