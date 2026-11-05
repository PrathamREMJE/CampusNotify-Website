import Login from "./pages/Login";
import React from "react";
import SignUp from "./pages/SignUp";
import AdminSignup from "./pages/AdminSignup";
import Dashboard from "./pages/Dashboard";
import ManageStaff from "./pages/ManageStaff";
import AddStaffPage from "./pages/AddStaff";
import EditStaffPage from "./pages/EditStaff";
import ProfilePage from "./pages/ProfilePage";
import Notices from "./pages/Notices";
import CreateNotice from "./pages/CreateNotice";
import NoticeHistoryPage from "./pages/NoticeHistoryPage";

import AddDepartmentAndCommittee from "./pages/AddDepartmentAndCommittee";

import NoticePreviewPage from "./components/NoticeForm/NoticePreviewPage";
import ActivityLog from "./pages/ActivityLog";
import LetterheadManagement from "./pages/LetterheadManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import Report from "./pages/Report";
import Home from "./pages/Home";
import Feature from "./pages/Feature";
import ContactUs from "./pages/ContactUs";
import Tutorial from "./pages/Tutorial";

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/notices/preview" element={<NoticePreviewPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/feature" element={<Feature />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/contact" element={<ContactUs />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/manage-staff" element={
          <ProtectedRoute>
            <ManageStaff />
          </ProtectedRoute>
        } />
        <Route path="/add-staff" element={
          <ProtectedRoute>
            <AddStaffPage />
          </ProtectedRoute>
        } />
        <Route path="/edit-staff/:staffId" element={
          <ProtectedRoute>
            <EditStaffPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/notices" element={
          <ProtectedRoute>
            <Notices />
          </ProtectedRoute>
        } />
        <Route path="/notices/create" element={
          <ProtectedRoute>
            <CreateNotice />
          </ProtectedRoute>
        } />

        <Route path="/activity-log" element={
          <ProtectedRoute>
            <ActivityLog />
          </ProtectedRoute>
        } />
        <Route path="/add-department-committee" element={
          <ProtectedRoute>
            <AddDepartmentAndCommittee />
          </ProtectedRoute>
        } />
        <Route path="/notices/history" element={
          <ProtectedRoute>
            <NoticeHistoryPage />
          </ProtectedRoute>
        } />

        <Route path="/letterhead-management" element={
          <ProtectedRoute>
            <LetterheadManagement />
          </ProtectedRoute>
        } />
        {/* Settings page removed as per user request */}
        {/* <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } /> */}
        <Route path="/reports" element={
          <ProtectedRoute>
            <Report />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;

