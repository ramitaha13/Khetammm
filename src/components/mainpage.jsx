import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  useRef,
} from "react";
import {
  LogOut,
  Building2,
  User,
  Calendar,
  Mail,
  Globe,
  FileText,
  MapPin,
  Briefcase,
  Settings,
  Globe2,
  ChevronRight,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, onValue, update } from "firebase/database";
import chatgpt1 from "/src/assets/2.JPG";
import Gemini1 from "/src/assets/3.JPG";
import gmail1 from "/src/assets/4.JPG";
import outlook1 from "/src/assets/5.JPG";
import whatsapp1 from "/src/assets/6.JPG";
import maps1 from "/src/assets/7.JPG";

const LanguageContext = createContext();

const translations = {
  ar: {
    settings: "الإعدادات",
    tasks: "مهام للقيام بها",
    addTasks: "إضافة مهمة",
    logout: "تسجيل الخروج",
    title: "مذكره السلطة المحلية كابول",
    notes: "ملاحظات",
    importantDates: "مواعيد هامة",
    todayDates: "مواعيد اليوم",
    expiredDates: "تواريخ منتهية الصلاحية",
    phoneNumbers: "ارقام هواتف",
    importantEmails: "إيميلات يجب تذكرها",
    writeDoc: "صياغة الوثيقة",
    addresses: "عناوين للتذكر",
    linksAndDirections: "روابط وتوجيهات",
    addNotes: "اضافة ملاحظات",
    addDates: "اضافة مواعيد هامة",
    addPhones: "اضافة ارقام هواتف",
    addEmail: "اضافة Email",
    addAddress: "إضافة عنوان",
    addWebsite: "إضافة موقع",
    contactUs: "تواصل معنا للمساعدة",
    husband: "زوجك",
    son: "ابنك",
    chatGPTDescription: "آلة تقوم بكل شيء من أجلك وتجعل حياتك سهلة",
    geminiDescription: "ذكاء اصطناعي متقدم يساعدك في جميع المهام",
    whatsappDescription: "تواصل بسهولة مع العائلة والأصدقاء",
    mapsDescription: "خريطة Google لمعرفة موقع كابول",
    importantWebsites: "مواقع مهمة",
    notifications: "الإشعارات",
    noNotifications: "لا توجد إشعارات",
  },
  he: {
    settings: "הגדרות",
    tasks: "משימות לעשות",
    addTasks: "הוסף משימה",
    logout: "התנתק",
    title: "יומן הרשות המקומית כאבול",
    notes: "הערות",
    importantDates: "תאריכים חשובים",
    todayDates: "תאריכי היום",
    expiredDates: "תאריכים שעברו תוקף",
    phoneNumbers: "מספרי טלפון",
    importantEmails: "אימיילים לזכור",
    writeDoc: "ניסוח מכתב",
    addresses: "כתובות לזכור",
    linksAndDirections: "קישורים והנחיות",
    addNotes: "הוסף הערות",
    addDates: "הוסף תאריכים חשובים",
    addPhones: "הוסף מספרי טלפון",
    addEmail: "הוסף אימייל",
    addAddress: "הוסף כתובת",
    addWebsite: "הוסף אתר",
    contactUs: "צור קשר לעזרה",
    husband: "בעלך",
    son: "בנך",
    chatGPTDescription: "מכונה שעושה הכל בשבילך והופכת את חייך לקלים",
    geminiDescription: "בינה מלאכותית מתקדמת שעוזרת לך בכל המשימות",
    whatsappDescription: "תקשורת קלה עם משפחה וחברים",
    mapsDescription: "מפת Google לאיתור כאבול",
    importantWebsites: "אתרים חשובים",
    notifications: "התראות",
    noNotifications: "אין התראות",
  },
};

