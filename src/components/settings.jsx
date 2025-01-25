import React, { useState, useEffect } from "react";
import {
  LogOut,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, update, get, remove } from "firebase/database";
import axios from "axios";
import BackgroundImageUpload from "/src/components/imagebackground";

// Header Component
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

          <h1 className="text-2xl font-bold text-blue-900">الإعدادات</h1>

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

// Password Change Component
const PasswordChangeForm = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    if (newPassword.length < 7) {
      setError("كلمة المرور يجب أن تكون 7 أحرف على الأقل");
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("كلمات المرور الجديدة غير متطابقة");
      setIsSubmitting(false);
      return;
    }

    try {
      const db = getDatabase();
      const userRef = ref(db, "user");

      const snapshot = await get(userRef);
      if (!snapshot.exists() || snapshot.val().password !== currentPassword) {
        setError("كلمة المرور الحالية غير صحيحة");
        setIsSubmitting(false);
        return;
      }

      await update(userRef, {
        password: newPassword,
      });

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/mainpage");
      }, 1500);
    } catch (err) {
      setError("حدث خطأ أثناء تحديث كلمة المرور");
      console.error("Error updating password:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 max-w-2xl mx-auto mb-6">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-right">
        تغيير كلمة المرور
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-right">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-right">
          <span className="block sm:inline">تم تغيير كلمة المرور بنجاح</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label
            htmlFor="currentPassword"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            كلمة المرور الحالية
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <label
            htmlFor="newPassword"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <label
            htmlFor="confirmPassword"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            تأكيد كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            <span className="ml-2">تغيير كلمة المرور</span>
            <Lock className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

// Profile Image Upload Component
const ProfileImageUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const IMGBB_API_KEY = "09fbbc889aa75bba791fff0e456cc668";

  useEffect(() => {
    const fetchCurrentImage = async () => {
      try {
        const db = getDatabase();
        const profileRef = ref(db, "profile");
        const snapshot = await get(profileRef);

        if (snapshot.exists() && snapshot.val().imageURL) {
          setCurrentImage(snapshot.val().imageURL);
        }
      } catch (err) {
        console.error("Error fetching current image:", err);
        setError("حدث خطأ أثناء تحميل الصورة الحالية");
      }
    };

    fetchCurrentImage();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 16 * 1024 * 1024) {
        setError("حجم الملف كبير جداً. الحد الأقصى هو 16 ميغابايت");
        return;
      }

      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDeleteImage = async () => {
    try {
      const db = getDatabase();
      const profileRef = ref(db, "profile/imageURL");
      await remove(profileRef);

      setCurrentImage(null);
      setSuccess("تم حذف الصورة بنجاح");
      setShowDeleteConfirm(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error deleting image:", err);
      setError("حدث خطأ أثناء حذف الصورة");
      setShowDeleteConfirm(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("الرجاء اختيار صورة أولاً");
      return;
    }

    try {
      setError(null);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("key", IMGBB_API_KEY);

      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          },
        }
      );

      const imageUrl = response.data.data.url;

      const db = getDatabase();
      const profileRef = ref(db, "profile");
      await update(profileRef, {
        imageURL: imageUrl,
      });

      setCurrentImage(imageUrl);
      setSuccess("تم رفع الصورة بنجاح");
      setUploadProgress(0);
      setFile(null);
      setImagePreview(null);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError("حدث خطأ أثناء رفع الصورة");
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 max-w-2xl mx-auto mb-12">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-right">
        تحميل صورة الملف الشخصي
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 text-right">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 text-right">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="flex flex-col items-end space-y-4">
        {/* Current Image Display */}
        {currentImage && (
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden">
              <img
                src={currentImage}
                alt="Current profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="absolute top-0 right-0 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            dir="rtl"
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">تأكيد الحذف</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mb-6">هل أنت متأكد من حذف الصورة الشخصية؟</p>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteImage}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && !currentImage && (
          <div className="w-32 h-32 rounded-full overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="text-right w-full"
        />

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file}
          className="flex items-center bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
        >
          <span className="ml-2">رفع الصورة</span>
          <Upload className="h-5 w-5" />
        </button>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Page Component
const SettingsPage = () => {
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
          <PasswordChangeForm />
          <ProfileImageUpload />
          <BackgroundImageUpload />
        </div>
      </main>
      <footer className="bg-amber-400 py-3 md:py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center"></div>
      </footer>
    </div>
  );
};

export default SettingsPage;
