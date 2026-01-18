import React from "react";
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
  return (
    <div className="my-6">
      <h5 className="mb-4 text-sm text-graytext font-mono">About Me</h5>
      <div className="flex flex-col gap-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              {item.icon}
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center">
              <p className="text-sm">{item.label}</p>
              <p className="text-sm text-graytext">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contact;
