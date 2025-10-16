import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Chapter } from '../types';
import { GripVerticalIcon } from './icons';

interface ChapterListProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onUpdateChapters: (chapters: Chapter[]) => void;
}

interface SortableChapterItemProps {
    chapter: Chapter;
    isSelected: boolean;
    onSelectChapter: (id: string) => void;
}

const SortableChapterItem: React.FC<SortableChapterItemProps> = ({ chapter, isSelected, onSelectChapter }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: chapter.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            onClick={() => onSelectChapter(chapter.id)}
            className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                isSelected
                ? 'bg-primary/10 text-primary font-semibold'
                : 'hover:bg-slate-100'
            }`}
        >
            <button {...attributes} {...listeners} className="cursor-grab touch-none">
                <GripVerticalIcon />
            </button>
            <span className="flex-1 overflow-hidden ml-2">
                <p className="font-medium truncate text-sm">{chapter.title || 'Untitled Chapter'}</p>
            </span>
        </li>
    );
};

const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onUpdateChapters,
}) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = chapters.findIndex((c) => c.id === active.id);
            const newIndex = chapters.findIndex((c) => c.id === over.id);
            onUpdateChapters(arrayMove(chapters, oldIndex, newIndex));
        }
    };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-slate-800 px-2">Chapters</h2>
      <div className="flex-grow overflow-y-auto">
        {chapters.length === 0 ? (
            <div className="text-center p-4">
                <p className="text-sm text-slate-500">This book has no chapters yet.</p>
            </div>
        ) : (
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={chapters.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-1">
                        {chapters.map((chapter) => (
                            <SortableChapterItem 
                                key={chapter.id}
                                chapter={chapter}
                                isSelected={selectedChapterId === chapter.id}
                                onSelectChapter={onSelectChapter}
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
        )}
        </div>
    </div>
  );
};

export default ChapterList;