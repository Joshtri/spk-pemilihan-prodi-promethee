"use client";

import { useEffect, useState, useMemo } from "react";
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

  const groupedData = useMemo(() => {
    const groups: Record<string, SubKriteria[]> = {};
    for (const sub of filteredData) {
      const kriteriaId = sub.kriteriaId;
      if (!groups[kriteriaId]) groups[kriteriaId] = [];
      groups[kriteriaId].push(sub);
    }
    return groups;
  }, [filteredData]);

  const sortedGroups = useMemo(() => {
    return Object.entries(groupedData).sort((a, b) => {
      const nameA = a[1][0]?.kriteria?.nama_kriteria || "";
      const nameB = b[1][0]?.kriteria?.nama_kriteria || "";
      return nameA.localeCompare(nameB);
    });
  }, [groupedData]);

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

      {/* Data Grouped by Kriteria */}
      {loading ? (
        <p>Memuat data...</p>
      ) : filteredData.length === 0 ? (
        <EmptyState
          title="Belum ada sub kriteria"
          description="Data sub kriteria belum tersedia."
        />
      ) : (
        <div className="space-y-4">
          {sortedGroups.map(([kriteriaId, subs]) => (
            <div
              key={kriteriaId}
              className="rounded-lg border bg-white dark:bg-zinc-900 overflow-hidden"
            >
              <div className="bg-muted/50 px-4 py-3 border-b">
                <h3 className="text-sm font-semibold text-foreground">
                  {subs[0]?.kriteria?.nama_kriteria || "Tanpa Kriteria"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {subs.length} sub kriteria
                </p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama Sub Kriteria</TableHead>
                    <TableHead className="w-24">Bobot</TableHead>
                    <TableHead className="w-32">Tanggal Dibuat</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((sub, idx) => (
                    <TableRow key={sub.id}>
                      <TableCell className="text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>{sub.nama_sub_kriteria}</TableCell>
                      <TableCell>{sub.bobot_sub_kriteria}</TableCell>
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
                            message: `Apakah Anda yakin ingin menghapus sub kriteria "${sub.nama_sub_kriteria}"?`,
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
          ))}
        </div>
      )}
    </div>
  );
}
