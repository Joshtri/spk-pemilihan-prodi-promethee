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
import { Form, useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface KriteriaOption {
  value: string;
  label: string;
}

interface CreateOrEditSubKriteriaDialogProps {
  mode: "create" | "edit";
  kriteriaId?: string;
  initialValues?: {
    id?: string;
    kriteriaId: string;
    nama_sub_kriteria: string;
    bobot_sub_kriteria: number;
  };
  trigger?: React.ReactNode;
  onCompleted?: () => void;
}

interface FormValues {
  kriteriaId: string;
  nama_sub_kriteria: string;
  bobot_sub_kriteria: string;
  keterangan: string;
}

export function CreateOrEditSubKriteriaDialog({
  mode,
  kriteriaId,
  initialValues,
  trigger,
  onCompleted,
}: CreateOrEditSubKriteriaDialogProps) {
  const [open, setOpen] = useState(false);
  const [kriteriaOptions, setKriteriaOptions] = useState<KriteriaOption[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      kriteriaId: "",
      nama_sub_kriteria: "",
      bobot_sub_kriteria: "",
    },
  });

  // Fetch daftar kriteria
  useEffect(() => {
    axios.get("/api/kriteria").then((res) => {
      const options =
        res.data?.data?.map((k: any) => ({
          value: k.id,
          label: k.nama_kriteria,
        })) || [];
      setKriteriaOptions(options);
    });
  }, []);

  // Set initial values
  useEffect(() => {
    if (mode === "edit" && initialValues) {
      reset({
        kriteriaId: initialValues.kriteriaId,
        nama_sub_kriteria: initialValues.nama_sub_kriteria,
        bobot_sub_kriteria: initialValues.bobot_sub_kriteria.toString(),
      });
    } else if (kriteriaId) {
      reset((prev) => ({ ...prev, kriteriaId }));
    }
  }, [mode, initialValues, kriteriaId, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        kriteriaId: values.kriteriaId,
        nama_sub_kriteria: values.nama_sub_kriteria,
        bobot_sub_kriteria: parseFloat(values.bobot_sub_kriteria),
      };

      if (mode === "edit" && initialValues?.id) {
        await axios.put(`/api/sub-kriteria/${initialValues.id}`, payload);
        toast.success("Sub Kriteria berhasil diperbarui");
      } else {
        await axios.post("/api/sub-kriteria", payload);
        toast.success("Sub Kriteria berhasil ditambahkan");
      }

      setOpen(false);
      reset();
      onCompleted?.();
    } catch (error) {
      console.error(error);
      toast.error(
        mode === "edit"
          ? "Gagal memperbarui sub kriteria"
          : "Gagal menambahkan sub kriteria"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm">Tambah Sub Kriteria</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Sub Kriteria" : "Tambah Sub Kriteria"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            name="kriteriaId"
            label="Kriteria"
            type="select"
            control={control}
            required
            options={kriteriaOptions}
            rules={{ required: "Kriteria wajib dipilih" }}
            error={errors.kriteriaId?.message}
          />
          <FormField
            name="nama_sub_kriteria"
            label="Nama Sub Kriteria"
            placeholder="Masukkan nama sub kriteria"
            required
            control={control}
            rules={{ required: "Nama sub kriteria wajib diisi" }}
            error={errors.nama_sub_kriteria?.message}
          />
          <FormField
            name="bobot_sub_kriteria"
            type="number"
            control={control}
            label="Bobot Sub Kriteria"
            placeholder="Contoh: 0.3"
            required
            rules={{ required: "Bobot wajib diisi" }}
            error={errors.bobot_sub_kriteria?.message}
          />

          <FormField
            name="keterangan"
            label="Keterangan"
            control={control}
            placeholder="Masukkan keterangan"
            required={false}
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
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
