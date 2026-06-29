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
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { Clock, Lock, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Kriteria {
  id: string;
  nama_kriteria: string;
  bobot_kriteria: number;
  keterangan?: string | null;
  createdAt: string;
}

function isWithin24h(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
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
                <TableHead>Bobot</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((krt) => {
                const canDelete = isWithin24h(krt.createdAt);
                const locked = !isWithin24h(krt.createdAt);
                return (
                <TableRow key={krt.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 flex-wrap">
                      {krt.nama_kriteria}
                      {canDelete && (
                        <Badge className="text-xs bg-green-100 text-green-700 border border-green-200 hover:bg-green-100">
                          <Clock className="mr-1 h-3 w-3" />
                          Dapat dihapus
                        </Badge>
                      )}
                      {locked && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          <Lock className="mr-1 h-3 w-3" />
                          Terkunci
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{krt.bobot_kriteria}</TableCell>
                  <TableCell>{krt.keterangan || "-"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(krt.createdAt), { addSuffix: true, locale: idLocale })}
                  </TableCell>
                  <TableCell>
                    <CreateOrEditSubKriteriaDialog
                      mode="create"
                      kriteriaId={krt.id}
                      onCompleted={fetchKriteria}
                    />{" "}
                    <ViewSubKriteriaDialog kriteriaId={krt.id} />
                    <TableActions
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
                        message: locked
                          ? `Kriteria "${krt.nama_kriteria}" sudah lebih dari 24 jam dan tidak dapat dihapus.`
                          : `Apakah Anda yakin ingin menghapus kriteria "${krt.nama_kriteria}"? Pastikan tidak ada sub kriteria yang masih terhubung.`,
                        onConfirm: async () => {
                          await axios.delete(`/api/kriteria/${krt.id}`);
                          toast.success("Kriteria berhasil dihapus");
                          fetchKriteria();
                        },
                      }}
                    />
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
