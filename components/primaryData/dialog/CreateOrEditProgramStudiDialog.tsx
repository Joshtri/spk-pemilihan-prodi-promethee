"use client";

import FormField from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface Props {
  mode: "create" | "edit";
  trigger?: React.ReactNode;
  initialValues?: {
    id?: string;
    nama_program_studi: string;
    biaya_kuliah: number;
    akreditasi: string;
    keterangan?: string;
    rumpunIlmuId?: string;
  };
  onCompleted?: () => void;
}

interface FormValues {
  nama_program_studi: string;
  biaya_kuliah: number;
  akreditasi: string;
  keterangan?: string;
  rumpunIlmuId?: string;
}

interface RumpunIlmuOption {
  value: string;
  label: string;
}

export function CreateOrEditProgramStudiDialog({
  mode,
  trigger,
  initialValues,
  onCompleted,
}: Props) {
  const [open, setOpen] = useState(false);
  const [rumpunIlmuOptions, setRumpunIlmuOptions] = useState<
    RumpunIlmuOption[]
  >([]);
  const [isLoadingRumpunIlmu, setIsLoadingRumpunIlmu] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      nama_program_studi: "",
      biaya_kuliah: 0,
      akreditasi: "",
      keterangan: "",
      rumpunIlmuId: "",
    },
  });

  // Fetch rumpun ilmu options when dialog opens
  useEffect(() => {
    const fetchRumpunIlmu = async () => {
      if (!open) return;

      try {
        setIsLoadingRumpunIlmu(true);
        const res = await axios.get("/api/rumpun-ilmu");
        const rumpunOptions = res.data.data.map((item: any) => ({
          value: item.id,
          label: item.nama,
        }));
        
        setRumpunIlmuOptions(rumpunOptions);
      } catch (error) {
        console.error("Failed to fetch rumpun ilmu:", error);
        toast.error("Gagal memuat data rumpun ilmu");
      } finally {
        setIsLoadingRumpunIlmu(false);
      }
    };

    fetchRumpunIlmu();
  }, [open]);

  // Reset form with initial values
  useEffect(() => {
    if (initialValues) {
      reset({
        nama_program_studi: initialValues.nama_program_studi,
        biaya_kuliah: initialValues.biaya_kuliah,
        akreditasi: initialValues.akreditasi,
        keterangan: initialValues.keterangan ?? "",
        rumpunIlmuId: initialValues.rumpunIlmuId ?? "",
      });
    } else {
      reset({
        nama_program_studi: "",
        biaya_kuliah: 0,
        akreditasi: "",
        keterangan: "",
        rumpunIlmuId: "",
      });
    }
  }, [initialValues, reset, open]);

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("Submitting values:", values);

      // Prepare the payload
      const payload = {
        ...values,
        biaya_kuliah: Math.round(Number(values.biaya_kuliah)), // Ensure integer
        rumpunIlmuId: values.rumpunIlmuId || null, // Convert empty string to null
      };

      if (mode === "edit" && initialValues?.id) {
        const response = await axios.put(
          `/api/program-studi/${initialValues.id}`,
          payload
        );
        console.log("Update response:", response.data);
        toast.success("Program studi berhasil diperbarui");
      } else {
        const response = await axios.post("/api/program-studi", payload);
        console.log("Create response:", response.data);
        toast.success("Program studi berhasil ditambahkan");
      }

      onCompleted?.();
      setOpen(false);
    } catch (error) {
      console.error("Error saving program studi:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server response:", error.response.data);

        let errorMessage = "Terjadi kesalahan saat menyimpan";
        if (error.response.status === 400) {
          errorMessage = error.response.data.error || "Data tidak valid";
        } else if (error.response.status === 409) {
          errorMessage = "Nama program studi sudah digunakan";
        }

        toast.error(errorMessage);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button>
            {mode === "edit" ? "Edit Program Studi" : "Tambah Program Studi"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Program Studi" : "Tambah Program Studi"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            name="nama_program_studi"
             label="Nama Program Studi"
            placeholder="Contoh: Ilmu Komputer"
            rules={{
              required: "Nama program studi wajib diisi",
              minLength: {
                value: 3,
                message: "Nama program studi minimal 3 karakter",
              },
            }}
          />

          <FormField
            name="biaya_kuliah"
             label="Biaya Kuliah (per semester)"
            type="currency"
            placeholder="Contoh: 15.000.000"
            rules={{
              required: "Biaya kuliah wajib diisi",
              min: {
                value: 0,
                message: "Biaya tidak boleh negatif",
              },
              validate: (value) =>
                Number(value) >= 1000000 || "Biaya kuliah minimal Rp 1.000.000",
            }}
          />

          <FormField
            name="akreditasi"
             label="Akreditasi"
            type="select"
            placeholder="Pilih akreditasi"
            options={[
              { label: "Unggul / A", value: "A" },
              { label: "Baik Sekali / B", value: "B" },
              { label: "Baik / C", value: "C" },
              { label: "Tidak Terakreditasi", value: "Tidak Terakreditasi" },
            ]}
            rules={{ required: "Akreditasi wajib dipilih" }}
          />

          <FormField
            name="rumpunIlmuId"
            label="Rumpun Ilmu"
            type="select"
            placeholder={
              isLoadingRumpunIlmu
                ? "Memuat data rumpun ilmu..."
                : "Pilih rumpun ilmu"
            }
            options={rumpunIlmuOptions}
            disabled={isLoadingRumpunIlmu}
            rules={{ required: "Rumpun ilmu wajib dipilih" }}
          />

          <FormField
            name="keterangan"
             label="Keterangan (opsional)"
            placeholder="Keterangan tambahan"
            type="textarea"
            rows={3}
            rules={{
              maxLength: {
                value: 500,
                message: "Keterangan maksimal 500 karakter",
              },
            }}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingRumpunIlmu}
            >
              {isSubmitting
                ? "Menyimpan..."
                : mode === "edit"
                ? "Simpan Perubahan"
                : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
