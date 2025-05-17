import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
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

interface OverviewTabProps {
  userStats: Array<any>;
  monthlyActivity: Array<any>;
  riasecDistribution: Array<any>;
}

export default function OverviewTab({
  userStats,
  monthlyActivity,
  riasecDistribution,
}: OverviewTabProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {userStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MonthlyActivityChart monthlyActivity={monthlyActivity} />
        <RiasecDistributionChart riasecDistribution={riasecDistribution} />
      </div>
    </>
  );
}

function MonthlyActivityChart({
  monthlyActivity,
}: {
  monthlyActivity: Array<any>;
}) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Aktivitas Bulanan</CardTitle>
        <CardDescription>Jumlah siswa dan evaluasi per bulan</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={monthlyActivity}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="siswa" stroke="#8884d8" />
            <Line type="monotone" dataKey="evaluasi" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function RiasecDistributionChart({
  riasecDistribution,
}: {
  riasecDistribution: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
}) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Distribusi RIASEC</CardTitle>
        <CardDescription>Minat siswa berdasarkan tipe RIASEC</CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={riasecDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) =>
                `${name} ${percentage.toFixed(0)}%`
              }
            >
              {riasecDistribution.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number) => `${value} siswa`}
              labelFormatter={(name) => `Tipe: ${name}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
