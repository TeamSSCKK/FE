"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface Props {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function ValidationAlert({ open, message, onClose }: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="max-w-xs rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>입력값을 확인해주세요</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
