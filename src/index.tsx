import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./screens/Auth/Login";
import { Register } from "./screens/Auth/Register";
import { Attendance } from "./screens/Attendance/Attendance";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { Students } from "./screens/Students/Students";
import { Files } from "./screens/Files/Files";
import { Settings } from "./screens/Settings/Settings";
import { Exams } from "./screens/Exams/Exams";
import { Calendar } from "./screens/Calendar/Calendar";
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/students" element={<Students />} />
          <Route path="/billing" element={<Files />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'white',
            color: 'black',
          },
          className: 'shadow-lg rounded-lg',
          duration: 3000,
        }}
      />
    </>
  );
}

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);