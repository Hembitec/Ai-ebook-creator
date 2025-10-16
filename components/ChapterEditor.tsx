import React, { useState, useEffect } from 'react';
import { Chapter } from '../types';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { WandIcon, EyeIcon, CodeIcon } from './icons';
import Spinner from './Spinner';
import { Input } from './ui/input';

declare const marked: any;

interface ChapterEditorProps {
  chapter: Chapter | null;
  onChapterUpdate: (chapter: Chapter) => void;
  onGenerateContent: () => void;
  isGenerating: boolean;
}

const ChapterEditor: React.FC<ChapterEditorProps> = ({
  chapter,
  onChapterUpdate,
  onGenerateContent,
  isGenerating,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title);
      setContent(chapter.content);
      setViewMode('edit');
    }
  }, [chapter]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  const handleBlur = () => {
    if (chapter) {
      onChapterUpdate({ ...chapter, title, content });
    }
  };
  
  if (!chapter) {
    return (
        <div className="flex items-center justify-center h-full text-slate-500">
            <p>Select a chapter to start editing or add a new one.</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 h-full flex flex-col bg-white">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'edit' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('edit')}>
                <CodeIcon />
                <span className="ml-2">Edit</span>
            </Button>
            <Button variant={viewMode === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('preview')}>
                <EyeIcon />
                <span className="ml-2">Preview</span>
            </Button>
        </div>
        <Button onClick={onGenerateContent} disabled={isGenerating}>
          {isGenerating ? <Spinner /> : <WandIcon />}
          <span className="ml-2">{isGenerating ? 'Generating...' : 'Generate with AI'}</span>
        </Button>
      </div>
      <div className="space-y-4 flex-grow flex flex-col">
        <Input 
            value={title}
            onChange={handleTitleChange}
            onBlur={handleBlur}
            className="text-2xl font-bold border-0 shadow-none focus-visible:ring-0 px-0 h-auto"
            placeholder="Chapter Title"
        />
        {viewMode === 'edit' ? (
          <Textarea
              value={content}
              onChange={handleContentChange}
              onBlur={handleBlur}
              className="h-full flex-1 font-serif text-base resize-none border-0 shadow-none focus-visible:ring-0 p-0"
              placeholder="Start writing your chapter here..."
          />
        ) : (
          <div 
            className="prose prose-lg max-w-none flex-1 font-serif text-base p-0 overflow-y-auto"
            dangerouslySetInnerHTML={{ __html: marked.parse(content) }}
          />
        )}
      </div>
    </div>
  );
};

export default ChapterEditor;