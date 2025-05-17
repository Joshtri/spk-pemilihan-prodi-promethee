"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";

import FormField from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface UserOption {
  label: string;
  value: string;
}

interface SubKriteriaOption {
  label: string;
  value: string;
}

interface KriteriaWithSub {
  id: string;
  nama_kriteria: string;
  subKriteria: SubKriteriaOption[];
}

export default function TambahEvaluasiPage() {
  const { handleSubmit, control, reset } = useForm();
  const [siswaOptions, setSiswaOptions] = useState<UserOption[]>([]);
  const [kriteriaList, setKriteriaList] = useState<KriteriaWithSub[]>([]);

  useEffect(() => {
    const fetchSiswaAndKriteria = async () => {
      try {
        const [siswaRes, kriteriaRes] = await Promise.all([
          axios.get("/api/users?role=SISWA"),
          axios.get("/api/kriteria-with-sub"),
        ]);

        const siswaData = siswaRes.data.data.map((u: any) => ({
          label: u.name,
          value: u.id,
        }));
        setSiswaOptions(siswaData);
        setKriteriaList(kriteriaRes.data.data);
      } catch (error) {
        toast.error("Gagal memuat data");
        console.error("Gagal memuat data:", error);
      }
    };

    fetchSiswaAndKriteria();
  }, []);

  const onSubmit = (data: any) => {
    const evaluations = Object.entries(data)
      .filter(([key]) => key.startsWith("kriteria_"))
      .map(([key, value]) => {
        const kriteriaId = key.replace("kriteria_", "");
        return { kriteriaId, subKriteriaId: value };
      });

    const payload = {
      userId: data.siswa,
      evaluations,
    };

    axios
      .post("/api/evaluasi-siswa", payload)
      .then(() => {
        toast.success("Evaluasi berhasil disimpan");
        reset();
      })
      .catch((err) => {
        const msg =
          err.response?.data?.error || "Terjadi kesalahan saat menyimpan";
        toast.error(msg);
      });
  };

  return (
    <>
      <PageHeader
        title="Form Input Evaluasi Siswa"
        description="Silakan isi form di bawah ini untuk melakukan penilaian terhadap siswa."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Evaluasi Siswa", href: "/admin/evaluasi-siswa" },
          { label: "Tambah Evaluasi" },
        ]}
      />
      <Card className="p-6 mt-6 max-w-7xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            name="siswa"
            label="Siswa"
            type="select"
            control={control}
            placeholder="Pilih Siswa"
            options={siswaOptions}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kriteriaList.map((kriteria) => (
              <FormField
                key={kriteria.id}
                name={`kriteria_${kriteria.id}`}
                label={kriteria.nama_kriteria}
                type="select"
                control={control}
                placeholder="Pilih Sub Kriteria"
                options={kriteria.subKriteria}
              />
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">Simpan Penilaian</Button>
          </div>
        </form>
      </Card>
    </>
  );
}
