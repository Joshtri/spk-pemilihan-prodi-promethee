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
import { CreateOrEditUniversitasDialog } from "@/components/primaryData/dialog/CreateOrEditUniversitasDialog";

interface Universitas {
  id: string;
  nama: string;
  lokasi?: string;
  keterangan?: string;
  createdAt: string;
}

export default function UniversitasPage() {
  const [data, setData] = useState<Universitas[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/universitas");
      setData(res.data?.data || []);
    } catch {
      toast.error("Gagal memuat data universitas");
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
        title="Universitas"
        description="Kelola daftar universitas yang tersedia dalam sistem."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Primary Data" },
          { label: "Universitas" },
        ]}
        actions={<CreateOrEditUniversitasDialog mode="create" onCompleted={fetchData} />}
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : data.length === 0 ? (
        <EmptyState
          title="Belum ada data universitas"
          description="Tambahkan universitas sekarang."
          actionLabel="Tambah Universitas"
          action={() => {}}
        />
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Universitas</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell>{item.lokasi || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.keterangan || "-"}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={
                        <CreateOrEditUniversitasDialog
                          mode="edit"
                          initialValues={item}
                          trigger={
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </DialogTrigger>
                          }
                          onCompleted={fetchData}
                        />
                      }
                      onDelete={{
                        message: `Apakah Anda yakin ingin menghapus universitas "${item.nama}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/universitas/${item.id}`);
                          toast.success("Universitas berhasil dihapus");
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
