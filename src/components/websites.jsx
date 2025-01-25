import React, { useState, useEffect } from "react";
import { LogOut, ArrowRight, Globe, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, remove } from "firebase/database";

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

const WebsiteCard = ({ siteName, siteUrl, description, id, onDelete }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 relative">
      <button
        onClick={() => onDelete(id)}
        className="absolute top-2 left-2 text-red-400 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-5 w-5" />
      </button>
      <div className="flex items-center justify-center mb-3">
        <Globe className="h-8 w-8 text-white" />
      </div>
      <p className="text-white text-lg font-medium mb-2 text-center">
        {siteName}
      </p>
      <p className="text-white/80 text-sm mb-4 text-center">{description}</p>
      <div className="text-center">
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-xl hover:text-amber-400 transition-colors duration-200 flex justify-center items-center gap-2 inline-flex"
        >
          <ExternalLink className="h-5 w-5" />
          {siteUrl}
        </a>
      </div>
    </div>
  );
};

const WebsitesPage = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    siteName: "",
    description: "",
  });

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username || username !== "Khetam") {
      navigate("/");
      return;
    }

    const db = getDatabase();
    const websitesRef = ref(db, "websites");

    const unsubscribe = onValue(
      websitesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const websitesArray = Object.entries(data).map(([id, value]) => ({
              id,
              ...value,
            }));
            setWebsites(websitesArray);
            setFilteredWebsites(websitesArray);
          } else {
            setWebsites([]);
            setFilteredWebsites([]);
          }
          setLoading(false);
        } catch (err) {
          setError("حدث خطأ في جلب المواقع");
          setLoading(false);
        }
      },
      (error) => {
        setError("حدث خطأ في جلب المواقع");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = [...websites];
    if (newFilters.siteName) {
      filtered = filtered.filter((website) =>
        website.siteName
          .toLowerCase()
          .includes(newFilters.siteName.toLowerCase())
      );
    }
    if (newFilters.description) {
      filtered = filtered.filter((website) =>
        website.description
          .toLowerCase()
          .includes(newFilters.description.toLowerCase())
      );
    }
    setFilteredWebsites(filtered);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("هل انت متأكد انك تريد حذف هذا الموقع؟");
    if (!confirmed) return;

    try {
      const db = getDatabase();
      const websiteRef = ref(db, `websites/${id}`);
      await remove(websiteRef);
    } catch (err) {
      setError("حدث خطأ في حذف الموقع");
      console.error("Error deleting website:", err);
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-cyan-600 via-blue-800 to-cyan-600">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          <div className="bg-gradient-to-r from-blue-800 to-cyan-600 rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
              مواقع مهمة
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="بحث حسب اسم الموقع"
                value={filters.siteName}
                onChange={(e) => handleFilterChange("siteName", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
              <input
                type="text"
                placeholder="بحث حسب الوصف"
                value={filters.description}
                onChange={(e) =>
                  handleFilterChange("description", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            <div className="text-white text-lg mb-4 text-right">
              عدد المواقع: {filteredWebsites.length}
            </div>
            {loading ? (
              <div className="text-white text-center">جاري التحميل...</div>
            ) : error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : filteredWebsites.length === 0 ? (
              <div className="text-white text-center">لا يوجد مواقع</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWebsites.map((website) => (
                  <WebsiteCard
                    key={website.id}
                    id={website.id}
                    siteName={website.siteName}
                    siteUrl={website.siteUrl}
                    description={website.description}
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

export default WebsitesPage;
