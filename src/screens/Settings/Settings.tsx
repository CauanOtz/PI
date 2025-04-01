import React from "react";
import { SidebarSection } from "../Teachers/sections/SidebarSection";

export const Settings = (): JSX.Element => {
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
        <SidebarSection />
        <div className="flex flex-col ml-[283px] p-8">
          <h1 className="text-2xl font-bold mb-4">Configurações</h1>
          <p>Configurações do sistema</p>
        </div>
      </div>
    </div>
  );
};