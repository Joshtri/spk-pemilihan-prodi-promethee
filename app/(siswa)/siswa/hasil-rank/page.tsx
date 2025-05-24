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
                            <TableHead>Subkriteria</TableHead>
                            <TableHead>Bobot Kriteria</TableHead>
                            <TableHead>Bobot Sub</TableHead>
                            <TableHead>Nilai</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>
                                {entry.kriteria.nama_kriteria}
                              </TableCell>
                              <TableCell>
                                {entry.subKriteria.nama_sub_kriteria}
                              </TableCell>
                              <TableCell>
                                {entry.kriteria.bobot_kriteria}
                              </TableCell>
                              <TableCell>
                                {entry.subKriteria.bobot_sub_kriteria}
                              </TableCell>
                              <TableCell>{entry.nilai}</TableCell>
                            </TableRow>
                          ))}
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
