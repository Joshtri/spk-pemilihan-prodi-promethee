"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface Penilaian {
  kriteria: {
    id: string;
    nama_kriteria: string;
  };
  subKriteria: {
    nama_sub_kriteria: string;
    bobot_sub_kriteria: number;
  };
}

interface SiswaEvaluasi {
  id: string;
  nama: string;
  penilaian: Penilaian[];
  riasec?: string[]; // <== ini baru
}

export default function EvaluasiSiswaPage() {
  const router = useRouter();
  const [data, setData] = useState<SiswaEvaluasi[]>([]);
  const [kriteriaSet, setKriteriaSet] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get("/api/evaluasi-siswa")
      .then((res) => {
        setData(res.data.data);
        const allKriteria = new Set(
          res.data.data.flatMap((s: SiswaEvaluasi) =>
            s.penilaian.map((p) => p.kriteria.nama_kriteria)
          )
        );
        setKriteriaSet(Array.from(allKriteria));
      })
      .catch((err) => console.error("Gagal memuat evaluasi:", err));
  }, []);

  return (
    <>
      <PageHeader
        title="Evaluasi Kriteria Siswa"
        description="Halaman ini digunakan untuk menampilkan evaluasi kriteria siswa."
        actions={
          <Button
            variant="outline"
            onClick={() => router.push("/admin/evaluasi-siswa/create")}
          >
            Tambah Evaluasi
          </Button>
        }
      />
      <Card className="p-6 mt-6">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>RIASEC</TableHead>

                {kriteriaSet.map((kriteria) => (
                  <TableHead key={kriteria}>{kriteria}</TableHead>
                ))}
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((siswa, index) => (
                <TableRow key={siswa.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{siswa.nama}</TableCell>
                  <TableCell>
                    {siswa.riasec && siswa.riasec.length > 0 ? (
                      siswa.riasec.join(", ")
                    ) : (
                      <span className="text-gray-400 italic">Belum ada</span>
                    )}
                  </TableCell>

                  {kriteriaSet.map((kriteria) => {
                    const nilai = siswa.penilaian.find(
                      (p) => p.kriteria.nama_kriteria === kriteria
                    );
                    return (
                      <TableCell key={kriteria}>
                        {nilai ? (
                          `${nilai.subKriteria.nama_sub_kriteria} (${nilai.subKriteria.bobot_sub_kriteria})`
                        ) : (
                          <span className="text-gray-400 italic">
                            Belum dinilai
                          </span>
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/admin/evaluasi-siswa/tes-minat/create?userId=${siswa.id}`
                        )
                      }
                    >
                      Tambah Tes Minat
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </>
  );
}
