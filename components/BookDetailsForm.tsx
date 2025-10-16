import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Book } from '../types';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { UploadIcon } from './icons';
import { Card, CardContent } from './ui/card';

interface BookDetailsFormProps {
  book: Book;
  onBookUpdate: (book: Book) => void;
}

const BookDetailsForm: React.FC<BookDetailsFormProps> = ({ book, onBookUpdate }) => {
  const [title, setTitle] = useState(book.title);
  const [subtitle, setSubtitle] = useState(book.subtitle);
  const [author, setAuthor] = useState(book.author);
  const [coverImage, setCoverImage] = useState<string | null>(book.coverImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(book.title);
    setSubtitle(book.subtitle);
    setAuthor(book.author);
    setCoverImage(book.coverImage);
  }, [book]);

  const handleUpdate = () => {
    // Only call update if there's an actual change to avoid unnecessary re-renders
    if (title !== book.title || subtitle !== book.subtitle || author !== book.author) {
      onBookUpdate({ ...book, title, subtitle, author });
    }
  };
  
  const handleCoverImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newCoverImage = reader.result as string;
        setCoverImage(newCoverImage);
        onBookUpdate({ ...book, coverImage: newCoverImage });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Book Details</h2>
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className='grid gap-1.5'>
                        <label htmlFor="title" className="text-sm font-medium">Title</label>
                        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} onBlur={handleUpdate} />
                    </div>
                    <div className='grid gap-1.5'>
                        <label htmlFor="author" className="text-sm font-medium">Author</label>
                        <Input id="author" value={author} onChange={e => setAuthor(e.target.value)} onBlur={handleUpdate} />
                    </div>
                    <div className='md:col-span-2 grid gap-1.5'>
                        <label htmlFor="subtitle" className="text-sm font-medium">Subtitle</label>
                        <Textarea id="subtitle" value={subtitle} onChange={e => setSubtitle(e.target.value)} onBlur={handleUpdate} rows={3} />
                    </div>
                </div>
            </CardContent>
        </Card>

         <Card>
            <CardContent className="pt-6">
                 <h3 className="text-lg font-semibold text-slate-800 mb-4">Cover Image</h3>
                <div 
                  className="relative w-full h-64 border-2 border-dashed border-slate-300 rounded-md cursor-pointer flex items-center justify-center text-slate-500 hover:border-primary hover:text-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                    {coverImage ? (
                        <img src={coverImage} alt="Cover" className="object-contain w-full h-full rounded-md" />
                    ) : (
                        <div className="text-center">
                            <UploadIcon />
                            <p className="mt-2 text-sm">Upload a new cover image.</p>
                            <p className="text-xs text-slate-400">Recommended size: 600x800px.</p>
                        </div>
                    )}
                    <input 
                        type="file"
                        ref={fileInputRef}
                        onChange={handleCoverImageUpload}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            </CardContent>
        </Card>
    </div>
  );
};

export default BookDetailsForm;