"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Menu, Search, Moon, Sun } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface AppHeaderProps {
  onMenuClick: () => void;
  role: "ADMIN" | "SISWA";
}

interface User {
  id: string;
  nama: string;
  [key: string]: string | number | boolean | object | undefined;
}

export default function AppHeader({ onMenuClick, role }: AppHeaderProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      }
    };
    fetchUser();
  }, []);

  const rolePrefix = role === "ADMIN" ? "/admin" : "/siswa";
  const avatarFallback = role === "SISWA" ? "SI" : "AD";
  const displayName = user?.nama || "User";

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <div className="hidden md:block w-[300px] lg:w-[400px]">
          <form>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari..."
                className="w-full bg-background pl-9"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4 pr-1">
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Dark Mode</span>
        </Button> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={displayName} />
                <AvatarFallback>
                  {user?.nama?.charAt(0).toUpperCase() || avatarFallback}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline">{user?.nama}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={`${rolePrefix}/my-profile`}
                className="w-full cursor-pointer"
              >
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`${rolePrefix}/log-activity`}
                className="w-full cursor-pointer"
              >
                Log Aktivitas
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                try {
                  await axios.post("/api/auth/logout");
                  toast.success("Berhasil logout!");
                  router.push("/");
                } catch {
                  toast.error("Gagal logout");
                }
              }}
              className="w-full cursor-pointer text-red-500 focus:text-red-500"
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
