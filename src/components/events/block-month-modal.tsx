"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const schema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(1970),
});

type BlockMonthValues = z.infer<typeof schema>;

type BlockMonthModalProps = {
  open: boolean;
  calendarId?: string;
  calendarName?: string;
  onClose: () => void;
  onConfirm: (input: { month: number; year: number }) => Promise<void> | void;
};

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function BlockMonthModal({
  open,
  calendarId,
  calendarName,
  onClose,
  onConfirm,
}: BlockMonthModalProps) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const form = useForm<BlockMonthValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: currentMonth,
      year: currentYear,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        month: currentMonth,
        year: currentYear,
      });
    }
  }, [open, form, currentMonth, currentYear]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onConfirm({
      month: values.month,
      year: values.year,
    });
    onClose();
  });

  // Gerar lista de anos (ano atual até 10 anos no futuro)
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bloquear Mês"
      description={`Bloquear um mês inteiro no calendário ${calendarName ?? ""}`}
      size="sm"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Mês</label>
          <Select
            value={form.watch("month").toString()}
            onChange={(e) => form.setValue("month", parseInt(e.target.value, 10))}
          >
            {MONTHS.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
          {form.formState.errors.month && (
            <p className="text-xs text-red-500">{form.formState.errors.month.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">Ano</label>
          <Select
            value={form.watch("year").toString()}
            onChange={(e) => form.setValue("year", parseInt(e.target.value, 10))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          {form.formState.errors.year && (
            <p className="text-xs text-red-500">{form.formState.errors.year.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="text-slate-600 hover:bg-slate-100"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={form.formState.isSubmitting} disabled={!calendarId}>
            Bloquear Mês
          </Button>
        </div>
      </form>
    </Modal>
  );
}

