"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import axios from "axios";
import FormField from "@/components/common/FormField";
import { useEffect, useState } from "react";

const roleOptions = [
  { value: "ADMIN", label: "ADMIN" },
  { value: "SISWA", label: "SISWA" },
];

interface Props {
  mode: "create" | "edit";
  trigger?: React.ReactNode;
  initialValues?: {
    id?: string;
    name?: string;
    email?: string;
    role: string;
  };
  onCompleted?: () => void;
}

interface FormValues {
  name?: string;
  email: string;
  password?: string;
  role: string;
}

export function CreateOrEditUserDialog({
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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  // Reset form ketika dialog dibuka
  useEffect(() => {
    if (open) {
      reset({
        name: initialValues?.name || "",
        email: initialValues?.email || "",
        password: "",
        role: initialValues?.role || "",
      });
    }
  }, [open, initialValues, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (mode === "edit" && initialValues?.id) {
        await axios.put(`/api/users/${initialValues.id}`, values);
        toast.success("Pengguna berhasil diperbarui");
      } else {
        await axios.post("/api/users", values);
        toast.success("Pengguna berhasil ditambahkan");
      }
      setOpen(false);
      reset();
      onCompleted?.();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan pengguna");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            {mode === "edit" ? "Edit Pengguna" : "Tambah Pengguna"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Pengguna" : "Tambah Pengguna"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <FormField
            name="name"
            label="Nama"
            placeholder="Nama pengguna"
            control={control}
            error={errors.name?.message}
          />
          <FormField
            name="email"
            label="Email"
            placeholder="Email pengguna"
            required
            control={control}
            rules={{ required: "Email wajib diisi" }}
            error={errors.email?.message}
            type="email"
          />
          <FormField
            name="password"
            label="Password"
            placeholder={
              mode === "edit"
                ? "Kosongkan jika tidak ingin diubah"
                : "Buat password"
            }
            type="password"
            control={control}
            rules={
              mode === "create"
                ? { required: "Password wajib diisi" }
                : undefined
            }
            error={errors.password?.message}
          />
          <FormField
            name="role"
            label="Role"
            placeholder="Pilih role"
            required
            type="select"
            options={roleOptions}
            control={control}
            rules={{ required: "Role wajib dipilih" }}
            error={errors.role?.message}
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
