"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import axios from "axios";

interface ViewSubKriteriaDialogProps {
  kriteriaId: string;
}

interface SubKriteria {
  id: string;
  nama_sub_kriteria: string;
  bobot_sub_kriteria: number;
}

export function ViewSubKriteriaDialog({
  kriteriaId,
}: ViewSubKriteriaDialogProps) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<SubKriteria[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSub = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/kriteria/${kriteriaId}/sub`);
      setData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil sub kriteria:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (state: boolean) => {
    setOpen(state);
    if (state) fetchSub();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          Lihat Sub
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Sub Kriteria</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p>Memuat data...</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada sub kriteria
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Sub</TableHead>
                <TableHead>Bobot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.nama_sub_kriteria}</TableCell>
                  <TableCell>{sub.bobot_sub_kriteria}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
