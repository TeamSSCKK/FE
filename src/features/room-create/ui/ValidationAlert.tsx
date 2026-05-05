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
      <AlertDialogContent className="max-w-[320px] gap-5 rounded-3xl border-0 p-6 shadow-xl">
        <AlertDialogHeader className="space-y-2 text-left">
          <AlertDialogTitle className="text-[17px] font-bold tracking-tight">
            입력값을 확인해주세요
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] leading-relaxed text-muted-foreground">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-stretch sm:space-x-0">
          <AlertDialogAction
            onClick={onClose}
            className="h-12 w-full rounded-xl text-[15px] font-semibold transition-all duration-200 active:scale-[0.98] active:opacity-95"
          >
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
