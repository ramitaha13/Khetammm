import React, { useState, useEffect } from "react";
import { LogOut, ArrowRight, Mail, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, remove } from "firebase/database";

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

          <h1 className="text-2xl font-bold text-blue-900">
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

// Rest of your code remains exactly the same
const EmailCard = ({ nameOwner, emailAddress, id, onDelete }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 relative">
      <button
        onClick={() => onDelete(id)}
        className="absolute top-2 left-2 text-red-400 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-5 w-5" />
      </button>
      <div className="flex items-center justify-center mb-3">
        <Mail className="h-8 w-8 text-white" />
      </div>
      <p className="text-white text-lg font-medium mb-2 text-center">
        {nameOwner}
      </p>
      <a
        href={`mailto:${emailAddress}`}
        className="text-white text-xl hover:text-amber-400 transition-colors duration-200 flex justify-center items-center gap-2 break-all"
      >
        {emailAddress}
      </a>
    </div>
  );
};

const EmailImportantPage = () => {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [filters, setFilters] = useState({
    nameOwner: "",
    emailAddress: "",
  });

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

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = [...emails];
    if (newFilters.nameOwner) {
      filtered = filtered.filter((email) =>
        email.nameOwner
          .toLowerCase()
          .includes(newFilters.nameOwner.toLowerCase())
      );
    }
    if (newFilters.emailAddress) {
      filtered = filtered.filter((email) =>
        email.emailAddress
          .toLowerCase()
          .includes(newFilters.emailAddress.toLowerCase())
      );
    }
    setFilteredEmails(filtered);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذا الايميل؟");
    if (!confirmed) return;

    try {
      const db = getDatabase();
      const emailRef = ref(db, `emails/${id}`);
      await remove(emailRef);
    } catch (err) {
      setError("Error deleting email");
      console.error("Error deleting email:", err);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;

    const db = getDatabase();
    const emailsRef = ref(db, "emails");

    const unsubscribe = onValue(
      emailsRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const emailsArray = Object.entries(data).map(([id, value]) => ({
              id,
              ...value,
            }));
            setEmails(emailsArray);
            setFilteredEmails(emailsArray);
          } else {
            setEmails([]);
            setFilteredEmails([]);
          }
          setLoading(false);
        } catch (err) {
          setError("Error fetching emails");
          setLoading(false);
        }
      },
      (error) => {
        setError("Error fetching emails");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthorized]);

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-cyan-600 via-blue-800 to-cyan-600">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          <div className="bg-gradient-to-r from-blue-800 to-cyan-600 rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
              إيميلات يجب تذكرها
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="بحث حسب الاسم"
                value={filters.nameOwner}
                onChange={(e) =>
                  handleFilterChange("nameOwner", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
              <input
                type="text"
                placeholder="بحث حسب الايميل"
                value={filters.emailAddress}
                onChange={(e) =>
                  handleFilterChange("emailAddress", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            <div className="text-white text-lg mb-4 text-right">
              عدد الايميلات: {filteredEmails.length}
            </div>
            {loading ? (
              <div className="text-white text-center">جاري التحميل...</div>
            ) : error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-white text-center">لا توجد إيميلات</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmails.map((email) => (
                  <EmailCard
                    key={email.id}
                    id={email.id}
                    nameOwner={email.nameOwner}
                    emailAddress={email.emailAddress}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <footer className="bg-amber-400 py-3 md:py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center"></div>
      </footer>
    </div>
  );
};

export default EmailImportantPage;
