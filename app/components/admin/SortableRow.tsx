"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
}

export default function SortableRow({ id, children }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "var(--color-border-muted)" : undefined,
  };

  return (
    <tr ref={setNodeRef} style={style}>
      <td style={{ padding: "var(--space-2) var(--space-3)", width: "32px", cursor: "grab", color: "var(--color-text-subtle)", fontSize: "var(--text-lg)", userSelect: "none" }} {...attributes} {...listeners}>
        ⠿
      </td>
      {children}
    </tr>
  );
}
