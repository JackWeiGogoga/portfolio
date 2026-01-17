import React from "react";
import avatarImg from "@/assets/images/profile/avatar.png";
import neteaseImg from "@/assets/images/logos/netease.png";

const Profile: React.FC = () => {
  return (
    <div className="flex items-center gap-5">
      <div className="flex flex-col items-center bg-gray-200 rounded-full">
        <img
          src={avatarImg}
          width={80}
          height={80}
          alt="Profile Picture"
          className="rounded-full"
        />
      </div>
      <div>
        <h1>Jack Wei</h1>
        <p className="flex items-center h-8 text-sm">
          <span>Software Engineer @ &nbsp; </span>
          <a
            className="flex items-center gap-1 no-underline"
            href="https://www.163.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={neteaseImg} width={18} height={18} alt="Netease Logo" />{" "}
            <span>Netease</span>
          </a>
        </p>
      </div>
    </div>
  );
};

export default Profile;
