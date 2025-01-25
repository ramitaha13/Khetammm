import React, { useState, useEffect, useRef } from "react";
import { getDatabase, ref, onValue, remove, get } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { LogOut, ArrowRight, Trash2, Download, Image } from "lucide-react";
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

const TodayDatesPage = () => {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [filteredDates, setFilteredDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState({
    date: "",
    day: "",
    title: "",
    content: "",
  });
  const tableRef = useRef(null);

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
              const datesArray = Object.entries(data)
                .map(([key, value]) => ({
                  id: key,
                  ...value,
                  day: value.day || getDayName(value.date),
                }))
                .filter((date) => isSameDay(new Date(date.date), today));

              const sortedDates = datesArray.sort(
                (a, b) => new Date(a.date) - new Date(b.date)
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
    XLSX.utils.book_append_sheet(wb, ws, "مواعيد اليوم");

    XLSX.writeFile(wb, "مواعيد_اليوم.xlsx");
  };

  const prepareForExport = () => {
    if (tableRef.current) {
      const containerDiv = document.createElement("div");
      containerDiv.style.backgroundColor = "#ffffff";
      containerDiv.style.padding = "20px";
      containerDiv.style.width = "fit-content";

      const tableCopy = tableRef.current.cloneNode(true);
      tableCopy.style.width = "auto";
      tableCopy.style.maxWidth = "none";
      tableCopy.style.whiteSpace = "nowrap";

      containerDiv.appendChild(tableCopy);
      return containerDiv;
    }
    return null;
  };

  const handleExportToImage = async () => {
    try {
      setIsExporting(true);
      const html2canvas = (await import("html2canvas")).default;

      const exportElement = prepareForExport();
      if (!exportElement) return;

      document.body.appendChild(exportElement);

      const canvas = await html2canvas(exportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: exportElement.offsetWidth,
        height: exportElement.offsetHeight,
        windowWidth: exportElement.offsetWidth,
        windowHeight: exportElement.offsetHeight,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.body.lastChild;
          clonedElement.style.width = "auto";
          clonedElement.style.height = "auto";
          clonedElement.style.position = "relative";
        },
      });

      document.body.removeChild(exportElement);

      const image = canvas.toDataURL("image/png", 1.0);
      const downloadLink = document.createElement("a");
      downloadLink.href = image;
      downloadLink.download = "مواعيد_اليوم.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Error exporting to image:", err);
      alert("حدث خطأ أثناء تصدير الصورة");
    } finally {
      setIsExporting(false);
    }
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

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
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
          لا توجد مواعيد اليوم
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-4">
              <button
                onClick={handleExportToExcel}
                className="flex items-center bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors duration-200 ml-4"
              >
                <Download className="h-5 w-5 ml-2" />
                تصدير إلى Excel
              </button>
              <button
                onClick={handleExportToImage}
                className="flex items-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
              >
                <Image className="h-5 w-5 ml-2" />
                تصدير كصورة
              </button>
            </div>
            <div className="text-gray-600">
              عدد المواعيد: {filteredDates.length}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
        <div className="overflow-x-auto">
          <div ref={tableRef} className="min-w-full">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isExporting ? "Date" : "التاريخ"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isExporting ? "Day" : "اليوم"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isExporting ? "Title" : "العنوان"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isExporting ? "Status" : "المحتوى"}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isExporting ? "Delete" : "حذف"}
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
                      <div className="text-sm text-gray-500">
                        {date.content}
                      </div>
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
        </div>
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
              مواعيد اليوم
            </h1>
          </div>
          {renderContent()}
        </div>
      </main>
      <footer className="bg-amber-400 py-3 md:py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          {/* Footer content if needed */}
        </div>
      </footer>
    </div>
  );
};

export default TodayDatesPage;
