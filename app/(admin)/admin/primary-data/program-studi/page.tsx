"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Pencil, Search, X, Trash2, AlertTriangle, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { TableActions } from "@/components/common/TableActions";
import { DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateOrEditProgramStudiDialog } from "@/components/primaryData/dialog/CreateOrEditProgramStudiDialog";

interface ProgramStudi {
  id: string;
  nama_program_studi: string;
  biaya_kuliah: number;
  akreditasi: string;
  createdAt: string;
  universitasId?: string;
  universitas?: { id: string; nama: string } | null;
}

type DeleteFlow =
  | { step: "idle" }
  | { step: "confirm"; prodi: ProgramStudi }
  | { step: "history"; prodi: ProgramStudi; count: number };

const AKREDITASI_OPTIONS = ["A", "B", "C", "Tidak Terakreditasi"];

export default function ProgramStudiPage() {
  const [data, setData] = useState<ProgramStudi[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterUniversitas, setFilterUniversitas] = useState("semua");
  const [filterAkreditasi, setFilterAkreditasi] = useState("semua");

  const [deleteFlow, setDeleteFlow] = useState<DeleteFlow>({ step: "idle" });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/program-studi");
      setData(res.data?.data || []);
    } catch {
      toast.error("Gagal memuat data program studi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const universitasOptions = useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((p) => {
      if (p.universitas) map.set(p.universitas.id, p.universitas.nama);
    });
    return [
      { value: "semua", label: "Semua Universitas" },
      ...Array.from(map.entries())
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([id, nama]) => ({ value: id, label: nama })),
    ];
  }, [data]);

  const akreditasiOptions = [
    { value: "semua", label: "Semua Akreditasi" },
    ...AKREDITASI_OPTIONS.map((o) => ({ value: o, label: o })),
  ];

  const filtered = useMemo(() => {
    return data.filter((p) => {
      const matchSearch = p.nama_program_studi
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchUniv =
        filterUniversitas === "semua" || p.universitas?.id === filterUniversitas;
      const matchAkreditasi =
        filterAkreditasi === "semua" || p.akreditasi === filterAkreditasi;
      return matchSearch && matchUniv && matchAkreditasi;
    });
  }, [data, search, filterUniversitas, filterAkreditasi]);

  const hasActiveFilter =
    search !== "" || filterUniversitas !== "semua" || filterAkreditasi !== "semua";

  const resetFilters = () => {
    setSearch("");
    setFilterUniversitas("semua");
    setFilterAkreditasi("semua");
  };

  const handleDeleteClick = (prodi: ProgramStudi) => {
    setDeleteFlow({ step: "confirm", prodi });
  };

  const closeDeleteDialog = () => {
    if (!deleteLoading) setDeleteFlow({ step: "idle" });
  };

  // Step 1: Initial delete attempt — API checks for history
  const handleDeleteConfirm = async () => {
    if (deleteFlow.step !== "confirm") return;
    const prodi = deleteFlow.prodi;

    setDeleteLoading(true);
    try {
      await axios.delete(`/api/program-studi/${prodi.id}`);
      toast.success("Program studi berhasil dihapus");
      setDeleteFlow({ step: "idle" });
      fetchData();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const data = error.response.data;
        if (data?.hasHistory) {
          // Transition to history-warning step
          setDeleteFlow({ step: "history", prodi, count: data.count });
          return;
        }
      }
      const msg =
        axios.isAxiosError(error)
          ? error.response?.data?.message || error.response?.data?.error || "Gagal menghapus program studi"
          : "Gagal menghapus program studi";
      toast.error(msg);
      setDeleteFlow({ step: "idle" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Step 2: Force delete after user acknowledges history warning
  const handleForceDelete = async () => {
    if (deleteFlow.step !== "history") return;
    const prodi = deleteFlow.prodi;

    setDeleteLoading(true);
    try {
      await axios.delete(`/api/program-studi/${prodi.id}?force=true`);
      toast.success("Program studi berhasil dihapus. Riwayat rekomendasi tetap tersimpan.");
      setDeleteFlow({ step: "idle" });
      fetchData();
    } catch (error) {
      const msg =
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Gagal menghapus program studi"
          : "Gagal menghapus program studi";
      toast.error(msg);
      setDeleteFlow({ step: "idle" });
    } finally {
      setDeleteLoading(false);
    }
  };

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
          <CreateOrEditProgramStudiDialog mode="create" onCompleted={fetchData} />
        }
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <>
          {/* Search & Filter Bar */}
          {data.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama program studi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Combobox
                options={universitasOptions}
                value={filterUniversitas}
                onValueChange={setFilterUniversitas}
                placeholder="Semua Universitas"
                searchPlaceholder="Cari universitas..."
                emptyText="Universitas tidak ditemukan."
                className="w-full sm:w-52"
              />

              <Combobox
                options={akreditasiOptions}
                value={filterAkreditasi}
                onValueChange={setFilterAkreditasi}
                placeholder="Semua Akreditasi"
                searchPlaceholder="Cari akreditasi..."
                emptyText="Tidak ditemukan."
                className="w-full sm:w-44"
              />

              {hasActiveFilter && (
                <Button variant="ghost" size="icon" onClick={resetFilters} title="Reset filter">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Result count */}
          {data.length > 0 && (
            <p className="text-sm text-muted-foreground -mt-2">
              Menampilkan {filtered.length} dari {data.length} program studi
            </p>
          )}

          {/* Empty state: no data at all */}
          {data.length === 0 ? (
            <EmptyState
              title="Tidak ada program studi"
              description="Belum ada data program studi. Tambahkan sekarang."
              actionLabel="Tambah Program Studi"
              action={() => {}}
            />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground rounded-md border bg-white dark:bg-zinc-900">
              <Search className="h-10 w-10 mb-3 opacity-40" />
              <p className="font-medium text-foreground">Tidak ada hasil ditemukan</p>
              <p className="text-sm mt-1">Coba ubah kata kunci atau filter yang digunakan</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={resetFilters}>
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="rounded-md border bg-white dark:bg-zinc-900">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Program Studi</TableHead>
                    <TableHead>Universitas</TableHead>
                    <TableHead>Biaya Kuliah</TableHead>
                    <TableHead>Akreditasi</TableHead>
                    <TableHead>Dibuat</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((prodi) => (
                    <TableRow key={prodi.id}>
                      <TableCell className="font-medium">{prodi.nama_program_studi}</TableCell>
                      <TableCell>{prodi.universitas?.nama || "-"}</TableCell>
                      <TableCell>Rp {prodi.biaya_kuliah.toLocaleString("id-ID")}</TableCell>
                      <TableCell>{prodi.akreditasi}</TableCell>
                      <TableCell>
                        {new Date(prodi.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        <TableActions
                          onEdit={
                            <CreateOrEditProgramStudiDialog
                              mode="edit"
                              initialValues={{ ...prodi, universitasId: prodi.universitas?.id }}
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
                          onDeleteRaw={() => handleDeleteClick(prodi)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      {/* Dialog 1: Standard confirmation */}
      <Dialog
        open={deleteFlow.step === "confirm"}
        onOpenChange={(open) => { if (!open) closeDeleteDialog(); }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Hapus Program Studi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus program studi{" "}
              <strong>
                &quot;{deleteFlow.step === "confirm" ? deleteFlow.prodi.nama_program_studi : ""}&quot;
              </strong>
              ?
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Tindakan ini tidak dapat dibatalkan.</span>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="ghost" onClick={closeDeleteDialog} disabled={deleteLoading}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                "Hapus"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: History warning — shown when prodi has recommendation history */}
      <Dialog
        open={deleteFlow.step === "history"}
        onOpenChange={(open) => { if (!open) closeDeleteDialog(); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Program Studi Memiliki Riwayat Rekomendasi
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
              Program studi{" "}
              <strong>
                &quot;{deleteFlow.step === "history" ? deleteFlow.prodi.nama_program_studi : ""}&quot;
              </strong>{" "}
              memiliki{" "}
              <strong>{deleteFlow.step === "history" ? deleteFlow.count : 0} riwayat rekomendasi</strong>.
              Menghapus program studi ini{" "}
              <strong>tidak akan mempengaruhi riwayat yang sudah ada</strong>, namun program studi ini
              tidak akan tersedia untuk rekomendasi baru.
            </div>
            <p className="text-sm text-muted-foreground">
              Apakah Anda ingin tetap melanjutkan penghapusan?
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="ghost" onClick={closeDeleteDialog} disabled={deleteLoading}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleForceDelete} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Lanjutkan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
