"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormField from "@/components/common/FormField";
import { PageHeader } from "@/components/common/PageHeader";
import axios from "axios";

const options = [
  { label: "R", value: "R" },
  { label: "I", value: "I" },
  { label: "A", value: "A" },
  { label: "S", value: "S" },
  { label: "E", value: "E" },
  { label: "C", value: "C" },
];

export default function TesMinatForm() {
  const { control, handleSubmit, setValue } = useForm();
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("userId");

  const [isLoading, setIsLoading] = useState(true);

  // Ambil data RIASEC lama (jika ada)
  useEffect(() => {
    if (!userId) return;

    axios.get(`/api/tes-minat?userId=${userId}`).then((res) => {
      const existing = res.data?.data ?? [];

      // Ambil semua tipe, split jika perlu
      const riasecTipeArray = existing
        .flatMap((t: any) => t.tipe.split(",")) // ⬅️ ini penting
        .filter((x: string) => !!x); // buang string kosong

      setValue("tipe", riasecTipeArray);
      setIsLoading(false);
    });
  }, [userId, setValue]);

  const onSubmit = async (data: any) => {
    const payload = {
      userId,
      tipe: data.tipe.join(","), // convert jadi string "R,I,A"
    };

    await axios.post("/api/tes-minat", payload);
    router.push("/admin/evaluasi-siswa");
  };

  return (
    <>
      <PageHeader
        title="Tambah Tes Minat"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Evaluasi", href: "/admin/evaluasi-siswa" },
          { label: "Tambah Tes Minat" },
        ]}
      />
      <Card className="p-6 mt-6 max-w-xl mx-auto">
        {isLoading ? (
          <p className="text-center text-gray-500 italic">Memuat data...</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="tipe"
              label="Tipe RIASEC"
              type="multiselect"
              options={options}
              placeholder="Contoh: R, I, A"
              control={control}
            />
            <div className="flex justify-end">
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        )}
      </Card>
    </>
  );
}
