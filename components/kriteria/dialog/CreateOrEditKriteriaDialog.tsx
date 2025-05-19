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
import axios from "axios";
import { useEffect, useState } from "react";

type Mode = "create" | "edit";

interface FormValues {
  nama_kriteria: string;
  bobot_kriteria: number;
  keterangan?: string;
}

interface Props {
  mode?: Mode;
  trigger?: React.ReactNode;
  initialValues?: Partial<FormValues> & { id?: string };
  onCompleted?: () => void;
}

export function CreateOrEditKriteriaDialog({
  mode = "create",
  trigger = <Button>Tambah Kriteria</Button>,
  initialValues,
  onCompleted,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      nama_kriteria: "",
      bobot_kriteria: 0,
      keterangan: "",
    },
  });

  useEffect(() => {
    if (open && mode === "edit" && initialValues) {
      reset({
        nama_kriteria: initialValues.nama_kriteria ?? "",
        bobot_kriteria: initialValues.bobot_kriteria ?? 0,
        keterangan: initialValues.keterangan ?? "",
      });
    }
  }, [open, mode, initialValues, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...values,
      bobot_kriteria: parseFloat(String(values.bobot_kriteria)),
    };

    try {
      if (mode === "create") {
        await axios.post("/api/kriteria", payload);
        toast.success("Kriteria berhasil ditambahkan!");
      } else {
        await axios.put(`/api/kriteria/${initialValues?.id}`, payload);
        toast.success("Kriteria berhasil diperbarui!");
      }

      setOpen(false);
      reset();
      onCompleted?.();
    } catch (err) {
      console.error(err);
      toast.error(
        mode === "create"
          ? "Gagal menambahkan kriteria."
          : "Gagal memperbarui kriteria."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Tambah Kriteria" : "Edit Kriteria"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormField
            name="nama_kriteria"
            label="Nama Kriteria"
            placeholder="Masukkan nama kriteria"
            required
            control={control }
            rules={{ required: "Wajib diisi" }}
            error={errors.nama_kriteria?.message}
          />

          <FormField
            name="bobot_kriteria"
            label="Bobot Kriteria"
            placeholder="Contoh: 0.2"
            required
            type="number"
            control={control}
            rules={{
              required: "Bobot wajib diisi",
              min: { value: 0, message: "Tidak boleh negatif" },
            }}
            error={errors.bobot_kriteria?.message}
          />

          <FormField
            name="keterangan"
            type="textarea"
            label="Keterangan"
            placeholder="Opsional"
            control={control }
            error={errors.keterangan?.message}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {mode === "create" ? "Simpan" : "Perbarui"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
