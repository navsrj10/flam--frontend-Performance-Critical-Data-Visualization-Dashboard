"use client";
import React from "react";

export default function OrangeButton(
  { active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void }
){
  return (
    <button className={`btn ${active ? "active":""}`} onClick={onClick}>
      {children}
    </button>
  );
}
