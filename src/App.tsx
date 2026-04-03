import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import DashboardPage from './pages/DashboardPage';
import CourseListPage from './pages/Course/CourseListPage.tsx';
import CreateCoursePage from './pages/Course/CreateCoursePage.tsx';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute.tsx';
import CourseDetailPage from './pages/Course/CourseDetailPage.tsx';
import EditCoursePage from './pages/Course/EditCoursePage.tsx';
import CreateClassPage from './pages/Classes/CreateClassPage.tsx';
import ClassDetailPage from './pages/Classes/ClassDetailPage.tsx';
import EditClassPage from './pages/Classes/EditClassPage.tsx';
import ClassListPage from './pages/Classes/ClassListPage.tsx';
import FillStudyPlanPage from './pages/StudyPlan/FillStudyPlanPage.tsx';
import CurrentClassesPage from './pages/Dosen/CurrentClassesPage.tsx';
import ClassGradesPage from './pages/Dosen/ClassGradesPage.tsx';
import MyGradesPage from './pages/StudyPlan/MyGradesPage.tsx';
import StudyPlanSummaryPage from './pages/StudyPlan/StudyPlanSummaryPage.tsx';
import NotFoundPage from './pages/404/NotFoundPage.tsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />

        {/* Rute Terproteksi (Hanya bisa dibuka jika sudah login) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <CourseListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/class"
          element={
            <ProtectedRoute>
              <ClassListPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/class/:id"
          element={
            <ProtectedRoute>
              <ClassDetailPage />
            </ProtectedRoute>
          }
        />


        <Route
          path="/course-plan/edit"
          element={
            <ProtectedRoute>
              <FillStudyPlanPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/course-plan/summary"
          element={
            <ProtectedRoute>
              <StudyPlanSummaryPage />
            </ProtectedRoute>
          }
        />

        <Route element={<RoleBasedRoute allowedRoles={['DOSEN']} />}>
          <Route path="/courses/create" element={<CreateCoursePage />} />
          <Route
            path="/courses/:courseId/add-class"
            element={
              <CreateClassPage />
            }
          />
          
          <Route
            path="/courses/edit/:id"
            element={
              <ProtectedRoute>
                <EditCoursePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/class/:id/edit"
            element={
              <ProtectedRoute>
                <EditClassPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-classes"
            element={
              <ProtectedRoute>
                <CurrentClassesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/class/:id/grades"
            element={
              <ProtectedRoute>
                <ClassGradesPage />
              </ProtectedRoute>
            }
          />


        </Route>

        <Route element={<RoleBasedRoute allowedRoles={['MAHASISWA']} />}>
          <Route
            path="/my-grades"
            element={
              <ProtectedRoute>
                <MyGradesPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Redirect otomatis jika akses root '/' */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Page Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;