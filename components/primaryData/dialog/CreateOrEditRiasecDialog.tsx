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
    tipeRiasec: string[]; // Changed to array
  };
  onCompleted?: () => void;
}

interface FormValues {
  programStudiId: string;
  tipeRiasec: string[]; // Changed to array
}

export function CreateOrEditRiasecDialog({
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
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      programStudiId: "",
      tipeRiasec: [], // Initialize as empty array
    },
  });

  useEffect(() => {
    const fetchProgramStudi = async () => {
      try {
        const res = await axios.get("/api/program-studi");
        const data = res.data.data || [];
        setProgramStudiOptions(
          data.map((ps: any) => ({
            value: ps.id,
            label: ps.nama_program_studi,
          }))
        );
      } catch (error) {
        toast.error("Gagal mengambil data program studi");
      }
    };

    if (open) {
      fetchProgramStudi();
    }
  }, [open]);

  useEffect(() => {
    if (initialValues) {
      reset({
        programStudiId: initialValues.programStudiId,
        tipeRiasec: Array.isArray(initialValues.tipeRiasec)
          ? initialValues.tipeRiasec
          : [initialValues.tipeRiasec], // Handle both array and string
      });
    } else {
      reset({
        programStudiId: "",
        tipeRiasec: [],
      });
    }
  }, [initialValues, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "edit" && initialValues?.id) {
        await axios.put(`/api/riasec/${initialValues.id}`, {
          ...values,
          tipeRiasec: values.tipeRiasec.join(","), // Convert array to comma-separated string
        });
        toast.success("Mapping RIASEC berhasil diperbarui");
      } else {
        await axios.post("/api/riasec", {
          ...values,
          tipeRiasec: values.tipeRiasec.join(","), // Convert array to comma-separated string
        });
        toast.success("Mapping RIASEC berhasil ditambahkan");
      }

      onCompleted?.();
      setOpen(false);
    } catch (error: any) {
      console.error("Gagal menyimpan:", error);

      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Terjadi kesalahan saat menyimpan");
      }
    }
  };

  const riasecOptions = [
    { label: "R - Realistic", value: "R" },
    { label: "I - Investigative", value: "I" },
    { label: "A - Artistic", value: "A" },
    { label: "S - Social", value: "S" },
    { label: "E - Enterprising", value: "E" },
    { label: "C - Conventional", value: "C" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="default">
            {mode === "edit" ? "Edit Mapping" : "Tambah Mapping"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Mapping RIASEC" : "Tambah Mapping RIASEC"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <FormField
            name="programStudiId"
            type="select"
             label="Program Studi"
            placeholder="Pilih program studi"
            options={programStudiOptions}
            rules={{ required: "Program studi wajib dipilih" }}
            error={errors.programStudiId?.message}
          />

          <FormField
            name="tipeRiasec"
            type="multiselect" // Changed to multiselect
             label="Tipe RIASEC"
            placeholder="Pilih tipe kepribadian"
            options={riasecOptions}
            rules={{
              required: "Minimal satu tipe RIASEC wajib dipilih",
              validate: (value) =>
                value.length > 0 || "Minimal satu tipe RIASEC wajib dipilih",
            }}
            error={errors.tipeRiasec?.message}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
