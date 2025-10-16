import React from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Book } from './types';
import Dashboard from './components/Dashboard';
import EditorView from './components/EditorView';

const App: React.FC = () => {
  const [books, setBooks] = useLocalStorage<Book[]>('books', []);
  const [selectedBookId, setSelectedBookId] = useLocalStorage<string | null>('selectedBookId', null);

  const selectedBook = books.find(b => b.id === selectedBookId) || null;

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleBackToDashboard = () => {
    setSelectedBookId(null);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prevBooks =>
      prevBooks.map(book => (book.id === updatedBook.id ? updatedBook : book))
    );
  };

  const addBook = (newBook: Book) => {
    setBooks(prevBooks => [...prevBooks, newBook]);
    setSelectedBookId(newBook.id);
  };
  
  const deleteBook = (bookId: string) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    if (selectedBookId === bookId) {
      setSelectedBookId(null);
    }
  };


  return (
    <div className="bg-slate-50 min-h-screen">
      {selectedBook ? (
        <EditorView
          book={selectedBook}
          onBookUpdate={updateBook}
          onBack={handleBackToDashboard}
        />
      ) : (
        <Dashboard
          books={books}
          onSelectBook={handleSelectBook}
          onAddBook={addBook}
          onDeleteBook={deleteBook}
        />
      )}
    </div>
  );
};

export default App;
