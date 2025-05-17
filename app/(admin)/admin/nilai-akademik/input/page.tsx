"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MataPelajaranEnum } from "@/enums/common";
import {
  BookOpen,
  GraduationCap,
  Trash2,
  GripVertical,
  PlusCircle,
  MoveDown,
  CheckCircle2,
  Search,
  User,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const defaultMapel = Object.values(MataPelajaranEnum);

interface Siswa {
  id: string;
  name: string;
}

interface NilaiItem {
  id: string;
  pelajaran: string;
  nilai: string;
}

// Special ID for the "drag all" feature
const DRAG_ALL_ID = "drag-all-subjects";

function SortableSubjectItem({
  id,
  subject,
  onAdd,
}: {
  id: string;
  subject: string;
  onAdd: (subject: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-3 bg-white rounded-md border hover:border-primary hover:shadow-sm transition-all cursor-grab active:cursor-grabbing"
      onClick={() => onAdd(subject)}
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
      <span className="flex-1">{subject}</span>
      <PlusCircle className="h-4 w-4 ml-2 text-primary" />
    </div>
  );
}

function DragAllSubjectsItem({
  onDragAll,
  subjectCount,
}: {
  onDragAll: () => void;
  subjectCount: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: DRAG_ALL_ID });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-3 bg-primary/10 rounded-md border-2 border-primary/30 hover:bg-primary/20 transition-all cursor-grab active:cursor-grabbing mt-4 mb-2"
      onClick={onDragAll}
      {...attributes}
      {...listeners}
    >
      <MoveDown className="h-5 w-5 mr-2 text-primary" />
      <span className="font-medium">Pilih Semua Mata Pelajaran</span>
      <Badge variant="outline" className="ml-auto bg-white">
        {subjectCount}
      </Badge>
    </div>
  );
}

function SortableGradeItem({
  item,
  onRemove,
  onValueChange,
}: {
  item: NilaiItem;
  onRemove: (id: string) => void;
  onValueChange: (id: string, value: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-3 bg-white rounded-md border hover:shadow-sm transition-all"
    >
      <div
        className="mr-2 cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex-1 mr-3">
        <p className="font-medium text-sm">{item.pelajaran}</p>
      </div>

      <div className="w-20">
        <Input
          type="number"
          min={0}
          max={100}
          value={item.nilai}
          onChange={(e) => onValueChange(item.id, e.target.value)}
          className="text-center"
          placeholder="0-100"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(item.id)}
        className="ml-1 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function DraggableItem({
  subject,
  isMultiple = false,
}: {
  subject: string;
  isMultiple?: boolean;
}) {
  return (
    <div className="flex items-center p-3 bg-white rounded-md border shadow-lg z-[999]">
      {isMultiple ? (
        <>
          <MoveDown className="h-4 w-4 mr-2 text-primary" />
          <span>Semua Mata Pelajaran</span>
          <Badge variant="outline" className="ml-2 bg-white">
            {subject}
          </Badge>
        </>
      ) : (
        <>
          <GripVertical className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{subject}</span>
        </>
      )}
    </div>
  );
}

