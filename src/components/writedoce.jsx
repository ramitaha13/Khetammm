import React, { useState, useEffect } from "react";
import { LogOut, ArrowRight, Download } from "lucide-react";
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
  const [content, setContent] = useState("");

  const handleDownload = async () => {
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
          children: content.split("\n").map(
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
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-blue-900 mb-6 text-right">
        كتابة مستند جديد
      </h2>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="content"
            className="block text-right text-gray-700 text-sm font-bold mb-2"
          >
            نص المستند
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            dir="rtl"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
            required
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleDownload}
            className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="ml-2">تحميل كملف Word</span>
            <Download className="h-5 w-5" />
          </button>
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
