import React, { useState, useEffect } from "react";
import { LogOut, ArrowRight, MapPin, Trash2 } from "lucide-react";
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

const AddressCard = ({ name, address, id, onDelete }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-all duration-300 relative">
      <button
        onClick={() => onDelete(id)}
        className="absolute top-2 left-2 text-red-400 hover:text-red-600 transition-colors"
      >
        <Trash2 className="h-5 w-5" />
      </button>
      <div className="flex items-center justify-center mb-3">
        <MapPin className="h-8 w-8 text-white" />
      </div>
      <p className="text-white text-lg font-medium mb-2 text-center">{name}</p>
      <p className="text-white text-base text-center hover:text-amber-400 transition-colors duration-200">
        {address}
      </p>
    </div>
  );
};

const AddressPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    address: "",
  });

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username || username !== "Khetam") {
      navigate("/");
      return;
    }

    const db = getDatabase();
    const addressesRef = ref(db, "address");

    const unsubscribe = onValue(
      addressesRef,
      (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            const addressesArray = Object.entries(data).map(([id, value]) => ({
              id,
              ...value,
            }));
            setAddresses(addressesArray);
            setFilteredAddresses(addressesArray);
          } else {
            setAddresses([]);
            setFilteredAddresses([]);
          }
          setLoading(false);
        } catch (err) {
          setError("Error fetching addresses");
          setLoading(false);
        }
      },
      (error) => {
        setError("Error fetching addresses");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [navigate]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    let filtered = [...addresses];
    if (newFilters.name) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(newFilters.name.toLowerCase())
      );
    }
    if (newFilters.address) {
      filtered = filtered.filter((item) =>
        item.address.toLowerCase().includes(newFilters.address.toLowerCase())
      );
    }
    setFilteredAddresses(filtered);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذا العنوان؟");
    if (!confirmed) return;

    try {
      const db = getDatabase();
      const addressRef = ref(db, `address/${id}`);
      await remove(addressRef);
    } catch (err) {
      setError("Error deleting address");
      console.error("Error deleting address:", err);
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-cyan-600 via-blue-800 to-cyan-600">
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-12">
          <div className="bg-gradient-to-r from-blue-800 to-cyan-600 rounded-xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 text-center">
              العناوين المحفوظة
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <input
                type="text"
                placeholder="بحث حسب الاسم"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
              <input
                type="text"
                placeholder="بحث حسب العنوان"
                value={filters.address}
                onChange={(e) => handleFilterChange("address", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              />
            </div>
            <div className="text-white text-lg mb-4 text-right">
              عدد العناوين: {filteredAddresses.length}
            </div>
            {loading ? (
              <div className="text-white text-center">جاري التحميل...</div>
            ) : error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : filteredAddresses.length === 0 ? (
              <div className="text-white text-center">
                لا توجد عناوين محفوظة
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAddresses.map((item) => (
                  <AddressCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    address={item.address}
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

export default AddressPage;
