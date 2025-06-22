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
            מחולל תוכן דו-לשוני | مولد المحتوى ثنائي اللغة
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
  const [generatedContentArabic, setGeneratedContentArabic] = useState("");
  const [generatedContentHebrew, setGeneratedContentHebrew] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Gemini API configuration
  const API_KEY = "AIzaSyAmcBSSX4S4fTkAhCmegZkDUOmou-dvSIo";
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  const generateContent = async () => {
    if (!description.trim()) {
      setError("يرجى إدخال النص المطلوب / אנא הזן את הטקסט הרצוי");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate Arabic response
      const arabicPrompt = `${description}

أجب على هذا الطلب باللغة العربية بشكل واضح ومفصل. اكتب الإجابة مباشرة دون أي تفسيرات إضافية.`;

      // Generate Hebrew response
      const hebrewPrompt = `${description}

ענה על הבקשה הזו בעברית בצורה ברורה ומפורטת. כתוב את התשובה ישירות ללא הסברים נוספים.`;

      // Generate Arabic content
      const arabicResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: arabicPrompt,
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
        }),
      });

      if (!arabicResponse.ok) {
        const errorData = await arabicResponse.json();
        throw new Error(
          errorData.error?.message || `API error: ${arabicResponse.status}`
        );
      }

      const arabicData = await arabicResponse.json();

      // Generate Hebrew content
      const hebrewResponse = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: hebrewPrompt,
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
        }),
      });

      if (!hebrewResponse.ok) {
        const errorData = await hebrewResponse.json();
        throw new Error(
          errorData.error?.message || `API error: ${hebrewResponse.status}`
        );
      }

      const hebrewData = await hebrewResponse.json();

      // Process Arabic response
      if (arabicData.candidates && arabicData.candidates[0]?.content) {
        const arabicText = arabicData.candidates[0].content.parts[0].text;
        setGeneratedContentArabic(arabicText);
      } else {
        setError("لم يتم تلقي استجابة صالحة باللغة العربية");
      }

      // Process Hebrew response
      if (hebrewData.candidates && hebrewData.candidates[0]?.content) {
        const hebrewText = hebrewData.candidates[0].content.parts[0].text;
        setGeneratedContentHebrew(hebrewText);
      } else {
        setError("לא התקבלה תגובה תקינה בעברית");
      }
    } catch (err) {
      console.error("Error generating content:", err);
      setError(`خطأ في توليد المحتوى / שגיאה ביצירת התוכן: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedContentArabic.trim() && !generatedContentHebrew.trim()) {
      setError("لا يوجد محتوى لتحميله / אין תוכן להורדה");
      return;
    }

    // Create new document with both languages
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
          children: [
            // Arabic content
            new Paragraph({
              text: "النسخة العربية:",
              bidirectional: true,
              alignment: "right",
              spacing: { after: 400 },
              style: {
                run: {
                  bold: true,
                  size: 28,
                },
              },
            }),
            ...generatedContentArabic.split("\n").map(
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
            // Separator
            new Paragraph({
              text: "─────────────────────────────",
              alignment: "center",
              spacing: { before: 600, after: 600 },
            }),
            // Hebrew content
            new Paragraph({
              text: "הגרסה העברית:",
              bidirectional: true,
              alignment: "right",
              spacing: { after: 400 },
              style: {
                run: {
                  bold: true,
                  size: 28,
                },
              },
            }),
            ...generatedContentHebrew.split("\n").map(
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
          ],
        },
      ],
    });

    // Generate and download document
    try {
      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, "bilingual-content.docx");
    } catch (error) {
      console.error("Error creating document:", error);
      setError("خطأ في إنشاء المستند / שגיאה ביצירת המסמך");
    }
  };

  const clearContent = () => {
    setGeneratedContentArabic("");
    setGeneratedContentHebrew("");
    setDescription("");
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 max-w-6xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-center">
        מחולל תוכן דו-לשוני | مولد المحتوى ثنائي اللغة
      </h2>

      <div className="space-y-6">
        {/* Description Input */}
        <div>
          <label
            htmlFor="description"
            className="block text-center text-gray-700 text-sm font-bold mb-2"
          >
            הזן בקשה בכל שפה | أدخل طلبك بأي لغة
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            placeholder="مثال: اكتب قصة قصيرة عن الصداقة | דוגמה: כתוב סיפור קצר על חברות | Example: Write a short story about friendship"
            required
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={generateContent}
            disabled={isGenerating || !description.trim()}
            className={`flex items-center px-8 py-3 rounded-lg transition-colors text-lg
              ${
                isGenerating || !description.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin ml-2" />
                <span>יוצר תוכן... | جاري التوليد...</span>
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 ml-2" />
                <span>צור תוכן | توليد المحتوى</span>
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start text-red-700">
              <AlertCircle className="h-5 w-5 ml-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-center flex-1">{error}</p>
            </div>
          </div>
        )}

        {/* Generated Content */}
        {(generatedContentArabic || generatedContentHebrew) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Arabic Content */}
            {generatedContentArabic && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <button
                    onClick={() => setGeneratedContentArabic("")}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    مسح
                  </button>
                  <label className="block text-right text-gray-700 text-sm font-bold">
                    النسخة العربية
                  </label>
                </div>
                <textarea
                  value={generatedContentArabic}
                  onChange={(e) => setGeneratedContentArabic(e.target.value)}
                  rows={15}
                  dir="rtl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right bg-gray-50"
                />
              </div>
            )}

            {/* Hebrew Content */}
            {generatedContentHebrew && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-right text-gray-700 text-sm font-bold">
                    הגרסה העברית
                  </label>
                  <button
                    onClick={() => setGeneratedContentHebrew("")}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    נקה
                  </button>
                </div>
                <textarea
                  value={generatedContentHebrew}
                  onChange={(e) => setGeneratedContentHebrew(e.target.value)}
                  rows={15}
                  dir="rtl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right bg-gray-50"
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {(generatedContentArabic || generatedContentHebrew) && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={clearContent}
              className="flex items-center bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <span className="ml-2">נקה הכل | مسح الكل</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span className="ml-2">הורד קובץ | تحميل ملف</span>
              <Download className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-bold text-blue-900 mb-2 text-center">
            אופן השימוש | كيفية الاستخدام
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <ul className="space-y-1 text-right">
              <li>• اكتب طلبك بأي لغة تريد</li>
              <li>• اضغط على "توليد المحتوى"</li>
              <li>• ستحصل على إجابتين: بالعربية والعبرية</li>
              <li>• يمكنك تعديل النصوص قبل التحميل</li>
              <li>• اضغط "تحميل ملف" لحفظ المحتوى</li>
            </ul>
            <ul className="space-y-1 text-right">
              <li>• כתוב את הבקשה שלך בכל שפה</li>
              <li>• לחץ על "צור תוכן"</li>
              <li>• תקבל שתי תשובות: בערבית ובעברית</li>
              <li>• ניתן לערוך את הטקסטים לפני ההורדה</li>
              <li>• לחץ "הורד קובץ" לשמירת התוכן</li>
            </ul>
          </div>
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
