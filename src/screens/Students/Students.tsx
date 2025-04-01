import React from "react";
import { SidebarSection } from "../Teachers/sections/SidebarSection";

export const Students = (): JSX.Element => {
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col ml-[283px] p-8">
          <h1 className="text-2xl font-bold mb-4">Alunos/Turmas</h1>
          <p>Gerenciamento de alunos e turmas</p>
        </div>
      </div>
    </div>
  );
};