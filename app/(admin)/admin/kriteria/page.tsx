"use client";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { TableActions } from "@/components/common/TableActions";
import { CreateOrEditKriteriaDialog } from "@/components/kriteria/dialog/CreateOrEditKriteriaDialog";
import { CreateOrEditSubKriteriaDialog } from "@/components/subKriteria/dialog/CreateOrEditSubKriteriaDialog";
import { ViewSubKriteriaDialog } from "@/components/subKriteria/dialog/ViewSubKriteriaDialog";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import axios from "axios";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Kriteria {
  id: string;
  nama_kriteria: string;
  bobot_kriteria: number;
  keterangan?: string | null;
}

export default function KriteriaPage() {
  const [data, setData] = useState<Kriteria[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchKriteria = async () => {
    try {
      const res = await axios.get("/api/kriteria");
      setData(res.data.data || []);
    } catch (error) {
      console.error("Gagal memuat data kriteria:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKriteria();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Kriteria"
        description="Daftar seluruh kriteria yang digunakan dalam penilaian."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Kriteria" },
        ]}
        actions={
          <CreateOrEditKriteriaDialog
            mode="create"
            onCompleted={fetchKriteria}
          />
        }
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : data && data.length === 0 ? (
        <EmptyState
          title="Belum ada kriteria"
          description="Silakan tambahkan kriteria baru untuk memulai."
          actionLabel="Tambah Kriteria"
          action={() => (window.location.href = "/admin/kriteria/create")}
        />
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kriteria</TableHead>
                <TableHead>Bobot Kriteria</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((krt) => (
                <TableRow key={krt.id}>
                  <TableCell>{krt.nama_kriteria}</TableCell>
                  <TableCell>{krt.bobot_kriteria}</TableCell>
                  <TableCell>{krt.keterangan || "-"}</TableCell>
                  <TableCell>
                    <CreateOrEditSubKriteriaDialog
                      mode="create"
                      kriteriaId={krt.id}
                      onCompleted={fetchKriteria}
                    />{" "} 
                    <ViewSubKriteriaDialog kriteriaId={krt.id} />
                    <TableActions
                      // onView={() => console.log("View", krt.id)}
                      onEdit={
                        <CreateOrEditKriteriaDialog
                          mode="edit"
                          initialValues={{
                            id: krt.id,
                            nama_kriteria: krt.nama_kriteria,
                            bobot_kriteria: krt.bobot_kriteria,
                            keterangan: krt.keterangan ?? "",
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
                          onCompleted={fetchKriteria}
                        />
                      }
                      onDelete={{
                        message: `Hapus kriteria "${krt.nama_kriteria}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/kriteria/${krt.id}`);
                          toast.success("Kriteria berhasil dihapus");
                          fetchKriteria();
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
