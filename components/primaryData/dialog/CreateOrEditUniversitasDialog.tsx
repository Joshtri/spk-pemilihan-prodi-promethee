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
    nama: string;
    lokasi?: string;
    keterangan?: string;
  };
  onCompleted?: () => void;
}

interface FormValues {
  nama: string;
  lokasi?: string;
  keterangan?: string;
}

export function CreateOrEditUniversitasDialog({ mode, trigger, initialValues, onCompleted }: Props) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: { nama: "", lokasi: "", keterangan: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        nama: initialValues?.nama ?? "",
        lokasi: initialValues?.lokasi ?? "",
        keterangan: initialValues?.keterangan ?? "",
      });
    }
  }, [open, initialValues, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "edit" && initialValues?.id) {
        await axios.put(`/api/universitas/${initialValues.id}`, values);
        toast.success("Universitas berhasil diperbarui");
      } else {
        await axios.post("/api/universitas", values);
        toast.success("Universitas berhasil ditambahkan");
      }
      onCompleted?.();
      setOpen(false);
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>{mode === "edit" ? "Edit Universitas" : "Tambah Universitas"}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Universitas" : "Tambah Universitas"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            control={control}
            name="nama"
            label="Nama Universitas"
            placeholder="Contoh: Universitas Nusa Cendana"
            rules={{
              required: "Nama universitas wajib diisi",
              minLength: { value: 3, message: "Minimal 3 karakter" },
            }}
          />

          <FormField
            control={control}
            name="lokasi"
            label="Lokasi (opsional)"
            placeholder="Contoh: Kupang, NTT"
          />

          <FormField
            control={control}
            name="keterangan"
            label="Keterangan (opsional)"
            type="textarea"
            placeholder="Keterangan tambahan"
            rows={3}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
