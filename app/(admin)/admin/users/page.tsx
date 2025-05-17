"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { TableActions } from "@/components/common/TableActions";
import { DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateOrEditUserDialog } from "@/components/users/dialog/CreateOrEditUserDialog"; // sesuaikan path
import axios from "axios";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Role = "ADMIN" | "SISWA";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  password? : string;
  role: Role; // ✅ BENAR
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna"
        description="Daftar semua pengguna dalam sistem."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Users" },
        ]}
        actions={
          <CreateOrEditUserDialog
            mode="create"
            onCompleted={() => fetchUsers()}
          />
        }
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : users.length === 0 ? (
        <EmptyState
          title="Tidak ada pengguna"
          description="Belum ada pengguna terdaftar. Tambahkan pengguna baru sekarang."
          actionLabel="Tambah Pengguna"
          action={() => (window.location.href = "/admin/users/create")}
        />
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name || "-"}</TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={
                        <CreateOrEditUserDialog
                          mode="edit"
                          initialValues={{
                            id: user.id,
                            name: user.name || "",
                            email: user.email || "",
                            password: "", // kosongkan, user tidak harus isi ulang saat edit
                            role: user.role,
                          }}
                          trigger={
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </DialogTrigger>
                          }
                          onCompleted={fetchUsers}
                        />
                      }
                      onDelete={{
                        message: `Hapus user "${user.name || user.email}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/users/${user.id}`);
                          toast.success("Pengguna berhasil dihapus");
                          fetchUsers();
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
