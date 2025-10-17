import React, { useState, useEffect } from 'react';
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
            className={`flex items-center p-2 rounded-md transition-colors ${
                isSelected
                ? 'bg-primary/10 text-primary font-semibold'
                : 'hover:bg-slate-100'
            }`}
        >
            <button {...attributes} {...listeners} className="cursor-grab touch-none p-1 -ml-1">
                <GripVerticalIcon />
            </button>
            <span 
                className="flex-1 overflow-hidden ml-1 cursor-pointer"
                onClick={() => onSelectChapter(chapter.id)}
            >
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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
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

    // Render a static list on the server and initial client render to avoid hydration mismatches
    // and to ensure DndContext is only rendered client-side.
    const StaticChapterList = () => (
        <ul className="space-y-1">
          {chapters.map(chapter => (
            <li
              key={chapter.id}
              onClick={() => onSelectChapter(chapter.id)}
              className={`flex items-center p-2 rounded-md transition-colors cursor-pointer ${
                selectedChapterId === chapter.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-slate-100'
              }`}
            >
              <div className="p-1 -ml-1">
                <GripVerticalIcon />
              </div>
              <span className="flex-1 overflow-hidden ml-1">
                <p className="font-medium truncate text-sm">{chapter.title || 'Untitled Chapter'}</p>
              </span>
            </li>
          ))}
        </ul>
      );


  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-slate-800 px-2">Chapters</h2>
      <div className="flex-grow overflow-y-auto">
        {chapters.length === 0 ? (
            <div className="text-center p-4">
                <p className="text-sm text-slate-500">This book has no chapters yet.</p>
            </div>
        ) : !isMounted ? <StaticChapterList /> : (
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