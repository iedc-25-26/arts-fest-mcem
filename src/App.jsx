import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Individual from "./components/Individual";
import Preview from "./components/Preview";
import Group from "./components/Group";
import GroupDetails from "./components/GroupDetails";
import ThankYou from "./components/ThankYou";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProgramManagement from "./components/admin/ProgramManagement";
import RegistrationManagement from "./components/admin/RegistrationManagement";


function App() {
  return (
    <BrowserRouter>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative'
      }}>
        <div className="main-content-wrapper">
          <Routes>
            <Route path="/" element={<Login />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/individual" element={<Individual />} />
              <Route path="/preview" element={<Preview />} />
              <Route path="/group" element={<Group />} />
              <Route path="/group-details" element={<GroupDetails />} />
              <Route path="/thank-you" element={<ThankYou />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-panel" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="programs" element={<ProgramManagement />} />
              <Route path="registrations" element={<RegistrationManagement />} />
            </Route>
          </Routes>
        </div>

        {/* GLOBAL WATERMARK */}
        <div className="footer-watermark">
          Powered by <br />
          CT 2023-26
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
