import React, { useState, useEffect } from "react";
import { LogOut, ArrowRight, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, push } from "firebase/database";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username"); // Remove username from localStorage
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
            إضافة رقم هاتف جديد
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

const AddNumberForm = () => {
  const [nameOwner, setNameOwner] = useState("");
  const [numberPhone, setNumberPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const db = getDatabase();
      const numbersRef = ref(db, "numbers");

      await push(numbersRef, {
        nameOwner,
        numberPhone,
        date: new Date().toISOString(),
      });

      setSuccess(true);
      setNameOwner("");
      setNumberPhone("");

      setTimeout(() => {
        navigate("/numbers");
      }, 1500);
    } catch (err) {
      setError("حدث خطأ أثناء حفظ الرقم");
      console.error("Error saving number:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-right">
        إضافة رقم هاتف جديد
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-right">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-right">
          <span className="block sm:inline">تم حفظ الرقم بنجاح</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="nameOwner"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            اسم صاحب الرقم
          </label>
          <input
            type="text"
            id="nameOwner"
            value={nameOwner}
            onChange={(e) => setNameOwner(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            required
          />
        </div>

        <div>
          <label
            htmlFor="numberPhone"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            رقم الهاتف
          </label>
          <input
            type="tel"
            id="numberPhone"
            value={numberPhone}
            onChange={(e) => setNumberPhone(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            <span className="ml-2">حفظ الرقم</span>
            <Save className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

const AddNumberPage = () => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Authentication check
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
          <AddNumberForm />
        </div>
      </main>
      <footer className="bg-amber-400 py-3 md:py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center"></div>
      </footer>
    </div>
  );
};

export default AddNumberPage;
