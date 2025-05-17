"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/common/FormField";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  mode: "create" | "edit";
  trigger?: React.ReactNode;
  initialValues?: {
    id?: string;
    programStudiId: string;
    nama_mata_pelajaran: string;
  };
  onCompleted?: () => void;
}

interface FormValues {
  programStudiId: string;
  nama_mata_pelajaran: string;
}

export function CreateOrEditMapelPendukungDialog({
  mode,
  trigger,
  initialValues,
  onCompleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const [programStudiOptions, setProgramStudiOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      programStudiId: "",
      nama_mata_pelajaran: "",
    },
  });

  useEffect(() => {
    const fetchProdi = async () => {
      try {
        const res = await axios.get("/api/program-studi");
        const data = res.data.data || [];
        setProgramStudiOptions(
          data.map((prodi: any) => ({
            value: prodi.id,
            label: prodi.nama_program_studi,
          }))
        );
      } catch (error) {
        toast.error("Gagal mengambil program studi");
      }
    };

    fetchProdi();
  }, []);

  useEffect(() => {
    if (initialValues) {
      reset({
        programStudiId: initialValues.programStudiId,
        nama_mata_pelajaran: initialValues.nama_mata_pelajaran,
      });
    }
  }, [initialValues, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "edit" && initialValues?.id) {
        await axios.put(`/api/mapel-pendukung/${initialValues.id}`, values);
        toast.success("Mata pelajaran berhasil diperbarui");
      } else {
        await axios.post("/api/mapel-pendukung", values);
        toast.success("Mata pelajaran berhasil ditambahkan");
      }

      onCompleted?.();
      setOpen(false);
    } catch (error) {
      console.error("Gagal simpan:", error);
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>Tambah Mapel</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit"
              ? "Edit Mapel Pendukung"
              : "Tambah Mapel Pendukung"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            name="programStudiId"
            type="select"
             label="Program Studi"
            placeholder="Pilih program studi"
            options={programStudiOptions}
          />
          <FormField
            name="nama_mata_pelajaran"
             label="Nama Mata Pelajaran"
            placeholder="Contoh: Biologi"
          />

          <Button type="submit" disabled={isSubmitting}>
            {mode === "edit" ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
