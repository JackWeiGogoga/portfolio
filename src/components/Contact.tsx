import React from "react";
import { useTranslation } from "react-i18next";
import {
  MdEmail,
  MdPhone,
  MdLocationOn,
  MdPerson,
  MdSchool,
  MdLanguage,
} from "react-icons/md";

const data = [
  {
    label: "Name",
    value: "Jack Wei",
    icon: <MdPerson className="text-gray-600" />,
  },
  {
    label: "Phone",
    value: "+86 18500151385",
    icon: <MdPhone className="text-gray-600" />,
  },
  {
    label: "Email",
    value: "jackweigogoga@gmail.com",
    icon: <MdEmail className="text-gray-600" />,
  },
  {
    label: "Address",
    value: "Beijing, China",
    icon: <MdLocationOn className="text-gray-600" />,
  },
  {
    label: "Education",
    value: "M.S. in Computer Technology, NEU",
    icon: <MdSchool className="text-gray-600" />,
  },
  {
    label: "Language",
    value: "English(CET-6), Chinese",
    icon: <MdLanguage className="text-gray-600" />,
  },
];

const Contact: React.FC = () => {
  const { t } = useTranslation("home");
  const items = t("contact.items", { returnObjects: true }) as Array<{
    label: string;
    value: string;
  }>;

  return (
    <div className="my-6">
      <h5 className="mb-4 text-sm text-graytext font-mono">
        {t("contact.title")}
      </h5>
      <div className="flex flex-col gap-3">
        {data.map((item, index) => {
          const content = items[index];
          const label = content?.label ?? item.label;
          const value = content?.value ?? item.value;

          return (
          <div key={index} className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              {item.icon}
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center">
              <p className="text-sm">{label}</p>
              <p className="text-sm text-graytext">{value}</p>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default Contact;
