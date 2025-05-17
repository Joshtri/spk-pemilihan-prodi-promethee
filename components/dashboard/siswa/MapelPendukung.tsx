"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Mapel } from "@/interfaces/Mapel";


// type Mapel = {
//   id: string;
//   nama_mata_pelajaran: string;
//   programStudi: {
//     id: string;
//     nama_program_studi: string;
//   };
// };


export default function MapelPendukung() {
  const [data, setData] = useState<Mapel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/mapel-pendukung");
        setData(res.data?.data || []);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupedByProdi: Record<string, Mapel[]> = {};
  data.forEach((item) => {
    const prodi = item.programStudi.nama_program_studi;
    if (!groupedByProdi[prodi]) groupedByProdi[prodi] = [];
    groupedByProdi[prodi].push(item);
  });

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Memuat...</p>
      ) : Object.keys(groupedByProdi).length === 0 ? (
        <p className="text-sm text-muted-foreground">Tidak ada data.</p>
      ) : (
        Object.entries(groupedByProdi).map(([prodi, mapelList]) => (
          <div key={prodi}>
            <h3 className="font-medium">{prodi}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {mapelList.map((mp) => (
                <Badge key={mp.id} variant="secondary" className="text-xs">
                  {mp.nama_mata_pelajaran}
                </Badge>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
