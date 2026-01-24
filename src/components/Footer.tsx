import React from "react";
import { useTranslation } from "react-i18next";

const Footer: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <footer>
      <div className="mx-auto pt-8 text-xs text-graytext">
        <div className="flex justify-between items-center">
          <div>&copy; {new Date().getFullYear()} Jack Wei</div>
          <div>{t("footer.quote")}</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
