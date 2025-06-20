import React, { useState, useEffect } from "react";
import {
  LogOut,
  ArrowRight,
  Download,
  Zap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

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

const WriteDocForm = () => {
  const [description, setDescription] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Gemini API configuration
  const API_KEY = "AIzaSyAmcBSSX4S4fTkAhCmegZkDUOmou-dvSIo";
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  const generateContent = async () => {
    if (!description.trim()) {
      setError("يرجى إدخال وصف للمستند");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `أكتب مستنداً رسمياً باللغة العربية بناءً على الوصف التالي: "${description}"

يجب أن يكون المستند:
- مكتوباً بصيغة رسمية ومناسبة للسلطة المحلية
- منظماً ومنسقاً بشكل جيد
- يحتوي على عناصر المستند الرسمي (التاريخ، المقدمة، المحتوى، الخاتمة)
- مكتوباً بلغة عربية فصيحة ومفهومة
- يتراوح طوله بين 200-500 كلمة حسب طبيعة الموضوع

اكتب المستند مباشرة دون أي تفسيرات إضافية.`;

      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      };

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || `API error: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content) {
        const responseText = data.candidates[0].content.parts[0].text;
        setGeneratedContent(responseText);
      } else if (data.promptFeedback && data.promptFeedback.blockReason) {
        setError(`تم حجب الاستجابة: ${data.promptFeedback.blockReason}`);
      } else {
        setError("تم تلقي استجابة فارغة أو غير صالحة من الخدمة");
      }
    } catch (err) {
      console.error("Error generating content:", err);
      setError(`خطأ في توليد المحتوى: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedContent.trim()) {
      setError("لا يوجد محتوى لتحميله");
      return;
    }

    // Create new document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: generatedContent.split("\n").map(
            (line) =>
              new Paragraph({
                text: line,
                bidirectional: true,
                alignment: "right",
                spacing: {
                  after: 200,
                },
              })
          ),
        },
      ],
    });

    // Generate and download document
    try {
      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, "document.docx");
    } catch (error) {
      console.error("Error creating document:", error);
      setError("خطأ في إنشاء المستند");
    }
  };

  const clearContent = () => {
    setGeneratedContent("");
    setDescription("");
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-right">
        مولد المستندات بالذكاء الاصطناعي
      </h2>

      <div className="space-y-6">
        {/* Description Input */}
        <div>
          <label
            htmlFor="description"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            وصف المستند المطلوب
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            dir="rtl"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            placeholder="مثال: كتابة خطاب رسمي لطلب إجازة، أو مذكرة إدارية حول تنظيم الاجتماعات، أو تقرير عن نشاط معين..."
            required
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <button
            onClick={generateContent}
            disabled={isGenerating || !description.trim()}
            className={`flex items-center px-6 py-2 rounded-lg transition-colors
              ${
                isGenerating || !description.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin ml-2" />
                <span>جاري التوليد...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 ml-2" />
                <span>توليد المستند</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start text-red-700">
              <AlertCircle className="h-5 w-5 ml-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-right flex-1">{error}</p>
            </div>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={clearContent}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                مسح المحتوى
              </button>
              <label className="block text-right text-gray-700 text-sm font-bold">
                المستند المولد
              </label>
            </div>
            <textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              rows={15}
              dir="rtl"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-2 text-right">
              يمكنك تعديل النص المولد حسب احتياجاتك قبل التحميل
            </p>
          </div>
        )}

        {/* Download Button */}
        {generatedContent && (
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleDownload}
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="ml-2">تحميل كملف Word</span>
              <Download className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-bold text-blue-900 mb-2 text-right">
            كيفية الاستخدام:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 text-right">
            <li>• اكتب وصفاً واضحاً للمستند الذي تريد إنشاؤه</li>
            <li>• اضغط على "توليد المستند" لتوليد المحتوى بالذكاء الاصطناعي</li>
            <li>• راجع المحتوى المولد وعدّله إذا لزم الأمر</li>
            <li>• اضغط على "تحميل كملف Word" لحفظ المستند</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const WriteDocPage = () => {
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
          <WriteDocForm />
        </div>
      </main>
      <footer className="bg-amber-400 py-3 md:py-4 fixed bottom-0 w-full">
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center"></div>
      </footer>
    </div>
  );
};

export default WriteDocPage;
