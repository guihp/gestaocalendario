"use client";

import { CalendarEvent, EventUpdateInput } from "@/types/schedule";
import { Modal } from "@/components/ui/modal";
import { EventForm } from "@/components/events/event-form";

type EventModalProps = {
  open: boolean;
  calendarId?: string;
  event?: CalendarEvent | null;
  onClose: () => void;
  onSubmit: (payload: { eventId?: string; data: EventUpdateInput }) => Promise<void>;
};

export function EventModal({
  open,
  calendarId,
  event,
  onClose,
  onSubmit,
}: EventModalProps) {
  if (!calendarId) {
    return null;
  }

  const isEditing = Boolean(event);

  async function handleSubmit(data: EventUpdateInput) {
    await onSubmit({
      eventId: event?.id,
      data,
    });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar evento" : "Novo evento"}
      description={
        isEditing
          ? "Atualize as informações do compromisso."
          : "Preencha os detalhes para criar um novo compromisso."
      }
    >
      <EventForm calendarId={calendarId} event={event} onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}

