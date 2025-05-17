// components/dashboard/RiasecProgramStudiCard.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const riasecMapping: {
  domain: string;
  colorClass: string;
  label: string;
  prodi: string[];
}[] = [
  {
    domain: "Social (S)",
    colorClass: "text-blue-600",
    label: "Social",
    prodi: [
      "Psikologi",
      "Bimbingan Konseling",
      "Pendidikan",
      "Keperawatan",
      "Pekerjaan Sosial",
    ],
  },
  {
    domain: "Artistic (A)",
    colorClass: "text-purple-600",
    label: "Artistic",
    prodi: [
      "Desain Komunikasi Visual",
      "Seni Rupa",
      "Sastra",
      "Jurnalistik",
      "Perfilman",
    ],
  },
  {
    domain: "Enterprising (E)",
    colorClass: "text-orange-600",
    label: "Enterprising",
    prodi: [
      "Manajemen",
      "Ilmu Komunikasi",
      "Hubungan Internasional",
      "Pemasaran",
      "Hukum",
    ],
  },
];

export default function RiasecProgramStudi() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Studi yang Sesuai dengan Profil RIASEC</CardTitle>
        <CardDescription>Berdasarkan kode Holland: SAE</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {riasecMapping.map((item) => (
            <div key={item.label} className="border rounded-lg p-4">
              <h3 className={`font-medium ${item.colorClass}`}>
                {item.domain}
              </h3>
              <ul className="mt-2 space-y-1 text-sm">
                {item.prodi.map((name) => (
                  <li key={name}>• {name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
