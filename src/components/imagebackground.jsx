import React, { useState, useEffect } from "react";
import { Upload, Trash2, X } from "lucide-react";
import { getDatabase, ref, update, get, remove } from "firebase/database";
import axios from "axios";

// Background Image Upload Component
const BackgroundImageUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const IMGBB_API_KEY = "09fbbc889aa75bba791fff0e456cc668";

  useEffect(() => {
    const fetchCurrentBackground = async () => {
      try {
        const db = getDatabase();
        const backgroundRef = ref(db, "background");
        const snapshot = await get(backgroundRef);

        if (snapshot.exists() && snapshot.val().imageURL) {
          setCurrentImage(snapshot.val().imageURL);
        }
      } catch (err) {
        console.error("Error fetching current background:", err);
        setError("حدث خطأ أثناء تحميل صورة الخلفية الحالية");
      }
    };

    fetchCurrentBackground();
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

  const handleDeleteBackground = async () => {
    try {
      const db = getDatabase();
      const backgroundRef = ref(db, "background/imageURL");
      await remove(backgroundRef);

      setCurrentImage(null);
      setSuccess("تم حذف صورة الخلفية بنجاح");
      setShowDeleteConfirm(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error deleting background:", err);
      setError("حدث خطأ أثناء حذف صورة الخلفية");
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
      const backgroundRef = ref(db, "background");
      await update(backgroundRef, {
        imageURL: imageUrl,
      });

      setCurrentImage(imageUrl);
      setSuccess("تم رفع صورة الخلفية بنجاح");
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
    <div className="bg-white rounded-xl p-4 md:p-8 max-w-2xl mx-auto mb-24">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-right">
        تحميل صورة الخلفية
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
        {/* Current Background Display */}
        {currentImage && (
          <div className="relative w-full">
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img
                src={currentImage}
                alt="Current background"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
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
              <p className="mb-6">هل أنت متأكد من حذف صورة الخلفية؟</p>
              <div className="flex justify-end space-x-2 space-x-reverse">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteBackground}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Background Preview */}
        {imagePreview && !currentImage && (
          <div className="w-full h-48 rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-right w-full"
          />
        </div>

        <div className="flex justify-end w-full">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file}
            className="flex items-center bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
          >
            <span className="ml-2">رفع صورة الخلفية</span>
            <Upload className="h-5 w-5" />
          </button>
        </div>

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

export default BackgroundImageUpload;
