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
import { CreateOrEditRumpunIlmuDialog } from "@/components/primaryData/dialog/CreateOrEditRumpunIlmuDialog";

interface RumpunIlmu {
  id: string;
  nama: string;
  createdAt: string;
}

export default function RumpunIlmuPage() {
  const [data, setData] = useState<RumpunIlmu[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/rumpun-ilmu");
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      toast.error("Gagal mengambil data rumpun ilmu");
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
        title="Rumpun Ilmu"
        description="Kelola daftar rumpun ilmu seperti Humaniora, Ilmu Alam, Ilmu Sosial, dll."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Primary Data" },
          { label: "Rumpun Ilmu" },
        ]}
        actions={
          <CreateOrEditRumpunIlmuDialog mode="create" onCompleted={fetchData} />
        }
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : data.length === 0 ? (
        <EmptyState
          title="Belum ada data rumpun ilmu"
          description="Tambahkan rumpun ilmu sekarang."
          actionLabel="Tambah Rumpun Ilmu"
          action={() => {}}
        />
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>
                    {new Date(item.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={
                        <CreateOrEditRumpunIlmuDialog
                          mode="edit"
                          initialValues={item}
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
                        message: `Hapus rumpun "${item.nama}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/rumpun-ilmu/${item.id}`);
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
