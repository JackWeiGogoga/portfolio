
import React from "react";
import { useTranslation } from "react-i18next";

const Intro: React.FC = () => {
  const { t } = useTranslation("home");
  const paragraphs = t("intro.paragraphs", {
    returnObjects: true,
  }) as string[];

  return (
    <div className="my-6">
      <h5 className="mb-2 text-sm text-graytext font-mono">
        {t("intro.title")}
      </h5>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="my-3 text-sm">
          {paragraph}
        </p>
      ))}
    </div>
  );
};

export default Intro;
