import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Household from './pages/Household';
import JoinHousehold from './pages/JoinHousehold';
import PersonalCalendar from './pages/PersonalCalendar';
import HouseholdCalendar from './pages/HouseholdCalendar';
import Chores from './pages/Chores';
import ChoreDetails from './pages/ChoreDetails';
import ChoreHistory from './pages/ChoreHistory';
import Expenses from './pages/Expenses';
import ExpenseDetails from './pages/ExpenseDetails';
import Shopping from './pages/Shopping';
import Help from './pages/Help';
import HelpDetails from './pages/HelpDetails';
import Decisions from './pages/Decisions';
import Contribution from './pages/Contribution';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
      <Route path="/expenses/:id" element={<ProtectedRoute><ExpenseDetails /></ProtectedRoute>} />
      <Route path="/shopping" element={<ProtectedRoute><Shopping /></ProtectedRoute>} />
      <Route path="/chores" element={<ProtectedRoute><Chores /></ProtectedRoute>} />
      <Route path="/chores/history" element={<ProtectedRoute><ChoreHistory /></ProtectedRoute>} />
      <Route path="/chores/:id" element={<ProtectedRoute><ChoreDetails /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
      <Route path="/help/:id" element={<ProtectedRoute><HelpDetails /></ProtectedRoute>} />
      <Route path="/decisions" element={<ProtectedRoute><Decisions /></ProtectedRoute>} />
      <Route path="/contribution" element={<ProtectedRoute><Contribution /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><PersonalCalendar /></ProtectedRoute>} />
      <Route path="/household-calendar" element={<ProtectedRoute><HouseholdCalendar /></ProtectedRoute>} />
      <Route path="/household" element={<ProtectedRoute><Household /></ProtectedRoute>} />
      <Route path="/join/:inviteCode" element={<ProtectedRoute><JoinHousehold /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
