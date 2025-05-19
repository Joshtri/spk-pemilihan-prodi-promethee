import {
    BookOpen,
    ChartBar,
    GraduationCap,
    Layout,
    ListChecks,
    NotebookPen,
    School,
    Settings,
    Users
} from "lucide-react";
import React from "react"; // Make sure to import React

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

type Role = "ADMIN" | "SISWA";

export const navByRole: Record<Role, NavSection[]> = {
    ADMIN: [
        {
            title: "Dashboard",
            items: [
                {
                    title: "Dashboard",
                    href: "/admin/dashboard",
                    icon: React.createElement(Layout, { className: "h-4 w-4" }),
                },
            ],
        },
        {
            title: "Kriteria",
            items: [
                {
                    title: "Kriteria",
                    href: "/admin/kriteria",
                    icon: React.createElement(ChartBar, { className: "h-4 w-4" }),
                },
                {
                    title: "Sub-Kriteria",
                    href: "/admin/sub-kriteria",
                    icon: React.createElement(NotebookPen, { className: "h-4 w-4" }),
                }
            ],
        },
        {
            title: "Users Management",
            items: [
                {
                    title: "Users",
                    href: "/admin/users",
                    icon: React.createElement(Users, { className: "h-4 w-4" }),
                },
                // {
                //     title: "Admin/Guru BK",
                //     href: "/admin/users-admin",
                //     icon: React.createElement(User2, { className: "h-4 w-4" }),
                // } 
            ],
        },
        {
            title: "Olah Data Siswa",
            items: [
                {
                    title: "Evaluasi Kriteria Siswa",
                    href: "/admin/evaluasi-siswa",
                    icon: React.createElement(Users, { className: "h-4 w-4" }),
                },
                // {
                //     title: "Presensi",
                //     href: "/admin/attendance",
                //     icon: React.createElement(CalendarCheck, { className: "h-4 w-4" }),
                // },

                {
                    title: "Nilai Akademik Siswa",
                    href: "/admin/nilai-akademik",
                    icon: React.createElement(NotebookPen, { className: "h-4 w-4" }),
                }
            ],

        },
        {
            title: "Primary Data",
            items: [

                {
                    title: "Program Studi",
                    href: "/admin/primary-data/program-studi",
                    icon: React.createElement(School, { className: "h-4 w-4" }),
                },

                {
                    title: "Rumpun Ilmu",
                    href: "/admin/primary-data/rumpun-ilmu",
                    icon: React.createElement(ListChecks, { className: "h-4 w-4" }),

                },
                {
                    title: "Mata Pelajaran Pendukung",
                    href: "/admin/primary-data/mapel-pendukung",
                    icon: React.createElement(BookOpen, { className: "h-4 w-4" }),
                },
                {
                    title: "Mapping RIASEC",
                    href: "/admin/primary-data/riasec",
                    icon: React.createElement(Settings, { className: "h-4 w-4" }),
                },
            ],
        },
        // {
        //     title: "Perhitungan",
        //     items: [
        //         {
        //             title: "Perhitungan Promethee",
        //             href: "/admin/promote-students",
        //             icon: React.createElement(GraduationCap, { className: "h-4 w-4" }),
        //         },
        //         {
        //             title: "Hasil Perhitungan",
        //             href: "/admin/students-scores-recap",
        //             icon: React.createElement(ChartBar, { className: "h-4 w-4" }),
        //         }
        //     ],
        // },
    ],
    SISWA: [
        {
            title: "Dashboard",
            items: [
                {
                    title: "Dashboard",
                    href: "/siswa/dashboard",
                    icon: React.createElement(Layout, { className: "h-4 w-4" }),
                },
            ],
        },
        {
            title: "Kelas",
            items: [
                {
                    title: "Pilih Program Studi",
                    href: "/siswa/pilih-program-studi",
                    icon: React.createElement(School, { className: "h-4 w-4" }),
                },
                {
                    title: "Hasil Rekomendasi",
                    href: "/siswa/hasil-rank",
                    icon: React.createElement(ChartBar, { className: "h-4 w-4" }),
                },
            ],
        },
        {
            title : "Nilai Akademik",
            items:[
                {
                    title: "Nilai Akademik Saya",
                    href: "/siswa/nilai-akademik-saya",
                    icon: React.createElement(NotebookPen, { className: "h-4 w-4" }),
                },
            ]
        }
    ],
};