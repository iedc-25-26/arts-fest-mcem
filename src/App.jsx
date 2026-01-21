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
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <div>
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

        {/* GLOBAL WATERMARK (Overlay Footer Style) */}
        {/* GLOBAL WATERMARK (Overlay Footer Style) */}
        <div style={{
          position: 'fixed', // Fixed to stay at viewport bottom, effectively a watermark
          bottom: '5px',
          left: 0,
          width: '100%',
          textAlign: 'center',
          fontSize: '0.7rem', // "Really small"
          color: 'rgba(255, 255, 255, 0.5)', // "White" but subtle
          fontWeight: '300', // "Thin"
          fontFamily: 'sans-serif',
          userSelect: 'none',
          pointerEvents: 'none', // Click-through
          zIndex: 9999, // On top of everything
          textShadow: '0px 1px 2px rgba(0,0,0,0.5)' // Ensure legibility on light backgrounds
        }}>
          Powered by CT 2023-26
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
