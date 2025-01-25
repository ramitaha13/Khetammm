import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, remove, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowRight, Trash2 } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md py-4 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              localStorage.removeItem("username");
              navigate("/");
            }}
            className="flex items-center text-red-500 hover:text-red-700 transition-colors duration-200"
          >
            <LogOut className="h-6 w-6" />
            <span className="mr-2">تسجيل الخروج</span>
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-blue-900">
            مذكره السلطة المحلية كابول
          </h1>

          <button
            onClick={() => navigate("/mainpage")}
            className="flex items-center text-blue-900 hover:text-blue-700 transition-colors duration-200"
          >
            <ArrowRight className="h-6 w-6" />
            <span className="mr-2">رجوع</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const NoteCard = ({ note, onDelete }) => {
  const handleDeleteClick = () => {
    const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذه الملاحظة؟");
    if (confirmed) {
      onDelete(note.id, note.title);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl relative">
      <button
        onClick={handleDeleteClick}
        className="absolute top-4 left-4 text-red-500 hover:text-red-700 transition-colors duration-200"
        aria-label="Delete note"
      >
        <Trash2 className="h-5 w-5" />
      </button>

      {note.title && (
        <h3 className="text-lg font-bold text-blue-900 mb-2 text-right">
          {note.title}
        </h3>
      )}
      <p className="text-gray-700 text-right whitespace-pre-wrap">
        {note.content}
      </p>
      {note.date && (
        <div className="mt-4 text-sm text-gray-500 text-right">
          {`${String(new Date(note.date).getDate()).padStart(2, "0")}/${String(
            new Date(note.date).getMonth() + 1
          ).padStart(2, "0")}/${new Date(note.date).getFullYear()}`}
        </div>
      )}
    </div>
  );
};

const NotesPage = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username || username !== "Khetam") {
      navigate("/");
      return;
    }

    const db = getDatabase();
    const notesRef = ref(db, "notes");

    const unsubscribe = onValue(
      notesRef,
      (snapshot) => {
        setIsLoading(true);
        try {
          const data = snapshot.val();
          if (data) {
            const notesArray = Object.entries(data).map(([key, value]) => ({
              id: key,
              ...value,
            }));
            setNotes(notesArray);
          } else {
            setNotes([]);
          }
          setError(null);
        } catch (err) {
          setError("Error fetching notes");
          console.error("Error fetching notes:", err);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setError("Error connecting to database");
        setIsLoading(false);
        console.error("Database error:", error);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleDelete = async (noteId, noteTitle) => {
    try {
      const db = getDatabase();

      // Delete the note
      const noteRef = ref(db, `notes/${noteId}`);
      await remove(noteRef);

      // Find and delete corresponding notification
      const notificationsRef = ref(db, "notifications");
      const notificationsSnapshot = await get(notificationsRef);

      if (notificationsSnapshot.exists()) {
        const notifications = notificationsSnapshot.val();

        // Find notifications that match this note's title
        Object.entries(notifications).forEach(
          async ([notificationId, notification]) => {
            if (notification.note === noteTitle) {
              const notificationRef = ref(
                db,
                `notifications/${notificationId}`
              );
              await remove(notificationRef);
            }
          }
        );
      }
    } catch (err) {
      setError("Error deleting note");
      console.error("Error deleting note:", err);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-right">
          <strong className="font-bold ml-2">خطأ!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }

    if (notes.length === 0) {
      return (
        <div className="text-center text-white text-lg">
          لا توجد ملاحظات حالياً
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={handleDelete} />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-cyan-600 via-blue-800 to-cyan-600">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white text-center md:text-right">
              الملاحظات
            </h1>
          </div>
          {renderContent()}
        </div>
      </main>
      <footer className="bg-amber-400 py-3 md:py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center"></div>
      </footer>
    </div>
  );
};

export default NotesPage;
