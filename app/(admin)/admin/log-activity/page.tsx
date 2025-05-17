"use client";

import { PageHeader } from "@/components/common/PageHeader";
import LogItemCard from "@/components/log/LogItemCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Section } from "@/components/ui/section"; // ⬅️ pakai Section
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Stack } from "@/components/ui/stack";
import { TypographyP } from "@/components/ui/typography";
import axios from "axios";
import { useEffect, useState } from "react";

interface Log {
  id: string | number;
  action: string;
  timestamp: string | Date;
  [key: string]: any;
}

export default function LogActivityPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/logs/my-activity")
      .then((res) => {
        setLogs(res.data.logs || []);
      })
      .catch(() => {
        console.error("Gagal memuat log aktivitas");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section className="">
      <Stack className="space-y-2">
        {/* <TypographyH2>Log Aktivitas</TypographyH2> */}
        <PageHeader
            breadcrumbs={[
              { label: "Dashboard", href: "/admin" },
              { label: "Log Aktivitas", href: "/admin/log-activity" },
            ]}
            title="Log Aktivitas"
            
        />
        <TypographyP className="">
          Riwayat aktivitas penting pada akun Anda, seperti login, logout, dan
          pembaruan data.
        </TypographyP>
      </Stack>

      <Separator className="my-6" />

      <ScrollArea className="h-[70vh] pr-2">
        {loading ? (
          <Stack className="space-y-4">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-20 w-full rounded-md" />
          </Stack>
        ) : logs.length === 0 ? (
          <TypographyP className="text-center">
            Belum ada aktivitas tercatat.
          </TypographyP>
        ) : (
          <Stack className="space-y-4">
            {logs.map((log) => (
              <LogItemCard key={log.id} log={log} />
            ))}
          </Stack>
        )}
      </ScrollArea>
    </Section>
  );
}
