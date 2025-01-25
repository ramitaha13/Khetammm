import React, { useState, useEffect } from "react";
import { LogIn, User, Eye, EyeOff, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, get, onValue } from "firebase/database";
import { app } from "../firebaseConfig";

const LoginPage = () => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const db = getDatabase(app);
    const profileRef = ref(db, "profile/imageURL");
    const unsubscribe = onValue(profileRef, (snapshot) => {
      const imageURL = snapshot.val();
      if (imageURL) {
        setProfileImage(imageURL);
      }
    });

    return () => unsubscribe();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) {
      newErrors.username = "اسم المستخدم مطلوب";
    }
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 6) {
      newErrors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    }
    if (!isVerified) {
      newErrors.verification = "يرجى التحقق من أنك لست روبوتًا";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const db = getDatabase(app);
        const userRef = ref(db, "user");
        const snapshot = await get(userRef);
        const userData = snapshot.val();

        if (
          userData &&
          userData.username === formData.username &&
          userData.password === formData.password
        ) {
          localStorage.setItem("username", formData.username);
          navigate("/mainpage");
        } else {
          setErrors({
            auth: "اسم المستخدم أو كلمة المرور غير صحيحة",
          });
        }
      } catch (error) {
        console.error("Error during login:", error);
        setErrors({
          auth: "حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
      dir="rtl"
    >
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="text-2xl font-bold text-blue-600">
              مكتب السكرتارية
            </div>
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
            >
              <span>العودة للرئيسية</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-1 mx-auto mb-6">
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={profileImage || "/api/placeholder/200/200"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-blue-600 mb-2">مرحباً</h1>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.auth && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  {errors.auth}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="أدخل اسم المستخدم"
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                {errors.username && (
                  <p className="text-red-500 text-sm">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="أدخل كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsVerified(!isVerified);
                    if (errors.verification) {
                      setErrors((prev) => ({ ...prev, verification: "" }));
                    }
                  }}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 transition-all duration-300"
                >
                  <span className="text-sm text-gray-600">أنا لست روبوتًا</span>
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center transition-colors duration-300 ${
                      isVerified ? "bg-blue-500" : "border-2 border-gray-300"
                    }`}
                  >
                    {isVerified && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
                {errors.verification && (
                  <p className="text-red-500 text-sm">{errors.verification}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl py-4 font-medium transition-all duration-300 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                <span
                  className={`flex items-center justify-center gap-2 ${
                    isLoading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <span>تسجيل الدخول</span>
                  <LogIn className="w-5 h-5" />
                </span>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
