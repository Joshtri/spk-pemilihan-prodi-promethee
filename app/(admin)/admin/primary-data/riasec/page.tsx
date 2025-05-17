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
import { CreateOrEditRiasecDialog } from "@/components/primaryData/dialog/CreateOrEditRiasecDialog"; // pastikan path ini sesuai

interface RiasecMap {
  id: string;
  tipeRiasec: string;
  programStudi: {
    id: string;
    nama_program_studi: string;
  };
  programStudiId: string;
}

export default function RiasecPage() {
  const [data, setData] = useState<RiasecMap[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/riasec");
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data RIASEC:", err);
      toast.error("Gagal mengambil data RIASEC");
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
        title="Mapping RIASEC ke Program Studi"
        description="Kelola pemetaan tipe kepribadian Holland (RIASEC) ke program studi."
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Primary Data" },
          { label: "RIASEC" },
        ]}
        actions={
          <CreateOrEditRiasecDialog mode="create" onCompleted={fetchData} />
        }
      />

      {loading ? (
        <p>Memuat data...</p>
      ) : data.length === 0 ? (
        <EmptyState
          title="Belum ada data RIASEC"
          description="Tambahkan tipe kepribadian ke program studi."
          actionLabel="Tambah Mapping"
          action={() => {}}
        />
      ) : (
        <div className="rounded-md border bg-white dark:bg-zinc-900">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Studi</TableHead>
                <TableHead>Tipe RIASEC</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.programStudi.nama_program_studi}</TableCell>
                  <TableCell>{item.tipeRiasec}</TableCell>
                  <TableCell>
                    <TableActions
                      onEdit={
                        <CreateOrEditRiasecDialog
                          mode="edit"
                          initialValues={{
                            id: item.id,
                            programStudiId: item.programStudiId,
                            tipeRiasec: item.tipeRiasec,
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
                        message: `Hapus mapping RIASEC "${item.tipeRiasec}" dari prodi "${item.programStudi.nama_program_studi}"?`,
                        onConfirm: async () => {
                          await axios.delete(`/api/riasec/${item.id}`);
                          toast.success("Mapping berhasil dihapus");
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
