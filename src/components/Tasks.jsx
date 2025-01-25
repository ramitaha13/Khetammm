import React, { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  onValue,
  remove,
  update,
  get,
} from "firebase/database";
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

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date: "",
    title: "",
    status: "",
  });

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username || username !== "Khetam") {
      navigate("/");
      return;
    }

    const fetchTasks = () => {
      const db = getDatabase();
      const tasksRef = ref(db, "tasks");

      onValue(
        tasksRef,
        (snapshot) => {
          setIsLoading(true);
          try {
            const data = snapshot.val();
            if (data) {
              const tasksArray = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...value,
              }));

              const sortedTasks = tasksArray.sort((a, b) => {
                if (a.status === b.status) {
                  return new Date(b.date) - new Date(a.date);
                }
                return a.status === "incomplete" ? -1 : 1;
              });

              setTasks(sortedTasks);
              setFilteredTasks(sortedTasks);
            } else {
              setTasks([]);
              setFilteredTasks([]);
            }
            setError(null);
          } catch (err) {
            setError("خطأ في جلب المهام");
            console.error("Error fetching tasks:", err);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          setError("خطأ في الاتصال بقاعدة البيانات");
          setIsLoading(false);
          console.error("Database error:", error);
        }
      );
    };

    fetchTasks();
  }, [navigate]);

  const handleDelete = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذه المهمة؟");
    if (!confirmed) return;

    try {
      const db = getDatabase();

      // Delete the task
      const taskRef = ref(db, `tasks/${taskId}`);
      await remove(taskRef);

      // Find and delete corresponding notification
      const notificationsRef = ref(db, "notifications");
      const notificationsSnapshot = await get(notificationsRef);

      if (notificationsSnapshot.exists()) {
        const notifications = notificationsSnapshot.val();

        // Find notifications that match this task's title in the 'task' field
        Object.entries(notifications).forEach(
          async ([notificationId, notification]) => {
            if (notification.task === task.title) {
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
      setError("خطأ في حذف المهمة");
      console.error("Error deleting task:", err);
    }
  };

  const handleExportToExcel = () => {
    const dataToExport = filteredTasks.map((task) => ({
      التاريخ: formatDate(task.date),
      العنوان: task.title,
      الوصف: task.description,
      الحالة: task.status === "complete" ? "مكتمل" : "قيد التنفيذ",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport, {
      header: ["التاريخ", "العنوان", "الوصف", "الحالة"],
    });

    ws["!rtl"] = true;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المهام");

    XLSX.writeFile(wb, "المهام.xlsx");
  };

  const handleStatusToggle = async (taskId, currentStatus) => {
    try {
      const db = getDatabase();
      const taskRef = ref(db, `tasks/${taskId}`);
      const newStatus =
        currentStatus === "complete" ? "incomplete" : "complete";

      await update(taskRef, {
        status: newStatus,
      });
    } catch (err) {
      setError("خطأ في تحديث حالة المهمة");
      console.error("Error updating task status:", err);
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

    let filtered = [...tasks];
    if (newFilters.date) {
      filtered = filtered.filter((task) =>
        formatDate(task.date).includes(newFilters.date)
      );
    }
    if (newFilters.title) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(newFilters.title.toLowerCase())
      );
    }
    if (newFilters.status) {
      filtered = filtered.filter((task) => task.status === newFilters.status);
    }
    setFilteredTasks(filtered);
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

    if (tasks.length === 0) {
      return (
        <div className="text-center text-white text-lg">لا توجد مهام للعرض</div>
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
              عدد المهام: {filteredTasks.length}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="بحث حسب التاريخ"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
            <input
              type="text"
              placeholder="بحث حسب العنوان"
              value={filters.title}
              onChange={(e) => handleFilterChange("title", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            >
              <option value="">كل الحالات</option>
              <option value="complete">مكتمل</option>
              <option value="incomplete">قيد التنفيذ</option>
            </select>
          </div>
        </div>
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                العنوان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الوصف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                حذف
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {formatDate(task.date)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {task.title}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm text-gray-500">
                    {task.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleStatusToggle(task.id, task.status)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors duration-200 ${
                      task.status === "complete"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    }`}
                  >
                    {task.status === "complete" ? "مكتمل" : "قيد التنفيذ"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleDelete(task.id)}
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
              مهام للقيام بها
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

export default TasksPage;
