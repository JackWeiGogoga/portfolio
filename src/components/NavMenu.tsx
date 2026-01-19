import { useState, useEffect } from "react";
import { useTheme } from "@/components/theme-provider";
import { useLocation, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Home,
  User,
  BookOpen,
  FileText,
  Info,
  Clock,
  Layers,
  Lightbulb,
} from "lucide-react";
import { ROUTES } from "@/config/constants";

const formatTime = (locale: string) =>
  new Date().toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  });

export function NavMenu() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation("common");
  const currentLanguage = i18n.language.startsWith("zh") ? "zh" : "en";
  const timeLocale = currentLanguage === "zh" ? "zh-CN" : "en-US";
  const [currentTime, setCurrentTime] = useState(() =>
    formatTime(timeLocale)
  );
  const location = useLocation();
  const pathname = location.pathname;
  const [searchParams, setSearchParams] = useSearchParams();
  const locationName = t("nav.location");
  const languageOptions = [
    { id: "en", label: t("nav.language.en") },
    { id: "zh", label: t("nav.language.zh") },
  ];

  // 组件挂载后再显示
  useEffect(() => {
    // 使用 requestAnimationFrame 来避免在 effect 中直接调用 setState
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  // 添加键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 更新时间
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(formatTime(timeLocale));
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [timeLocale]);

  // 在客户端渲染之前不显示内容
  if (!mounted) {
    return (
      <div className="print:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="fixed z-50 w-12 h-12 bg-muted hover:bg-accent md:top-4 md:left-4 bottom-4 right-4 rounded-full md:rounded-lg shadow-lg md:shadow-sm transition-all duration-200 ease-in-out"
        >
          ⌘K
        </Button>
      </div>
    );
  }

  return (
    <div className="print:hidden">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="fixed z-50 w-12 h-12 bg-muted hover:bg-accent hover:cursor-pointer md:top-4 md:left-4 bottom-4 right-4 rounded-full md:rounded-lg shadow-lg md:shadow-sm transition-all duration-200 ease-in-out"
          >
            ⌘K
          </Button>
        </DialogTrigger>
        <DialogContent
          className="sm:max-w-[360px] gap-0 p-0 border-0"
          showCloseButton={false}
        >
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center justify-between py-4 px-6.5 text-xs text-graytext font-mono">
            <div>
              {locationName}, {currentTime}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {languageOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      void i18n.changeLanguage(option.id);
                      window.localStorage.setItem("lang", option.id);
                      const nextParams = new URLSearchParams(searchParams);
                      nextParams.set("lang", option.id);
                      setSearchParams(nextParams);
                    }}
                    className={`rounded-full border px-2.5 py-0.5 ${
                      currentLanguage === option.id
                        ? "border-transparent bg-accent text-text"
                        : "border-outline bg-card-background text-graytext"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button
                variant="ghost"
                className="text-xs hover:cursor-pointer hover:bg-muted hover:rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? t("nav.lightsOn") : t("nav.lightsOff")}
              </Button>
            </div>
          </div>

          <div className="px-4 py-1">
            <div className="text-xs mb-3 font-mono text-graytext px-2.5">
              {t("nav.pages")}
            </div>
            <nav>
              <Link
                to="/"
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === "/" ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>{t("nav.items.home")}</span>
              </Link>
              <Link
                to={ROUTES.RESUME}
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === ROUTES.RESUME ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <FileText className="w-4 h-4" />
                <span>{t("nav.items.resume")}</span>
              </Link>
              <Link
                to="/about"
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === "/about" ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>{t("nav.items.about")}</span>
              </Link>
              <Link
                to="/bookshelf"
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === "/bookshelf" ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <BookOpen className="w-4 h-4" />
                <span>{t("nav.items.bookshelf")}</span>
              </Link>
              <Link
                to={ROUTES.SIDE_PROJECTS}
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === ROUTES.SIDE_PROJECTS ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <Layers className="w-4 h-4" />
                <span>{t("nav.items.sideProjects")}</span>
              </Link>
              <Link
                to={ROUTES.WHAT_IS_IT}
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === ROUTES.WHAT_IS_IT ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <Lightbulb className="w-4 h-4" />
                <span>{t("nav.items.whatIsIt")}</span>
              </Link>
            </nav>
          </div>

          <div className="px-4 py-1">
            <h4 className="text-xs mb-3 font-mono text-graytext px-2.5">
              {t("nav.info")}
            </h4>
            <nav>
              <Link
                to="/notes"
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === "/notes" ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <FileText className="w-4 h-4" />
                <span>{t("nav.items.notes")}</span>
              </Link>
              <Link
                to="/colophon"
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === "/colophon" ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <Info className="w-4 h-4" />
                <span>{t("nav.items.colophon")}</span>
              </Link>
              <Link
                to="/now"
                className={`flex items-center gap-2 py-2 px-2.5 rounded-md hover:bg-muted no-underline ${
                  pathname === "/now" ? "" : "text-graytext"
                }`}
                onClick={() => setOpen(false)}
              >
                <Clock className="w-4 h-4" />
                <span>{t("nav.items.now")}</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center justify-between py-4 px-6.5 text-xs text-graytext bg-card-background rounded-b-lg font-mono">
            <a href="mailto:jackweigogoga@gmail.com" className="no-underline">
              jackweigogoga@gmail.com
            </a>
            <div className="flex items-center gap-2">
              <span>{t("nav.close")}</span>
              <kbd className="text-text bg-card-hover px-2 py-0.5 rounded">
                ESC
              </kbd>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
