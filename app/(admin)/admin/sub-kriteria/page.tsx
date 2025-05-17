"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Pencil } from "lucide-react";
import { CreateOrEditSubKriteriaDialog } from "@/components/subKriteria/dialog/CreateOrEditSubKriteriaDialog";
import { TableActions } from "@/components/common/TableActions";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface SubKriteria {
  id: string;
  kriteriaId: string;
  nama_sub_kriteria: string;
  bobot_sub_kriteria: number;
  createdAt: string;
  kriteria: {
    nama_kriteria: string;
  };
}

interface KriteriaOption {
  id: string;
  nama_kriteria: string;
}

export default function SubKriteriaPage() {
  const [data, setData] = useState<SubKriteria[]>([]);
  const [kriteriaList, setKriteriaList] = useState<KriteriaOption[]>([]);
  const [selectedKriteria, setSelectedKriteria] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/sub-kriteria");
      setData(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat sub kriteria:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKriteria = async () => {
    try {
      const res = await axios.get("/api/kriteria");
      setKriteriaList(res.data.data || []);
    } catch (err) {
      console.error("Gagal memuat kriteria:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchKriteria();
  }, []);

  const filteredData =
    selectedKriteria === "ALL"
      ? data
      : data.filter((s) => s.kriteriaId === selectedKriteria);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Sub Kriteria"
        description="Daftar seluruh sub kriteria berdasarkan kriteria utama."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Sub Kriteria" },
        ]}
      />

      {/* Dropdown Filter */}
      <div className="max-w-xs">
        <label className="block text-sm font-medium mb-1">
          Filter Kriteria
        </label>
        <Select value={selectedKriteria} onValueChange={setSelectedKriteria}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih Kriteria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Kriteria</SelectItem>
            {kriteriaList.map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.nama_kriteria}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabel Data */}
      {loading ? (
        <p>Memuat data...</p>
      ) : filteredData.length === 0 ? (
        <EmptyState
          title="Belum ada sub kriteria"
          description="Data sub kriteria belum tersedia."
        />
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Sub Kriteria</TableHead>
                <TableHead>Bobot</TableHead>
                <TableHead>Kriteria</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.nama_sub_kriteria}</TableCell>
                  <TableCell>{sub.bobot_sub_kriteria}</TableCell>
                  <TableCell>{sub.kriteria?.nama_kriteria || "-"}</TableCell>
                  <TableCell>
                    {new Date(sub.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={
                        <CreateOrEditSubKriteriaDialog
                          mode="edit"
                          initialValues={{
                            id: sub.id,
                            kriteriaId: sub.kriteriaId,
                            nama_sub_kriteria: sub.nama_sub_kriteria,
                            bobot_sub_kriteria: sub.bobot_sub_kriteria,
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
                          onCompleted={() => {
                            toast.success("Sub kriteria diperbarui");
                            fetchData();
                          }}
                        />
                      }
                      onDelete={{
                        message: `Hapus sub kriteria "${sub.nama_sub_kriteria}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/sub-kriteria/${sub.id}`);
                          toast.success("Sub kriteria berhasil dihapus");
                          setData((prev) =>
                            prev.filter((s) => s.id !== sub.id)
                          );
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
