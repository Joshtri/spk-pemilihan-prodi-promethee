"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, LineChart } from "lucide-react"
import OverviewTab from "@/components/dashboard/admin/OverviewTab"
import StudentsTab from "@/components/dashboard/admin/StudentsTab"
import ProgramsTab from "@/components/dashboard/admin/ProgramsTab"
import { fetchDashboardData } from "@/lib/dashboard-data"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  interface DashboardData {
    userStats: any[];
    programStudiStats: any[];
    riasecDistribution: any[];
    monthlyActivity: any[];
    recentStudents: any[];
    academicScores: any[];
    programStudiList: any[];
  }

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    userStats: [],
    programStudiStats: [],
    riasecDistribution: [],
    monthlyActivity: [],
    recentStudents: [],
    academicScores: [],
    programStudiList: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const data = await fetchDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="flex justify-center items-center h-64">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">
            <BarChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students">
            <PieChart className="h-4 w-4 mr-2" />
            Siswa
          </TabsTrigger>
          <TabsTrigger value="programs">
            <LineChart className="h-4 w-4 mr-2" />
            Program Studi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab
            userStats={dashboardData.userStats}
            monthlyActivity={dashboardData.monthlyActivity}
            riasecDistribution={dashboardData.riasecDistribution}
          />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <StudentsTab recentStudents={dashboardData.recentStudents} academicScores={dashboardData.academicScores} />
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <ProgramsTab
            programStudiStats={dashboardData.programStudiStats}
            programStudiList={dashboardData.programStudiList}
            riasecDistribution={dashboardData.riasecDistribution}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
