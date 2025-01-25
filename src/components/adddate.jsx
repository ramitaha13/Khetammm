import React, { useState, useEffect } from "react";
import { LogOut, ArrowRight, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, push } from "firebase/database";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md py-4 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-700 transition-colors duration-200"
          >
            <LogOut className="h-6 w-6" />
            <span className="mr-2">تسجيل الخروج</span>
          </button>

          <h1 className="text-xl md:text-2xl font-bold text-blue-900">
            مذكره السلطة المحلية كابول
          </h1>

          <button
            onClick={() => navigate(-1)}
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

const AddDateForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [day, setDay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (date) {
      const selectedDate = new Date(date);
      const days = [
        "الأحد",
        "الاثنين",
        "الثلاثاء",
        "الأربعاء",
        "الخميس",
        "الجمعة",
        "السبت",
      ];
      const dayName = days[selectedDate.getDay()];
      setDay(dayName);
    } else {
      setDay("");
    }
  }, [date]);

  const createNotification = async (dateTitle, dateValue) => {
    try {
      const db = getDatabase();
      const notificationsRef = ref(db, "notifications");

      await push(notificationsRef, {
        title: "إضافة موعد جديد",
        message: `تم إضافة موعد جديد بعنوان: ${dateTitle} في تاريخ ${dateValue}`,
        timestamp: new Date().toISOString(),
        read: false,
        import: dateTitle,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const selectedDate = new Date(date);
    const todayDate = new Date(today);

    if (selectedDate < todayDate) {
      setError("لا يمكن اختيار تاريخ قبل اليوم");
      setIsSubmitting(false);
      return;
    }

    try {
      const db = getDatabase();
      const datesRef = ref(db, "dates");

      // Save the date
      await push(datesRef, {
        title,
        content,
        date,
        day,
      });

      // Create a notification for the new date
      await createNotification(title, date);

      setSuccess(true);
      setTitle("");
      setContent("");
      setDate("");
      setDay("");

      setTimeout(() => {
        navigate("/importantdates");
      }, 1500);
    } catch (err) {
      setError("حدث خطأ أثناء حفظ الموعد");
      console.error("Error saving date:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-right">
        إضافة موعد جديد
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-right">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-right">
          <span className="block sm:inline">تم حفظ الموعد بنجاح</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            العنوان
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            required
          />
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            المحتوى
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            required
          />
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            التاريخ
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            required
          />
        </div>

        <div>
          <label
            htmlFor="day"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            اليوم
          </label>
          <input
            type="text"
            id="day"
            value={day}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-right"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            <span className="ml-2">حفظ الموعد</span>
            <Save className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

const AddDatePage = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const username = localStorage.getItem("username");
      if (username !== "Khetam") {
        navigate("/");
        return;
      }
      setIsAuthorized(true);
    };

    checkAuth();
  }, [navigate]);

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-cyan-600 via-blue-800 to-cyan-600">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          <AddDateForm />
        </div>
      </main>
      <footer className="bg-amber-400 py-3 md:py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center"></div>
      </footer>
    </div>
  );
};

export default AddDatePage;
