import React, { useState } from "react";
import "./sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const handleOpen = () => {
    setIsOpen(!isOpen);
    console.log("HE::");
  };
  return (
    <div
      id="sidebar-root"
      onClick={handleOpen}
      className={isOpen ? "sidebar-open" : "sidebar-close"}
    >
      <div id="sidebar-header">Symphony</div>
      <div id="sidebar">
        <div id="sidebar-element">Home</div>
        <div id="sidebar-element">Profile</div>
      </div>
    </div>
  );
}

export default Sidebar;