const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("he");
  const toggleLanguage = () =>
    setLanguage((prev) => (prev === "ar" ? "he" : "ar"));
  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, translations: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { language, translations } = useContext(LanguageContext);

  useEffect(() => {
    const db = getDatabase();
    const notificationsRef = ref(db, "notifications");

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      if (snapshot.exists()) {
        const notificationsData = snapshot.val();
        const notificationsArray = Object.entries(notificationsData).map(
          ([id, data]) => ({
            id,
            ...data,
          })
        );

        const sortedNotifications = notificationsArray.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setNotifications(sortedNotifications);
        setUnreadCount(sortedNotifications.filter((n) => !n.read).length);
      } else {
        setNotifications([]);
        setUnreadCount(0);
      }
    });

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const db = getDatabase();
      await update(ref(db, `notifications/${notificationId}`), {
        read: true,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div
      className="relative"
      ref={dropdownRef}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 rounded-full hover:bg-white/20 transition-all duration-300 focus:ring-2 focus:ring-white/50 ${
          unreadCount > 0 ? "animate-pulse" : ""
        }`}
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="fixed md:absolute right-0 top-16 md:top-full mt-2 w-[calc(100vw-2rem)] md:w-96 bg-white rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto mx-4 md:mx-0 border border-gray-100">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100/50">
            <h3 className="text-lg font-bold text-gray-800">
              {translations.notifications}
            </h3>
          </div>
          {!notifications || notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{translations.noNotifications}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-blue-50 transition-all duration-300 cursor-pointer ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SidebarLink = ({ icon: Icon, title, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-3 w-full hover:bg-white/10 rounded-lg transition-colors ${className}`}
  >
    <Icon className="h-5 w-5" />
    <span className="text-sm md:text-base">{title}</span>
  </button>
);

