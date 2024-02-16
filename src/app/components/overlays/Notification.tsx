import React from "react";

function Notification({ loading }: any) {
  return (
    <div className="absolute top-2 right-24 animate-fadeIn duration-500 z-40">
      <div className="w-96 bg-slate-400 h-44 p-3 rounded-2xl">
        <div className="w-full text-center text-white">Notification</div>
        <div className="flex-grow bg-white rounded-2xl max-h-96 overflow-y-scroll"></div>
      </div>
    </div>
  );
}

export default Notification;
