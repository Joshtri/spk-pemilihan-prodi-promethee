"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
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
import { CreateOrEditProgramStudiDialog } from "@/components/primaryData/dialog/CreateOrEditProgramStudiDialog"; // ⛳ ganti sesuai strukturmu

interface ProgramStudi {
  id: string;
  nama_program_studi: string;
  biaya_kuliah: number;
  akreditasi: string;
  createdAt: string;
}

export default function ProgramStudiPage() {
  const [data, setData] = useState<ProgramStudi[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/program-studi");
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Gagal ambil data program studi:", err);
      toast.error("Gagal memuat data program studi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Studi"
        description="Daftar semua program studi dalam sistem."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Primary Data" },
          { label: "Program Studi" },
        ]}
        actions={
          <CreateOrEditProgramStudiDialog
            mode="create"
            onCompleted={fetchData}
          />
        }
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : data.length === 0 ? (
        <EmptyState
          title="Tidak ada program studi"
          description="Belum ada data program studi. Tambahkan sekarang."
          actionLabel="Tambah Program Studi"
          action={() => {}}
        />
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Program Studi</TableHead>
                <TableHead>Biaya Kuliah</TableHead>
                <TableHead>Akreditasi</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((prodi) => (
                <TableRow key={prodi.id}>
                  <TableCell>{prodi.nama_program_studi}</TableCell>
                  <TableCell>
                    Rp {prodi.biaya_kuliah.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>{prodi.akreditasi}</TableCell>
                  <TableCell>
                    {new Date(prodi.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={
                        <CreateOrEditProgramStudiDialog
                          mode="edit"
                          initialValues={prodi}
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
                          onCompleted={fetchData}
                        />
                      }
                      onDelete={{
                        message: `Hapus program studi "${prodi.nama_program_studi}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/program-studi/${prodi.id}`);
                          toast.success("Data berhasil dihapus");
                          fetchData();
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
