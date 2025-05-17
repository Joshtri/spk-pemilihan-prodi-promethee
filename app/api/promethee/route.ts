import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/utils/auth";
import { runPromethee } from "@/lib/promethee/promethee-engine";

export async function POST() {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  // const user = {
  //   id: "b24db3c5-0dbc-4deb-9881-db4801245632", // Replace with actual user ID
  //   role: "SISWA", // Replace with actual user role
  // };

  await runPromethee(user.id);

  return NextResponse.json({ success: true, message: "Perhitungan berhasil dilakukan." });
}
