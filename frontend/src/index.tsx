import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./screens/Auth/Login";
import { Register } from "./screens/Auth/Register";
import { ForgotPassword}  from "./screens/Auth/ForgotPassword";
import { Attendance } from "./screens/Attendance/Attendance";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { Students } from "./screens/Students/Students";
import { Files } from "./screens/Files/Files";
import { Settings } from "./screens/Settings/Settings";
import { Exams } from "./screens/Exams/Exams";
import { Calendar } from "./screens/Calendar/Calendar";
import { Toaster } from 'sonner';
import { AuthProvider } from "./context/AuthProvider";
import PrivateRoute from "./routes/PrivateRoute";
import { Users } from "./screens/Users/Users";
import { Activity } from "./screens/Atividades/Activity";

function App() {
  return (
    <>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/students" element={<Students />} />
            <Route path="/files" element={<Files />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/users" element={<Users />} />
            <Route path="/atividades" element={<Activity />} />
          </Route>
        </Routes>
      </AuthProvider>
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
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);