const QuickActionCard = ({ title, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-between w-full p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white"
  >
    <ChevronRight className="h-5 w-5" />
    <span className="text-sm md:text-base">{title}</span>
  </button>
);

const EmailServiceCard = ({ icon, title, link }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all flex flex-col items-center group"
  >
    <img
      src={icon}
      alt={title}
      className="h-12 w-12 md:h-16 md:w-16 mb-2 md:mb-3 transform group-hover:scale-110 transition-transform"
    />
    <span className="text-base md:text-lg font-semibold text-blue-900">
      {title}
    </span>
  </a>
);

const AIServiceCard = ({ icon, title, description, link }) => (
  <a
    href={link}
    target="_blank"
    rel="noopener noreferrer"
    className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all flex flex-col items-center group"
  >
    <img
      src={icon}
      alt={title}
      className="h-16 w-16 md:h-20 md:w-20 mb-3 md:mb-4 transform group-hover:scale-110 transition-transform"
    />
    <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-sm md:text-base text-blue-100 text-center">
      {description}
    </p>
  </a>
);

const Header = ({ onMenuClick }) => {
  const { translations } = useContext(LanguageContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md py-4 px-4 sticky top-0 z-40">
      <div className="container mx-auto">
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center">
          <div className="flex items-center justify-between md:hidden">
            <button onClick={onMenuClick} className="p-2">
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>{translations.logout}</span>
            </button>
          </div>

          <div className="hidden md:flex md:flex-1 md:justify-start">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>{translations.logout}</span>
            </button>
          </div>
          <div className="flex items-center justify-center">
            <h1 className="text-xl md:text-2xl font-bold text-blue-900 text-center">
              {translations.title}
            </h1>
          </div>

          <div className="hidden md:block md:flex-1" />
        </div>
      </div>
    </header>
  );
};

const Sidebar = ({ isMobile, onClose }) => {
  const navigate = useNavigate();
  const { language, toggleLanguage, translations } =
    useContext(LanguageContext);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isMobile) {
      const handleClickOutside = (event) => {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
          onClose();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobile, onClose]);

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto max-h-screen">
      <div className="flex-grow space-y-2 pb-20">
        <SidebarLink
          icon={Building2}
          title={translations.notes}
          onClick={() => navigate("/notes")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={Calendar}
          title={translations.importantDates}
          onClick={() => navigate("/importantdates")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={Calendar}
          title={translations.todayDates}
          onClick={() => navigate("/nowdate")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={Calendar}
          title={translations.expiredDates}
          onClick={() => navigate("/pastdates")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={User}
          title={translations.phoneNumbers}
          onClick={() => navigate("/numbers")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={Mail}
          title={translations.importantEmails}
          onClick={() => navigate("/emailimportant")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={FileText}
          title={translations.writeDoc}
          onClick={() => navigate("/writedoce")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={MapPin}
          title={translations.addresses}
          onClick={() => navigate("/address")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={Briefcase}
          title={translations.tasks}
          onClick={() => navigate("/Tasks")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={Globe2}
          title={translations.importantWebsites}
          onClick={() => navigate("/websites")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={Settings}
          title={translations.settings}
          onClick={() => navigate("/settings")}
          className="text-gray-100"
        />
        <SidebarLink
          icon={Globe}
          title={language === "he" ? "العربية" : "עברית"}
          onClick={toggleLanguage}
          className="text-gray-100"
        />
      </div>
      {isMobile && (
        <button onClick={onClose} className="absolute top-4 left-4 text-white">
          <X className="h-6 w-6" />
        </button>
      )}
    </div>
  );

  return isMobile ? (
    <div
      ref={sidebarRef}
      className="fixed inset-y-0 right-0 w-64 bg-blue-900 z-50 p-6 shadow-xl overflow-y-auto"
    >
      {sidebarContent}
    </div>
  ) : (
    <div className="hidden lg:block w-64 bg-blue-900 p-6 fixed h-full overflow-y-auto">
      {sidebarContent}
    </div>
  );
};

const MainContent = () => {
  const navigate = useNavigate();
  const { translations } = useContext(LanguageContext);

  return (
    <div className="p-4 md:p-6 space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-xl p-4 md:p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {translations.linksAndDirections}
            </h2>
            <NotificationBell />
          </div>
          <div className="space-y-3">
            <QuickActionCard
              title={translations.addNotes}
              onClick={() => navigate("/addnote")}
            />
            <QuickActionCard
              title={translations.addDates}
              onClick={() => navigate("/adddate")}
            />
            <QuickActionCard
              title={translations.addPhones}
              onClick={() => navigate("/addnumbers")}
            />
            <QuickActionCard
              title={translations.addEmail}
              onClick={() => navigate("/addemail")}
            />
            <QuickActionCard
              title={translations.addAddress}
              onClick={() => navigate("/addaddress")}
            />
            <QuickActionCard
              title={translations.addTasks}
              onClick={() => navigate("/addTasks")}
            />
            <QuickActionCard
              title={translations.addWebsite}
              onClick={() => navigate("/addwebsite")}
            />
          </div>
        </div>

        <div className="space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <EmailServiceCard
              icon={gmail1}
              title="Gmail"
              link="https://mail.google.com"
            />
            <EmailServiceCard
              icon={outlook1}
              title="Outlook"
              link="https://outlook.live.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <AIServiceCard
              icon={chatgpt1}
              title="ChatGPT"
              description={translations.chatGPTDescription}
              link="https://chatgpt.com"
            />
            <AIServiceCard
              icon={Gemini1}
              title="Gemini AI"
              description={translations.geminiDescription}
              link="https://gemini.google.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <AIServiceCard
              icon={whatsapp1}
              title="WhatsApp"
              description={translations.whatsappDescription}
              link="https://web.whatsapp.com"
            />
            <AIServiceCard
              icon={maps1}
              title="Google Maps"
              description={translations.mapsDescription}
              link="https://www.google.com/maps/place/%D7%9B%D7%90%D7%91%D7%95%D7%9C%E2%80%AD/@32.8766468,35.2248931,14z/data=!3m1!4b1!4m6!3m5!1s0x151dcaca97912bbd:0x892b5739008514ff!8m2!3d32.8700114!4d35.2071305!16s%2Fm%2F0281j1b?entry=ttu"
            />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded-xl p-6 md:p-8 shadow-lg">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 text-center">
          {translations.contactUs}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center hover:bg-white/20 transition-all">
            <p className="text-white text-base md:text-lg font-medium mb-2 md:mb-3">
              {translations.husband}
            </p>
            <a
              href="tel:0543272208"
              className="text-white text-xl md:text-2xl hover:text-amber-400"
            >
              0543272208
            </a>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-6 text-center hover:bg-white/20 transition-all">
            <p className="text-white text-base md:text-lg font-medium mb-2 md:mb-3">
              {translations.son}
            </p>
            <a
              href="tel:0537333343"
              className="text-white text-xl md:text-2xl hover:text-amber-400"
            >
              0537333343
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainPage = () => {
  const navigate = useNavigate();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username || username !== "Khetam") {
      navigate("/");
    }
  }, [navigate]);

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-100" dir="rtl">
        <Header onMenuClick={() => setShowMobileSidebar(true)} />
        {showMobileSidebar && (
          <Sidebar isMobile onClose={() => setShowMobileSidebar(false)} />
        )}
        <Sidebar />
        <div className="lg:mr-64">
          <main className="min-h-screen pb-16 md:pb-0">
            <MainContent />
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
};

export const useMainContext = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useMainContext must be used within a LanguageProvider");
  }
  return context;
};

export default MainPage;
