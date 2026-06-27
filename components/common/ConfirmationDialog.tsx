"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";

interface ConfirmationDialogProps {
  trigger: React.ReactNode;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
  onConfirm: () => Promise<void> | void;
  confirmVariant?:
    | "default"
    | "destructive"
    | "secondary"
    | "outline"
    | "ghost"
    | "link";
  confirmColor?: string; // for custom text color if needed
  loadingText?: string;
}

export function ConfirmationDialog({
  trigger,
  title = "Konfirmasi Aksi",
  message = "Apakah kamu yakin ingin melanjutkan aksi ini?",
  icon,
  confirmLabel = "Lanjutkan",
  cancelLabel = "Batal",
  confirmVariant = "default",
  confirmColor,
  onConfirm,
  loadingText = "Memproses...",
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
    } catch (error) {
      let message = "Terjadi kesalahan. Silakan coba lagi.";
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        message = data?.message || data?.error || message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">{message}</div>
        {confirmVariant === "destructive" && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>Tindakan ini tidak dapat dibatalkan.</span>
          </div>
        )}
        <DialogFooter className="pt-4">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={loading}
            className={cn(confirmColor)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {loadingText}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
