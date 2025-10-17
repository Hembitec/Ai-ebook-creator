import React, { useState } from 'react';
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
import { Book, Chapter } from '../types';
import { generateOutline } from '../services/geminiService';
import Spinner from './Spinner';
import { PlusIcon, TrashIcon, WandIcon } from './icons';

// Types
interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreate: (book: Book) => void;
}

type Step = 'details' | 'outline';
type EditableChapter = Omit<Chapter, 'id' | 'content'> & { tempId: string };

// Main Component
const CreateBookModal: React.FC<CreateBookModalProps> = ({ isOpen, onClose, onBookCreate }) => {
  const [step, setStep] = useState<Step>('details');
  
  // Step 1: Details State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Informative and engaging');
  const [numChapters, setNumChapters] = useState(10);
  
  // Step 2: Outline State
  const [generatedChapters, setGeneratedChapters] = useState<EditableChapter[]>([]);
  
  // Common State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setStep('details');
    setTitle('');
    setSubtitle('');
    setAuthor('');
    setTopic('');
    setStyle('Informative and engaging');
    setNumChapters(10);
    setGeneratedChapters([]);
    setIsLoading(false);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleGenerateOutline = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!topic || !title) return;

    setIsLoading(true);
    setError(null);
    try {
      const chapters = await generateOutline(topic, style, numChapters);
      setGeneratedChapters(chapters.map(c => ({ ...c, tempId: crypto.randomUUID() })));
      setStep('outline');
    } catch (err) {
      setError('Failed to generate book outline. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalBookCreate = () => {
    const finalChapters = generatedChapters.map(({ tempId, ...rest }) => rest);
    const newBook: Book = {
      id: crypto.randomUUID(),
      title,
      subtitle,
      author,
      coverImage: null,
      chapters: finalChapters.map(c => ({
        ...c,
        id: crypto.randomUUID(),
        content: '',
      }))
    };
    onBookCreate(newBook);
    handleClose();
  };

  // --- Render Methods for Steps ---
  
  const renderDetailsStep = () => (
    <form onSubmit={handleGenerateOutline} className="flex-1 flex flex-col overflow-y-auto space-y-4 pt-4">
      <div className="px-1 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700">Book Details</h3>
            <Input placeholder="Book Title *" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input placeholder="Book Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            <Input placeholder="Author Name" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <hr />
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-700">AI Outline Generation</h3>
            <Input placeholder="Topic for the book *" value={topic} onChange={(e) => setTopic(e.target.value)} required />
            <Input placeholder="Writing Style (e.g., 'Humorous')" value={style} onChange={(e) => setStyle(e.target.value)} required />
            <div className="grid gap-2">
              <label htmlFor="num-chapters" className="text-sm font-medium">Number of Chapters</label>
              <Input id="num-chapters" type="number" value={numChapters} onChange={(e) => setNumChapters(parseInt(e.target.value, 10) || 1)} required min="1" max="50" />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <DialogFooter className="mt-auto pt-4 sticky bottom-0 bg-background">
        <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Spinner />}
          <span className={isLoading ? 'ml-2' : ''}>Generate Outline</span>
        </Button>
      </DialogFooter>
    </form>
  );

  const renderOutlineStep = () => {
    const handleChapterChange = (tempId: string, field: 'title' | 'description', value: string) => {
        setGeneratedChapters(prev =>
        prev.map(c => (c.tempId === tempId ? { ...c, [field]: value } : c))
      );
    };

    const handleAddChapter = () => {
        setGeneratedChapters(prev => [
        ...prev,
        {
          tempId: crypto.randomUUID(),
          title: `New Chapter ${prev.length + 1}`,
          description: '',
        },
      ]);
    };

    const handleDeleteChapter = (tempId: string) => {
        setGeneratedChapters(prev => prev.filter(c => c.tempId !== tempId));
    };

    return (
      <div className="flex-1 flex flex-col overflow-hidden pt-4">
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
          {generatedChapters.map((chapter, index) => (
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
         <div className="pt-2 shrink-0">
            <Button variant="outline" className="w-full" onClick={handleAddChapter}>
                <PlusIcon />
                <span className="ml-2">Add Chapter</span>
            </Button>
        </div>
        <DialogFooter className="pt-4 mt-4 border-t shrink-0">
          <div className="w-full flex justify-between">
            <Button variant="secondary" onClick={() => handleGenerateOutline()} disabled={isLoading}>
                {isLoading ? <Spinner /> : <WandIcon />}
                <span className="ml-2">{isLoading ? 'Regenerating...' : 'Regenerate'}</span>
            </Button>
            <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setStep('details')}>Back</Button>
                <Button type="button" onClick={handleFinalBookCreate}>Continue to Editor</Button>
            </div>
          </div>
        </DialogFooter>
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
            <DialogHeader>
            <DialogTitle>
                {step === 'details' ? 'Create a New Book' : 'Review & Edit Outline'}
            </DialogTitle>
            <DialogDescription>
                {step === 'details' 
                ? 'Fill in the details below to start your new book with an AI-generated outline.'
                : 'Here is the generated outline. You can edit, add, or remove chapters before continuing.'
                }
            </DialogDescription>
            </DialogHeader>
            {step === 'details' ? renderDetailsStep() : renderOutlineStep()}
        </DialogContent>
    </Dialog>
  );
};

export default CreateBookModal;