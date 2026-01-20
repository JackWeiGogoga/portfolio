import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import commonEn from "./locales/en/common.json";
import commonZh from "./locales/zh/common.json";
import resumeEn from "./locales/en/resume.json";
import resumeZh from "./locales/zh/resume.json";
import jvmEn from "./locales/en/jvm.json";
import jvmZh from "./locales/zh/jvm.json";
import javaLocksEn from "./locales/en/javaLocks.json";
import javaLocksZh from "./locales/zh/javaLocks.json";
import whatIsItEn from "./locales/en/whatIsIt.json";
import whatIsItZh from "./locales/zh/whatIsIt.json";

const getInitialLanguage = () => {
  if (typeof window === "undefined") {
    return "zh";
  }
  const params = new URLSearchParams(window.location.search);
  const langParam = params.get("lang");
  const stored = window.localStorage.getItem("lang");
  const candidate = langParam || stored || navigator.language;
  return candidate.startsWith("zh") ? "zh" : "en";
};

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEn,
      resume: resumeEn,
      jvm: jvmEn,
      javaLocks: javaLocksEn,
      whatIsIt: whatIsItEn,
    },
    zh: {
      common: commonZh,
      resume: resumeZh,
      jvm: jvmZh,
      javaLocks: javaLocksZh,
      whatIsIt: whatIsItZh,
    },
  },
  lng: getInitialLanguage(),
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
