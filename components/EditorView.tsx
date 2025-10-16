import React, { useState, useEffect } from 'react';
import { Book, Chapter } from '../types';
import { BackIcon, DownloadIcon } from './icons';
import { Button } from './ui/button';
import BookDetailsForm from './BookDetailsForm';
import ChapterList from './ChapterList';
import ChapterEditor from './ChapterEditor';
import { generateChapterContent } from '../services/geminiService';
import { exportToPdf, exportToDocx } from '../services/exportService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"


interface EditorViewProps {
  book: Book;
  onBookUpdate: (book: Book) => void;
  onBack: () => void;
}

const EditorView: React.FC<EditorViewProps> = ({ book, onBookUpdate, onBack }) => {
  const [internalBook, setInternalBook] = useState(book);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  useEffect(() => {
    setInternalBook(book);
  }, [book]);

  useEffect(() => {
    if (internalBook.chapters.length > 0 && (!selectedChapterId || !internalBook.chapters.find(c => c.id === selectedChapterId))) {
      setSelectedChapterId(internalBook.chapters[0].id);
    } else if (internalBook.chapters.length === 0) {
      setSelectedChapterId(null);
    }
  }, [internalBook.chapters, selectedChapterId]);
  
  const selectedChapter = internalBook.chapters.find(c => c.id === selectedChapterId) || null;

  const handleBookMetaUpdate = (updatedBook: Book) => {
    setInternalBook(updatedBook);
  };
  
  const handleSaveChanges = () => {
    onBookUpdate(internalBook);
    // Add some user feedback, e.g., a toast notification
  };

  const handleChapterUpdate = (updatedChapter: Chapter) => {
    const updatedChapters = internalBook.chapters.map(c =>
      c.id === updatedChapter.id ? updatedChapter : c
    );
    setInternalBook({ ...internalBook, chapters: updatedChapters });
  };
  
  const handleChaptersUpdate = (updatedChapters: Chapter[]) => {
    setInternalBook({ ...internalBook, chapters: updatedChapters });
  }

  const handleGenerateContent = async () => {
    if (!selectedChapter) return;

    setIsGenerating(true);
    try {
      const content = await generateChapterContent({
        title: internalBook.title,
        subtitle: internalBook.subtitle,
        author: internalBook.author,
        chapters: internalBook.chapters,
      }, selectedChapter);
      
      handleChapterUpdate({ ...selectedChapter, content });
    } catch (error) {
      console.error('Failed to generate chapter content:', error);
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleExport = (format: 'pdf' | 'docx') => {
      if (format === 'pdf') {
          exportToPdf(internalBook);
      } else {
          exportToDocx(internalBook);
      }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <header className="flex items-center justify-between p-3 bg-white border-b shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <BackIcon />
              <span className="ml-2 hidden sm:inline">Back to Dashboard</span>
            </Button>
            <span className="h-6 w-px bg-slate-200"></span>
            <h1 className="text-lg font-bold truncate px-2">{internalBook.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={(value: 'pdf' | 'docx') => handleExport(value)}>
            <SelectTrigger className="w-[120px]">
                <DownloadIcon />
                <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="pdf">Export as PDF</SelectItem>
                <SelectItem value="docx">Export as DOCX</SelectItem>
            </SelectContent>
           </Select>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-1/4 min-w-[280px] max-w-[350px] bg-white p-4 overflow-y-auto border-r">
          <ChapterList
            chapters={internalBook.chapters}
            selectedChapterId={selectedChapterId}
            onSelectChapter={setSelectedChapterId}
            onUpdateChapters={handleChaptersUpdate}
          />
        </aside>
        <main className="flex-1 overflow-y-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="p-3 border-b bg-slate-50">
                    <TabsList>
                        <TabsTrigger value="editor">Editor</TabsTrigger>
                        <TabsTrigger value="details">Book Details</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="editor" className="flex-grow overflow-y-auto">
                    <ChapterEditor
                        chapter={selectedChapter}
                        onChapterUpdate={handleChapterUpdate}
                        onGenerateContent={handleGenerateContent}
                        isGenerating={isGenerating}
                    />
                </TabsContent>
                <TabsContent value="details" className="flex-grow overflow-y-auto">
                    <BookDetailsForm book={internalBook} onBookUpdate={handleBookMetaUpdate} />
                </TabsContent>
            </Tabs>
        </main>
      </div>
    </div>
  );
};

export default EditorView;