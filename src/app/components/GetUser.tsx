"use client";
import axios from "axios";
import React from "react";

function GetUser() {
  return (
    <button type="button" onClick={() => axios.post("/api/user/add")}>
      add user
    </button>
  );
}

export default GetUser;
