import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

interface ProgramsTabProps {
  programStudiStats: Array<any>;
  programStudiList: Array<any>;
  riasecDistribution: Array<any>;
}

export default function ProgramsTab({
  programStudiStats,
  programStudiList,
  riasecDistribution,
}: ProgramsTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PopularProgramsChart programStudiStats={programStudiStats} />
        <RumpunIlmuDistributionChart
          programStudiList={programStudiList}
          riasecDistribution={riasecDistribution}
        />
      </div>
      <ProgramStudiTable programStudiList={programStudiList} />
    </>
  );
}

function PopularProgramsChart({
  programStudiStats,
}: {
  programStudiStats: Array<any>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Studi Terpopuler</CardTitle>
        <CardDescription>Berdasarkan pilihan siswa</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={programStudiStats}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function RumpunIlmuDistributionChart({
  programStudiList,
  riasecDistribution,
}: {
  programStudiList: Array<any>;
  riasecDistribution: Array<any>;
}) {
  // Calculate rumpun ilmu distribution
  const rumpunIlmuData = programStudiList.reduce((acc, program) => {
    const existing = acc.find((item) => item.name === program.rumpunIlmu);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: program.rumpunIlmu, value: 1 });
    }
    return acc;
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Rumpun Ilmu</CardTitle>
        <CardDescription>Program studi berdasarkan rumpun ilmu</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rumpunIlmuData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {riasecDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ProgramStudiTable({
  programStudiList,
}: {
  programStudiList: Array<any>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Program Studi</CardTitle>
        <CardDescription>Semua program studi yang tersedia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Program
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akreditasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Biaya Kuliah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rumpun Ilmu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programStudiList.map((program, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {program.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {program.akreditasi}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Rp {program.biayaKuliah.toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {program.rumpunIlmu}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
