"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableRowProps {
  id: string;
  children: React.ReactNode;
}

export default function SortableRow({ id, children }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <tr
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50 bg-muted" : undefined}
    >
      <td
        className="px-3 py-2 w-8 cursor-grab text-muted-foreground text-lg select-none"
        {...attributes}
        {...listeners}
      >
        ⠿
      </td>
      {children}
    </tr>
  );
}
