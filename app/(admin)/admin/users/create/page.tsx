  "use client";

  import { useForm } from "react-hook-form";
  import { useRouter } from "next/navigation";
  import axios from "axios";
  import { toast } from "sonner";

  import { PageHeader } from "@/components/common/PageHeader";
  import FormField from "@/components/common/FormField";
  import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
  } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";

  // enum role harus disesuaikan dengan database kamu
  const roleOptions = [
    { value: "ADMIN", label: "ADMIN" },
    { value: "SISWA", label: "SISWA" },
  //   { value: "tutor", label: "Tutor" },
  ];

  interface FormValues {
    name?: string;
    email: string;
    password: string;
    roles: string[];
  }

  export default function CreateUserPage() {
    const router = useRouter();

    const {
      control,
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<FormValues>({
      defaultValues: {
        name: "",
        email: "",
        password: "",
        roles: [],
      },
    });

    const onSubmit = async (values: FormValues) => {
      try {
        await axios.post("/api/users", values);
        toast.success("Pengguna berhasil ditambahkan");
        router.push("/admin/users");
      } catch (err) {
        console.error(err);
        toast.error("Gagal menambahkan pengguna");
      }
    };

    return (
      <div className="space-y-6">
        <PageHeader
          title="Tambah Pengguna"
          breadcrumbs={[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Users", href: "/admin/users" },
            { label: "Tambah" },
          ]}
        />

        <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto">
          <Card>
            <CardHeader />
            <CardContent className="space-y-4">
              <FormField
                name="name"
                label="Nama"
                placeholder="Nama pengguna"
                // control={control}
                error={errors.name?.message}
              />
              <FormField
                name="email"
                label="Email"
                placeholder="Email pengguna"
                required
                // control={control}
                rules={{ required: "Email wajib diisi" }}
                error={errors.email?.message}
                type="email"
              />
              <FormField
                name="password"
                label="Password"
                placeholder="Buat password"
                required
                type="password"
                // control={control}
                rules={{ required: "Password wajib diisi" }}
                error={errors.password?.message}
              />
              <FormField
                name="roles"
                label="Role"
                placeholder="Pilih role"
                required
                type="select"
                options={roleOptions}
                // control={control}
                rules={{ required: "Role wajib dipilih" }}
                error={errors.roles?.message as string}
              />
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/admin/users")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                Simpan
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    );
  }
