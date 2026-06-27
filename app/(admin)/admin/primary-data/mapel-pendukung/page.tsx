"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Search, X } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { TableActions } from "@/components/common/TableActions";
import { DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateOrEditMapelPendukungDialog } from "@/components/primaryData/dialog/CreateOrEditMapelPendukungDialog";
import { Mapel } from "@/interfaces/Mapel";

export default function MapelPendukungPage() {
  const [data, setData] = useState<Mapel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProdi, setFilterProdi] = useState("all");

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/mapel-pendukung");
      setData(res.data?.data || []);
    } catch {
      toast.error("Gagal mengambil data mata pelajaran pendukung");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Unique program studi list for filter dropdown
  const prodiList = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((item) => map.set(item.programStudi.id, item.programStudi.nama_program_studi));
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  // Apply filters
  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchProdi = filterProdi === "all" || item.programStudi.id === filterProdi;
      const matchSearch =
        !search.trim() ||
        item.nama_mata_pelajaran.toLowerCase().includes(search.toLowerCase()) ||
        item.programStudi.nama_program_studi.toLowerCase().includes(search.toLowerCase());
      return matchProdi && matchSearch;
    });
  }, [data, filterProdi, search]);

  const hasFilter = search.trim() || filterProdi !== "all";

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

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari mata pelajaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={filterProdi} onValueChange={setFilterProdi}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter program studi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Program Studi</SelectItem>
            {prodiList.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilter && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{filtered.length} hasil</Badge>
            <button
              onClick={() => { setSearch(""); setFilterProdi("all"); }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Memuat data...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border bg-white dark:bg-zinc-900 py-16 text-center">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Tidak ada data yang cocok</p>
          <p className="text-sm text-muted-foreground mt-1">Coba ubah filter atau kata kunci pencarian</p>
        </div>
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Program Studi</TableHead>
                <TableHead>Mata Pelajaran</TableHead>
                <TableHead className="w-20">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, idx) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
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
                        message: `Apakah Anda yakin ingin menghapus mata pelajaran "${item.nama_mata_pelajaran}" dari program studi "${item.programStudi.nama_program_studi}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/mapel-pendukung/${item.id}`);
                          toast.success("Mata pelajaran berhasil dihapus");
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
