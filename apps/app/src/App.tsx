import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from './auth/RequireRole.js';
import {
  CitiesAdminPage,
  ExamSlotsAdminPage,
  FormulasAdminPage,
  SessionsAdminPage,
  StudentsAdminPage,
} from './features/index.js';
import AdminLayout from './layouts/AdminLayout.js';
import LoginPage from './pages/LoginPage.js';

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/login" element={<LoginPage />} />

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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
