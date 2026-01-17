import React from "react";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="mx-auto pt-8 text-xs text-graytext">
        <div className="flex justify-between items-center">
          <div>&copy; {new Date().getFullYear()} Jack Wei</div>
          <div>Man proposes, God disposes.</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
