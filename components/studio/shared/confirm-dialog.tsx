"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  error?: string;
  onConfirm: () => Promise<boolean>;
  onOpenChange: (open: boolean) => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  error,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const confirm = async () => {
    setPending(true);
    try {
      if (await onConfirm()) dialog.current?.close();
    } finally {
      setPending(false);
    }
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-description"
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === dialog.current && !pending) dialog.current.close();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border bg-card p-0 text-card-foreground shadow-2xl backdrop:bg-foreground/35 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive">
          This action can’t be undone
        </p>
        <h2 id="confirm-title" className="mt-3 text-xl font-semibold">
          {title}
        </h2>
        <p
          id="confirm-description"
          className="mt-2 text-sm leading-relaxed text-muted-foreground"
        >
          {description}
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="mt-7 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            size="xl"
            onClick={() => dialog.current?.close()}
            disabled={pending}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="xl"
            onClick={confirm}
            disabled={pending}
            className="rounded-full"
          >
            {pending ? "Deleting…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
