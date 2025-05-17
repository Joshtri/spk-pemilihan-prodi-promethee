"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger, 
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Pencil,
  Trash2,
  BookOpen,
  Search,
  Plus,
  AlertCircle,
  Loader2,
  ChevronDown,
  User,
  FileText,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NilaiAkademik {
  id: string;
  pelajaran: string;
  nilai: number;
  user: {
    id: string;
    name: string;
  };
}

export default function ListNilaiAkademikPage() {
  const [data, setData] = useState<NilaiAkademik[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<NilaiAkademik | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/nilai-akademik");
      setData(res.data?.data || []);
    } catch (err) {
      console.error("Gagal memuat data nilai:", err);
      toast.error("Gagal memuat data nilai");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle edit modal open
  const handleEdit = (item: NilaiAkademik) => {
    setEditItem(item);
    setEditValue(item.nilai.toString());
  };

  // Submit edited value
  const handleSubmitEdit = async () => {
    if (!editItem) return;

    try {
      await axios.put(`/api/nilai-akademik/${editItem.id}`, {
        nilai: Number.parseInt(editValue),
      });
      toast.success("Nilai berhasil diperbarui");
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error("Gagal memperbarui nilai:", err);
      toast.error("Gagal memperbarui nilai");
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (id: string) => {
    setDeleteConfirm(id);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await axios.delete(`/api/nilai-akademik/${deleteConfirm}`);
      toast.success("Nilai berhasil dihapus");
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      console.error("Gagal menghapus nilai:", err);
      toast.error("Gagal menghapus nilai");
    }
  };

  // Group data by student
  const grouped = data.reduce((acc, item) => {
    const userId = item.user.id;
    if (!acc[userId]) acc[userId] = { name: item.user.name, items: [] };
    acc[userId].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; items: NilaiAkademik[] }>);

  // Filter students by search query
  const filteredStudents = Object.entries(grouped).filter(([_, { name }]) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle all accordions
  const toggleAllAccordions = () => {
    if (expandedItems.length === Object.keys(grouped).length) {
      setExpandedItems([]);
    } else {
      setExpandedItems(Object.keys(grouped));
    }
  };

  // Get grade color based on value
  const getGradeColor = (nilai: number) => {
    if (nilai >= 90) return "text-emerald-600 bg-emerald-50";
    if (nilai >= 80) return "text-green-600 bg-green-50";
    if (nilai >= 70) return "text-blue-600 bg-blue-50";
    if (nilai >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  // Get grade letter based on value
  const getGradeLetter = (nilai: number) => {
    if (nilai >= 90) return "A";
    if (nilai >= 80) return "B";
    if (nilai >= 70) return "C";
    if (nilai >= 60) return "D";
    return "E";
  };

  // Calculate average grade for a student
  const calculateAverage = (items: NilaiAkademik[]) => {
    if (items.length === 0) return 0;
    const sum = items.reduce((acc, item) => acc + item.nilai, 0);
    return Math.round(sum / items.length);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <PageHeader
        title="Data Nilai Akademik"
        description="Berisi daftar nilai akademik seluruh siswa."
        actions={
          <Link href="/admin/nilai-akademik/input">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Input Nilai
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAllAccordions}
            className="text-xs"
          >
            {expandedItems.length === Object.keys(grouped).length
              ? "Tutup Semua"
              : "Buka Semua"}
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {Object.keys(grouped).length} Siswa
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Total {Object.keys(grouped).length} siswa memiliki data nilai
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="px-2 py-1 text-xs">
                  {data.length} Nilai
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Total {data.length} nilai telah diinput</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Memuat data nilai akademik...</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Belum Ada Data Nilai</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Belum ada data nilai akademik yang tersedia. Silakan tambahkan nilai
            baru dengan mengklik tombol Input Nilai.
          </p>
          <Link href="/admin/nilai-akademik/input">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Input Nilai
            </Button>
          </Link>
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Tidak Ada Hasil</h3>
          <p className="text-muted-foreground">
            Tidak ada siswa yang cocok dengan pencarian "{searchQuery}"
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Accordion
            type="multiple"
            value={expandedItems}
            onValueChange={setExpandedItems}
            className="space-y-4"
          >
            {filteredStudents.map(([userId, { name, items }]) => {
              const averageGrade = calculateAverage(items);

              return (
                <AccordionItem
                  key={userId}
                  value={userId}
                  className="border rounded-lg overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-base">{name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {items.length} mata pelajaran
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mr-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Rata-rata
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "font-bold",
                                getGradeColor(averageGrade)
                              )}
                            >
                              {getGradeLetter(averageGrade)}
                            </Badge>
                            <span className="font-medium">{averageGrade}</span>
                          </div>
                        </div>
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pt-2 pb-0">
                    <Card className="border-t-0 rounded-t-none">
                      <ScrollArea className="max-h-[400px]">
                        <Table>
                          <TableHeader className="bg-muted/50 sticky top-0">
                            <TableRow>
                              <TableHead className="w-12 text-center">
                                #
                              </TableHead>
                              <TableHead>Mata Pelajaran</TableHead>
                              <TableHead className="w-32 text-center">
                                Nilai
                              </TableHead>
                              <TableHead className="w-32 text-center">
                                Grade
                              </TableHead>
                              <TableHead className="w-24 text-right">
                                Aksi
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {items.map((item, index) => (
                              <TableRow
                                key={item.id}
                                className="hover:bg-muted/30"
                              >
                                <TableCell className="text-center font-medium text-muted-foreground">
                                  {index + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <span>{item.pelajaran}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-medium">
                                  {item.nilai}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge
                                    className={cn(
                                      "font-bold",
                                      getGradeColor(item.nilai)
                                    )}
                                  >
                                    {getGradeLetter(item.nilai)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(item)}
                                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Edit nilai</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              handleDeleteConfirm(item.id)
                                            }
                                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Hapus nilai</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(open) => !open && setEditItem(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit Nilai
            </DialogTitle>
            <DialogDescription>
              Ubah nilai untuk mata pelajaran {editItem?.pelajaran}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Siswa</p>
              </div>
              <p className="font-medium">{editItem?.user.name}</p>
            </div>

            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Mata Pelajaran</p>
              </div>
              <p className="font-medium">{editItem?.pelajaran}</p>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">
                Nilai (0-100)
              </label>
              <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                min={0}
                max={100}
                className="text-center text-lg font-medium"
              />

              {editValue && !isNaN(Number.parseInt(editValue)) && (
                <div className="mt-2 flex justify-center">
                  <Badge
                    className={cn(
                      "font-bold text-sm px-3 py-1",
                      getGradeColor(Number.parseInt(editValue))
                    )}
                  >
                    Grade: {getGradeLetter(Number.parseInt(editValue))}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Batal
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={!editValue || isNaN(Number.parseInt(editValue))}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus nilai ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-100 rounded-md p-4 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-800 font-medium">
              Data yang dihapus tidak dapat dikembalikan
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Nilai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
