import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Chapter } from '../types';
import Spinner from './Spinner';
import { PlusIcon, TrashIcon, WandIcon } from './icons';
import { OutlineData } from './CreateBookModal';

type EditableChapter = Omit<Chapter, 'id' | 'content'> & { tempId: string };

interface OutlineGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  outlineData: OutlineData;
  onBookCreate: (chapters: Omit<Chapter, 'id' | 'content'>[]) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const OutlineGeneratorModal: React.FC<OutlineGeneratorModalProps> = ({
  isOpen,
  onClose,
  outlineData,
  onBookCreate,
  onRegenerate,
  isRegenerating,
}) => {
  const [chapters, setChapters] = useState<EditableChapter[]>([]);

  useEffect(() => {
    setChapters(outlineData.chapters.map(c => ({ ...c, tempId: crypto.randomUUID() })));
  }, [outlineData]);

  const handleChapterChange = (tempId: string, field: 'title' | 'description', value: string) => {
    setChapters(prev =>
      prev.map(c => (c.tempId === tempId ? { ...c, [field]: value } : c))
    );
  };

  const handleAddChapter = () => {
    setChapters(prev => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        title: `New Chapter ${prev.length + 1}`,
        description: '',
      },
    ]);
  };

  const handleDeleteChapter = (tempId: string) => {
    setChapters(prev => prev.filter(c => c.tempId !== tempId));
  };
  
  const handleContinue = () => {
    const finalChapters = chapters.map(({ tempId, ...rest }) => rest);
    onBookCreate(finalChapters);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review & Edit Outline</DialogTitle>
          <DialogDescription>
            Here is the generated outline for your book. You can edit, add, or remove chapters before continuing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
          {chapters.map((chapter, index) => (
            <div key={chapter.tempId} className="p-4 border rounded-md bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-700">Chapter {index + 1}</label>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteChapter(chapter.tempId)}>
                        <TrashIcon />
                    </Button>
                </div>
                <Input
                    placeholder="Chapter Title"
                    value={chapter.title}
                    onChange={(e) => handleChapterChange(chapter.tempId, 'title', e.target.value)}
                />
                <Textarea
                    placeholder="Chapter Description"
                    value={chapter.description}
                    onChange={(e) => handleChapterChange(chapter.tempId, 'description', e.target.value)}
                    rows={2}
                />
            </div>
          ))}
        </div>
         <div className="pt-2">
            <Button variant="outline" className="w-full" onClick={handleAddChapter}>
                <PlusIcon />
                <span className="ml-2">Add Chapter</span>
            </Button>
        </div>
        <DialogFooter className="pt-4 border-t">
          <div className="w-full flex justify-between">
            <Button variant="secondary" onClick={onRegenerate} disabled={isRegenerating}>
                {isRegenerating ? <Spinner /> : <WandIcon />}
                <span className="ml-2">{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
            </Button>
            <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                <Button type="button" onClick={handleContinue}>Continue to Editor</Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OutlineGeneratorModal;
