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
import { Book, Chapter } from '../types';
import { generateOutline } from '../services/geminiService';
import Spinner from './Spinner';
import OutlineGeneratorModal from './OutlineGeneratorModal';

interface CreateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookCreate: (book: Book) => void;
}

type InitialBookDetails = Omit<Book, 'id' | 'chapters' | 'coverImage'>;
type GeneratedChapters = Omit<Chapter, 'id' | 'content'>[];
export type OutlineData = {
  initialDetails: InitialBookDetails;
  chapters: GeneratedChapters;
};


const CreateBookModal: React.FC<CreateBookModalProps> = ({ isOpen, onClose, onBookCreate }) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [author, setAuthor] = useState('');
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('Informative and engaging');
  const [numChapters, setNumChapters] = useState(10);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isOutlineEditorOpen, setIsOutlineEditorOpen] = useState(false);
  const [outlineData, setOutlineData] = useState<OutlineData | null>(null);

  const resetState = () => {
    setTitle('');
    setSubtitle('');
    setAuthor('');
    setTopic('');
    setStyle('Informative and engaging');
    setNumChapters(10);
    setIsLoading(false);
    setError(null);
    setIsOutlineEditorOpen(false);
    setOutlineData(null);
  }

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !title) return;

    setIsLoading(true);
    setError(null);
    try {
      const generatedChapters = await generateOutline(topic, style, numChapters);
      setOutlineData({
        initialDetails: { title, subtitle, author },
        chapters: generatedChapters,
      });
      setIsOutlineEditorOpen(true);
      onClose(); // Close the first modal
    } catch (err) {
      setError('Failed to generate book outline. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!topic || !title) return;
    setIsLoading(true);
    setError(null);
     try {
      const generatedChapters = await generateOutline(topic, style, numChapters);
      setOutlineData({
        initialDetails: { title, subtitle, author },
        chapters: generatedChapters,
      });
    } catch (err) {
      setError('Failed to re-generate outline. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFinalBookCreate = (finalChapters: GeneratedChapters) => {
    if (!outlineData) return;
    
    const newBook: Book = {
      id: crypto.randomUUID(),
      ...outlineData.initialDetails,
      coverImage: null,
      chapters: finalChapters.map(c => ({
        ...c,
        id: crypto.randomUUID(),
        content: '',
      }))
    };
    onBookCreate(newBook);
    handleClose();
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create a New Book</DialogTitle>
            <DialogDescription>
              Fill in the details below to start your new book with an AI-generated outline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInitialSubmit} className="space-y-4 pt-4">
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
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner />}
                <span className={isLoading ? 'ml-2' : ''}>Generate Outline</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {outlineData && (
        <OutlineGeneratorModal
          isOpen={isOutlineEditorOpen}
          onClose={() => setIsOutlineEditorOpen(false)}
          outlineData={outlineData}
          onBookCreate={handleFinalBookCreate}
          onRegenerate={handleRegenerate}
          isRegenerating={isLoading}
        />
      )}
    </>
  );
};

export default CreateBookModal;