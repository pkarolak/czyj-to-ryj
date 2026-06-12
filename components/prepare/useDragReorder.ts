"use client";

import { useCallback, useState } from "react";

type UseDragReorderOptions = {
  onReorder: (from: number, to: number) => void;
};

export function dragReorderClass(
  isDragging: boolean,
  isDropTarget: boolean,
  base: string,
): string {
  if (isDragging) {
    return `${base} cursor-grabbing border-gold/30 bg-gold/5 opacity-50`;
  }
  if (isDropTarget) {
    return `${base} border-gold/50 bg-gold/10`;
  }
  return `${base} border-white/10 bg-white/[0.02]`;
}

export function useDragReorder({ onReorder }: UseDragReorderOptions) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const finishDrag = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  const handleDrop = useCallback(
    (targetIndex: number) => {
      if (dragIndex === null || dragIndex === targetIndex) {
        finishDrag();
        return;
      }
      onReorder(dragIndex, targetIndex);
      finishDrag();
    },
    [dragIndex, finishDrag, onReorder],
  );

  const itemState = useCallback(
    (index: number) => ({
      isDragging: dragIndex === index,
      isDropTarget:
        overIndex === index && dragIndex !== null && dragIndex !== index,
    }),
    [dragIndex, overIndex],
  );

  const move = useCallback(
    (index: number, direction: -1 | 1, length: number) => {
      const target = index + direction;
      if (target < 0 || target >= length) return;
      onReorder(index, target);
    },
    [onReorder],
  );

  const bindRow = useCallback(
    (index: number, id: string) => ({
      draggable: true as const,
      onDragStart: (event: React.DragEvent) => {
        setDragIndex(index);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", id);
      },
      onDragEnd: finishDrag,
      onDragOver: (event: React.DragEvent) => {
        event.preventDefault();
        if (dragIndex !== null && dragIndex !== index) {
          setOverIndex(index);
        }
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        handleDrop(index);
      },
    }),
    [dragIndex, finishDrag, handleDrop],
  );

  const bindDragHandle = useCallback(
    (index: number, id: string) => ({
      draggable: true as const,
      onDragStart: (event: React.DragEvent) => {
        setDragIndex(index);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", id);
        event.stopPropagation();
      },
      onDragEnd: finishDrag,
    }),
    [finishDrag],
  );

  const bindDropTarget = useCallback(
    (index: number) => ({
      onDragOver: (event: React.DragEvent) => {
        event.preventDefault();
        if (dragIndex !== null && dragIndex !== index) {
          setOverIndex(index);
        }
      },
      onDrop: (event: React.DragEvent) => {
        event.preventDefault();
        handleDrop(index);
      },
    }),
    [dragIndex, handleDrop],
  );

  return { itemState, move, bindRow, bindDragHandle, bindDropTarget };
}
