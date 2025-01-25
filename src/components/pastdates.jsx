import React, { useState, useEffect } from "react";
import { getDatabase, ref, onValue, remove, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowRight, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";

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

const PastDatesPage = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [filteredDates, setFilteredDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: "",
    day: "",
    title: "",
    content: "",
  });

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = [
      "الأحد",
      "الاثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    return days[date.getDay()];
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username || username !== "Khetam") {
      navigate("/");
      return;
    }

    const fetchDates = () => {
      const db = getDatabase();
      const datesRef = ref(db, "dates");

      onValue(
        datesRef,
        (snapshot) => {
          setIsLoading(true);
          try {
            const data = snapshot.val();
            if (data) {
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const datesArray = Object.entries(data)
                .map(([key, value]) => ({
                  id: key,
                  ...value,
                  day: value.day || getDayName(value.date),
                }))
                .filter((date) => {
                  const dateObj = new Date(date.date);
                  dateObj.setHours(0, 0, 0, 0);
                  return dateObj < today;
                });

              const sortedDates = datesArray.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
              );
              setDates(sortedDates);
              setFilteredDates(sortedDates);
            } else {
              setDates([]);
              setFilteredDates([]);
            }
            setError(null);
          } catch (err) {
            setError("Error fetching dates");
            console.error("Error fetching dates:", err);
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
    };

    fetchDates();
  }, [navigate]);

  const handleExportToExcel = () => {
    const dataToExport = filteredDates.map((date) => ({
      التاريخ: formatDate(date.date),
      اليوم: date.day || getDayName(date.date),
      العنوان: date.title,
      المحتوى: date.content,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport, {
      header: ["التاريخ", "اليوم", "العنوان", "المحتوى"],
    });

    ws["!rtl"] = true;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "مواعيد سابقة");

    XLSX.writeFile(wb, "مواعيد_سابقة.xlsx");
  };

  const handleDelete = async (dateId) => {
    const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذا الموعد؟");
    if (!confirmed) return;

    try {
      const db = getDatabase();
      const dateRef = ref(db, `dates/${dateId}`);

      // Get the date details before deleting
      const dateSnapshot = await get(dateRef);
      const dateData = dateSnapshot.val();

      // Delete the date
      await remove(dateRef);

      // Find and delete corresponding notification
      if (dateData) {
        const notificationsRef = ref(db, "notifications");
        const notificationsSnapshot = await get(notificationsRef);

        if (notificationsSnapshot.exists()) {
          const notifications = notificationsSnapshot.val();

          // Find notifications that match this date's title in the import field
          Object.entries(notifications).forEach(
            async ([notificationId, notification]) => {
              if (notification.import === dateData.title) {
                const notificationRef = ref(
                  db,
                  `notifications/${notificationId}`
                );
                await remove(notificationRef);
              }
            }
          );
        }
      }
    } catch (err) {
      setError("Error deleting date");
      console.error("Error deleting date:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = [...dates];
    if (newFilters.date) {
      filtered = filtered.filter((date) =>
        formatDate(date.date).includes(newFilters.date)
      );
    }
    if (newFilters.day) {
      filtered = filtered.filter((date) =>
        (date.day || getDayName(date.date)).includes(newFilters.day)
      );
    }
    if (newFilters.title) {
      filtered = filtered.filter((date) =>
        date.title.toLowerCase().includes(newFilters.title.toLowerCase())
      );
    }
    if (newFilters.content) {
      filtered = filtered.filter((date) =>
        date.content.toLowerCase().includes(newFilters.content.toLowerCase())
      );
    }
    setFilteredDates(filtered);
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

    if (dates.length === 0) {
      return (
        <div className="text-center text-white text-lg">
          لا توجد مواعيد سابقة
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleExportToExcel}
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200"
            >
              <Download className="h-5 w-5 ml-2" />
              تصدير إلى Excel
            </button>
            <div className="text-gray-600">
              عدد المواعيد: {filteredDates.length}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="بحث حسب التاريخ"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
            <input
              type="text"
              placeholder="بحث حسب اليوم"
              value={filters.day}
              onChange={(e) => handleFilterChange("day", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
            <input
              type="text"
              placeholder="بحث حسب العنوان"
              value={filters.title}
              onChange={(e) => handleFilterChange("title", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
            <input
              type="text"
              placeholder="بحث حسب المحتوى"
              value={filters.content}
              onChange={(e) => handleFilterChange("content", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
          </div>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اليوم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العنوان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المحتوى
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                حذف
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDates.map((date) => (
              <tr key={date.id}>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {formatDate(date.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {date.day || getDayName(date.date)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {date.title}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm text-gray-500">{date.content}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(date.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              مواعيد سابقة
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

export default PastDatesPage;
