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
import { CreateOrEditMapelPendukungDialog } from "@/components/primaryData/dialog/CreateOrEditMapelPendukungDialog"; // pastikan path ini sesuai
import { Mapel } from "@/interfaces/Mapel";



export default function MapelPendukungPage() {
  const [data, setData] = useState<Mapel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/mapel-pendukung");
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      toast.error("Gagal mengambil data mata pelajaran pendukung");
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
        title="Mata Pelajaran Pendukung"
        description="Mapping mata pelajaran ke program studi."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Primary Data" },
          { label: "Mapel Pendukung" },
        ]}
        actions={
          <CreateOrEditMapelPendukungDialog
            mode="create"
            onCompleted={fetchData}
          />
        }
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : data.length === 0 ? (
        <EmptyState
          title="Belum ada data mata pelajaran"
          description="Tambahkan mata pelajaran pendukung ke program studi."
          actionLabel="Tambah Mapel"
          action={() => {}}
        />
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Studi</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.programStudi.nama_program_studi}</TableCell>
                  <TableCell>{item.nama_mata_pelajaran}</TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={
                        <CreateOrEditMapelPendukungDialog
                          mode="edit"
                          initialValues={{
                            id: item.id,
                            programStudiId: item.programStudiId,
                            nama_mata_pelajaran: item.nama_mata_pelajaran,
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
                          onCompleted={fetchData}
                        />
                      }
                      onDelete={{
                        message: `Hapus mapel "${item.nama_mata_pelajaran}" dari prodi "${item.programStudi.nama_program_studi}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/mapel-pendukung/${item.id}`);
                          toast.success("Mapel berhasil dihapus");
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
