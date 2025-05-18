"use client";
import TesMinatForm from "@/components/testMinat/TestMinatForm";
import { Suspense } from "react";

 

export default function TesMinatFormPage() {
 

  return (
    <>
      <Suspense fallback={<p className="text-center mt-6">Memuat form...</p>}>
        <TesMinatForm />
      </Suspense>
    </>
  );
}
