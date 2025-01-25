import React, { useState, useEffect } from "react";
import { getDatabase, ref, push } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowRight } from "lucide-react";

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

const AddTaskPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    title: "",
    description: "",
    status: "incomplete",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username || username !== "Khetam") {
      navigate("/");
    }
  }, [navigate]);

  const createNotification = async (taskTitle) => {
    try {
      const db = getDatabase();
      const notificationsRef = ref(db, "notifications");

      await push(notificationsRef, {
        title: "إضافة مهمة جديدة",
        message: `تم إضافة مهمة جديدة بعنوان: ${taskTitle}`,
        timestamp: new Date().toISOString(),
        read: false,
        task: taskTitle,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage("");

    try {
      const db = getDatabase();
      const tasksRef = ref(db, "tasks");

      // Validate form data
      if (!formData.date || !formData.title || !formData.description) {
        throw new Error("يرجى ملء جميع الحقول");
      }

      // Validate date is not in the past
      if (new Date(formData.date) < new Date(today)) {
        throw new Error("لا يمكن اختيار تاريخ في الماضي");
      }

      // Add task to Firebase
      await push(tasksRef, {
        ...formData,
        date: formData.date,
      });

      // Create notification for the new task
      await createNotification(formData.title);

      setSuccessMessage("تمت إضافة المهمة بنجاح!");

      // Reset form
      setFormData({
        date: "",
        title: "",
        description: "",
        status: "incomplete",
      });

      // Navigate back after short delay
      setTimeout(() => {
        navigate("/Tasks");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset error when user changes date
    if (name === "date") {
      setError(null);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-cyan-600 via-blue-800 to-cyan-600">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              إضافة مهمة جديدة
            </h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-right">
                <strong className="font-bold ml-2">خطأ!</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-right">
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-lg p-6 md:p-8"
            >
              <div className="space-y-6">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="date"
                  >
                    التاريخ
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    min={today}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="title"
                  >
                    عنوان المهمة
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="أدخل عنوان المهمة"
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="description"
                  >
                    وصف المهمة
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    placeholder="أدخل وصفاً مفصلاً للمهمة"
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="status"
                  >
                    الحالة
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  >
                    <option value="incomplete">قيد التنفيذ</option>
                    <option value="complete">مكتمل</option>
                  </select>
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? "جاري إضافة المهمة..." : "إضافة مهمة"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <footer className="bg-amber-400 py-3 md:py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center"></div>
      </footer>
    </div>
  );
};

export default AddTaskPage;
