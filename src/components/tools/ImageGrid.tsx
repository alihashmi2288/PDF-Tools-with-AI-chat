"use client";

import React from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGridProps {
    files: File[];
    setFiles: (files: File[]) => void;
}

export function ImageGrid({ files, setFiles }: ImageGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = files.findIndex((f) => f.name === active.id);
            const newIndex = files.findIndex((f) => f.name === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                setFiles(arrayMove(files, oldIndex, newIndex));
            }
        }
    };

    const removeFile = (name: string) => {
        setFiles(files.filter((f) => f.name !== name));
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={files.map(f => f.name)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
                    {files.map((file) => (
                        <SortableImageItem key={file.name} file={file} onRemove={removeFile} />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

interface SortableImageItemProps {
    file: File;
    onRemove: (name: string) => void;
}

function SortableImageItem({ file, onRemove }: SortableImageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: file.name });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const imageUrl = React.useMemo(() => URL.createObjectURL(file), [file]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative aspect-square border-2 border-muted rounded-lg overflow-hidden bg-background shadow-sm hover:shadow-md transition-shadow"
        >
            {/* Image Preview */}
            <img
                src={imageUrl}
                alt={file.name}
                className="w-full h-full object-cover"
            />

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-2 left-2 p-1.5 bg-black/50 text-white rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Remove Button */}
            <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start when clicking remove
                    onRemove(file.name);
                }}
            >
                <X className="h-3 w-3" />
            </Button>

            {/* Index/Order Badge - Optional but helpful */}
            {/* <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                page
            </div> */}
        </div>
    );
}
