import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from './auth/RequireRole.js';
import {
  CitiesAdminPage,
  ExamResultsAdminPage,
  ExamSlotsAdminPage,
  FormulasAdminPage,
  PaymentsAdminPage,
  SessionsAdminPage,
  StudentsAdminPage,
} from './features/index.js';
import AdminLayout from './layouts/AdminLayout.js';
import InstructorLayout from './layouts/InstructorLayout.js';
import PublicLayout from './layouts/PublicLayout.js';
import AvailabilityPage from './pages/instructor/AvailabilityPage.js';
import HoursSummaryPage from './pages/instructor/HoursSummaryPage.js';
import PlanningPage from './pages/instructor/PlanningPage.js';
import SessionStudentsPage from './pages/instructor/SessionStudentsPage.js';
import StudentFichePage from './pages/instructor/StudentFichePage.js';
import CatalogPage from './pages/CatalogPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';
import SessionsPage from './pages/SessionsPage.js';
import StudentDashboardPage from './pages/StudentDashboardPage.js';

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/formules" replace />} />
        <Route path="/formules" element={<CatalogPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/inscription" element={<RegisterPage />} />
        <Route
          path="/mon-compte"
          element={
            <RequireRole roles={['eleve']}>
              <StudentDashboardPage />
            </RequireRole>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole roles={['admin']}>
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<Navigate to="formulas" replace />} />
        <Route path="formulas" element={<FormulasAdminPage />} />
        <Route path="cities" element={<CitiesAdminPage />} />
        <Route path="exam-slots" element={<ExamSlotsAdminPage />} />
        <Route path="sessions" element={<SessionsAdminPage />} />
        <Route path="students" element={<StudentsAdminPage />} />
        <Route path="exam-results" element={<ExamResultsAdminPage />} />
        <Route path="payments" element={<PaymentsAdminPage />} />
      </Route>

      <Route
        path="/moniteur"
        element={
          <RequireRole roles={['moniteur']}>
            <InstructorLayout />
          </RequireRole>
        }
      >
        <Route index element={<PlanningPage />} />
        <Route path="sessions/:sessionId" element={<SessionStudentsPage />} />
        <Route path="sessions/:sessionId/eleves/:bookingId" element={<StudentFichePage />} />
        <Route path="disponibilites" element={<AvailabilityPage />} />
        <Route path="heures" element={<HoursSummaryPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
