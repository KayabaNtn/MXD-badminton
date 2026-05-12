import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Sessions } from "./pages/Sessions";
import { ResultsPage } from "./pages/Results";
import { Members } from "./pages/Members";
import { Login } from "./pages/admin/Login";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { initDB } from "./utils/db";

export default function App() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/lich-dau" element={<Sessions />} />
            <Route path="/ket-qua" element={<ResultsPage />} />
            <Route path="/thanh-vien" element={<Members />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}