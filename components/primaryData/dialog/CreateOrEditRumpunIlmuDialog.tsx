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
  };
  onCompleted?: () => void;
}

interface FormValues {
  nama: string;
}

export function CreateOrEditRumpunIlmuDialog({
  mode,
  trigger,
  initialValues,
  onCompleted,
}: Props) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      nama: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({ nama: initialValues.nama });
    }
  }, [initialValues, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "edit" && initialValues?.id) {
        await axios.put(`/api/rumpun-ilmu/${initialValues.id}`, values);
        toast.success("Rumpun ilmu berhasil diperbarui");
      } else {
        await axios.post("/api/rumpun-ilmu", values);
        toast.success("Rumpun ilmu berhasil ditambahkan");
      }

      onCompleted?.();
      setOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan:", error);
      toast.error("Terjadi kesalahan saat menyimpan");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>Tambah Rumpun Ilmu</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Rumpun Ilmu" : "Tambah Rumpun Ilmu"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            type="text"
            name="nama"
            label="Nama Rumpun Ilmu"
            placeholder="Contoh: Ilmu Alam, Humaniora, Ilmu Sosial"
          />

          <Button type="submit" disabled={isSubmitting}>
            {mode === "edit" ? "Simpan Perubahan" : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
