"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/common/ConfirmationDialog";
import React from "react";
import { DialogTrigger } from "../ui/dialog";

interface TableActionsProps {
  onView?: () => void;
  onEdit?: (() => void) | React.ReactNode;
  onDelete?: {
    message?: string;
    confirmLabel?: string;
    onConfirm: () => Promise<void> | void;
  };
}

export function TableActions({ onView, onEdit, onDelete }: TableActionsProps) {
  const hasActions = onView || onEdit || onDelete;
  if (!hasActions) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat
          </DropdownMenuItem>
        )}
        {onEdit &&
          (typeof onEdit === "function" ? (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          ) : (
            // Kalau ReactNode (misalnya Dialog)
            <div className="px-2 py-1">{onEdit}</div>
          ))}

        {onDelete && (
          <ConfirmationDialog
          trigger={
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DialogTrigger>
          }
            title="Hapus Data"
            message={onDelete.message ?? "Yakin ingin menghapus data ini?"}
            confirmLabel={onDelete.confirmLabel ?? "Hapus"}
            confirmVariant="destructive"
            icon={<Trash2 className="text-red-600" />}
            onConfirm={onDelete.onConfirm}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
