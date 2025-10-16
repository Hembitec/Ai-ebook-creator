import React from 'react';
import { Book } from '../types';
import { Button } from './ui/button';
import { PlusIcon, BookIcon, TrashIcon } from './icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import CreateBookModal from './CreateBookModal';

interface DashboardProps {
  books: Book[];
  onSelectBook: (bookId: string) => void;
  onAddBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ books, onSelectBook, onAddBook, onDeleteBook }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 flex items-center">
          <BookIcon />
          <span className="ml-3">My Books</span>
        </h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <PlusIcon />
          <span className="ml-2">New Book</span>
        </Button>
      </header>

      {books.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-slate-700">No books yet!</h2>
            <p className="text-slate-500 mt-2 mb-6">Click "New Book" to start your first masterpiece.</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon />
                <span className="ml-2">Create your first book</span>
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map(book => (
            <Card key={book.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader className="cursor-pointer" onClick={() => onSelectBook(book.id)}>
                <div className="w-full h-40 bg-slate-200 rounded-md mb-4 flex items-center justify-center">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="object-cover w-full h-full rounded-md" />
                  ) : (
                    <BookIcon />
                  )}
                </div>
                <CardTitle>{book.title}</CardTitle>
                <CardDescription>{book.author}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                 <p className="text-sm text-slate-600 line-clamp-3">{book.subtitle}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={() => onSelectBook(book.id)}>Edit</Button>
                <Button variant="ghost" size="icon" onClick={() => onDeleteBook(book.id)}>
                    <TrashIcon />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <CreateBookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBookCreate={onAddBook}
      />
    </div>
  );
};

export default Dashboard;