export default function InputNilaiPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<string>("");
  const [availableSubjects, setAvailableSubjects] =
    useState<string[]>(defaultMapel);
  const [selectedSubjects, setSelectedSubjects] = useState<NilaiItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDraggingAll, setIsDraggingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { handleSubmit } = useForm();

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: "selected-container",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const res = await axios.get("/api/users?role=SISWA");
        setSiswaList(res.data?.data || []);
      } catch (error) {
        toast.error("Gagal memuat data siswa");
      }
    };

    fetchSiswa();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);

    if (id === DRAG_ALL_ID) {
      setIsDraggingAll(true);
    } else {
      setIsDraggingAll(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setIsDraggingAll(false);
      return;
    }

    // Handle "drag all" feature
    if (active.id === DRAG_ALL_ID && over.id === "selected-container") {
      handleAddAllSubjects();
      setActiveId(null);
      setIsDraggingAll(false);
      return;
    }

    // Handle sorting within selected subjects
    if (active.id !== over.id) {
      const activeIndex = selectedSubjects.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = selectedSubjects.findIndex(
        (item) => item.id === over.id
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        setSelectedSubjects((items) =>
          arrayMove(items, activeIndex, overIndex)
        );
        setActiveId(null);
        setIsDraggingAll(false);
        return;
      }
    }

    // Handle adding new subject from available to selected
    if (
      availableSubjects.includes(active.id as string) &&
      over.id === "selected-container"
    ) {
      handleAddSubject(active.id as string);
    } else if (
      availableSubjects.includes(active.id as string) &&
      selectedSubjects.some((item) => item.id === over.id)
    ) {
      handleAddSubject(active.id as string);
    }

    setActiveId(null);
    setIsDraggingAll(false);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setIsDraggingAll(false);
  };

  const handleRemoveSubject = (id: string) => {
    const subjectToRemove = selectedSubjects.find((item) => item.id === id);
    if (!subjectToRemove) return;

    setAvailableSubjects(
      [...availableSubjects, subjectToRemove.pelajaran].sort()
    );

    const newSelected = selectedSubjects.filter((item) => item.id !== id);
    setSelectedSubjects(newSelected);
  };

  const handleAddSubject = (subject: string) => {
    if (selectedSubjects.some((item) => item.pelajaran === subject)) {
      toast.error(`${subject} sudah dipilih`);
      return;
    }

    setSelectedSubjects([
      ...selectedSubjects,
      {
        id: `selected-${Date.now()}-${subject}`,
        pelajaran: subject,
        nilai: "",
      },
    ]);

    const newAvailable = availableSubjects.filter((s) => s !== subject);
    setAvailableSubjects(newAvailable);
  };

  const handleAddAllSubjects = () => {
    if (availableSubjects.length === 0) {
      toast.error("Semua mata pelajaran sudah dipilih");
      return;
    }

    const newSelectedSubjects = [
      ...selectedSubjects,
      ...availableSubjects.map((subject) => ({
        id: `selected-${Date.now()}-${subject}`,
        pelajaran: subject,
        nilai: "",
      })),
    ];

    setSelectedSubjects(newSelectedSubjects);
    setAvailableSubjects([]);

    toast.success(`${availableSubjects.length} mata pelajaran ditambahkan`);
  };

  const handleNilaiChange = (id: string, value: string) => {
    setSelectedSubjects((prev) =>
      prev.map((item) => (item.id === id ? { ...item, nilai: value } : item))
    );
  };

  const onSubmit = async () => {
    if (!selectedSiswa) {
      toast.error("Pilih siswa terlebih dahulu");
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.error("Pilih minimal satu mata pelajaran");
      return;
    }

    const invalidSubjects = selectedSubjects.filter(
      (s) => !s.nilai || isNaN(Number.parseInt(s.nilai))
    );
    if (invalidSubjects.length > 0) {
      toast.error(
        `Nilai untuk ${invalidSubjects[0].pelajaran} belum diisi dengan benar`
      );
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        userId: selectedSiswa,
        nilaiList: selectedSubjects.map((s) => ({
          pelajaran: s.pelajaran,
          nilai: Number.parseInt(s.nilai),
        })),
      };

      await axios.post("/api/nilai-akademik", payload);
      toast.success("Nilai akademik berhasil disimpan");

      setSelectedSubjects([]);
      setAvailableSubjects(defaultMapel);
      setSelectedSiswa("");
    } catch (error) {
      toast.error("Gagal menyimpan nilai akademik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSiswa = (id: string) => {
    setSelectedSiswa(id);
    setIsSearchOpen(false);
  };

  const filteredSiswaList = siswaList.filter((siswa) =>
    siswa.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = siswaList.find((s) => s.id === selectedSiswa);
  const activeSubject = activeId
    ? availableSubjects.find((s) => s === activeId) ||
      selectedSubjects.find((s) => s.id === activeId)?.pelajaran
    : null;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <GraduationCap className="h-8 w-8 mr-3 text-primary" />
        <h1 className="text-2xl font-bold">Input Nilai Akademik Siswa</h1>
      </div>

      <div className="bg-muted p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">
              Pilih Siswa
            </label>

            {/* Student Search Combobox */}
            <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isSearchOpen}
                  className="w-full justify-between bg-white"
                >
                  {selectedSiswa ? (
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{selectedStudent?.name || "Pilih Siswa"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-muted-foreground">
                      <Search className="mr-2 h-4 w-4" />
                      <span>Cari siswa...</span>
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Cari nama siswa..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>Tidak ada siswa yang ditemukan</CommandEmpty>
                    <CommandGroup heading="Daftar Siswa">
                      {filteredSiswaList.map((siswa) => (
                        <CommandItem
                          key={siswa.id}
                          value={siswa.id}
                          onSelect={() => handleSelectSiswa(siswa.id)}
                          className="flex items-center"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>{siswa.name}</span>
                          {selectedSiswa === siswa.id && (
                            <CheckCircle2 className="ml-auto h-4 w-4 text-primary" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedStudent && (
            <div className="bg-white p-3 rounded-lg flex items-center">
              <div className="bg-primary/10 rounded-full p-2 mr-3">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{selectedStudent.name}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {selectedStudent.id}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedSiswa("")}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available Subjects */}
          <Card className="p-4 border-dashed">
            <div className="flex items-center mb-4">
              <BookOpen className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-lg font-medium">Mata Pelajaran Tersedia</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Drag mata pelajaran ke area nilai atau klik untuk menambahkan
            </p>

            {availableSubjects.length > 0 && (
              <SortableContext
                items={[DRAG_ALL_ID]}
                strategy={verticalListSortingStrategy}
              >
                <DragAllSubjectsItem
                  onDragAll={handleAddAllSubjects}
                  subjectCount={availableSubjects.length}
                />
              </SortableContext>
            )}

            <div className="space-y-2 min-h-[200px]">
              {availableSubjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-md">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary/60" />
                  Semua mata pelajaran sudah dipilih
                </div>
              ) : (
                <SortableContext
                  items={availableSubjects}
                  strategy={verticalListSortingStrategy}
                >
                  {availableSubjects.map((subject) => (
                    <SortableSubjectItem
                      key={subject}
                      id={subject}
                      subject={subject}
                      onAdd={handleAddSubject}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          </Card>

          {/* Selected Subjects with Grades */}
          <Card className="p-4 border-primary/20 relative">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-5 w-5 mr-2 text-primary" />
              <h2 className="text-lg font-medium">Input Nilai</h2>
              <Badge variant="outline" className="ml-auto">
                {selectedSubjects.length} Mata Pelajaran
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Masukkan nilai untuk setiap mata pelajaran (0-100)
            </p>

            <div
              ref={setDroppableRef}
              id="selected-container"
              className="space-y-3 min-h-[200px]"
            >
              {selectedSubjects.length === 0 ? (
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Drag mata pelajaran ke sini untuk menambahkan nilai
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    <SortableContext
                      items={selectedSubjects.map((item) => item.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {selectedSubjects.map((subject) => (
                        <SortableGradeItem
                          key={subject.id}
                          item={subject}
                          onRemove={handleRemoveSubject}
                          onValueChange={handleNilaiChange}
                        />
                      ))}
                    </SortableContext>
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={
                  isLoading || selectedSubjects.length === 0 || !selectedSiswa
                }
                className="px-6"
              >
                {isLoading ? "Menyimpan..." : "Simpan Nilai"}
              </Button>
            </div>
          </Card>
        </div>

        <DragOverlay>
          {activeId && activeSubject ? (
            <DraggableItem
              subject={
                isDraggingAll
                  ? availableSubjects.length.toString()
                  : activeSubject
              }
              isMultiple={isDraggingAll}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
