import { useState } from "react";

import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import { SchoolLogin } from "./pages/login";
import { StudentSidebar } from "./pages/rol_student/sidebar_student";

import { Calificaciones } from "./pages/rol_student/grades";
import { Perfil } from "./pages/rol_student/profile";
import { TeacherSidebar } from "./pages/rol_teacher/sidebar_teacher";
import { RegistroEstudiantes } from "./pages/rol_teacher/upload_students";
import { RegistroNotas } from "./pages/rol_teacher/upload_grades";
import { CalendarioEscolar } from "./pages/rol_teacher/calendar_school";
import { PerfilDocente } from "./pages/rol_teacher/profile";
import { ReportesTeacher } from "./pages/rol_teacher/reports";
import { SidebarDirector } from "./pages/rol_intendente/sidebar_intedente";
import { GestionEstudiantes } from "./pages/rol_intendente/manager_student";
import { DashboardDirector } from "./pages/rol_intendente/info";
import { GestionDocentes } from "./pages/rol_intendente/manager_teachers";
import { Estadisticas } from "./pages/rol_intendente/statistic";
import { Boletines } from "./pages/rol_intendente/boletines";
import PrivateRoute from "./services/protected";
import { InicioStudent } from "./pages/rol_student/info";
import { InicioDocente } from "./pages/rol_teacher/info";
import { ReportesDire } from "./pages/rol_intendente/reports";
import { CalendarioEscolarDire } from "./pages/rol_intendente/calendar";
import { HorarioStudent } from "./pages/rol_student/horario";
import { CalendarioEscolarEstudiante } from "./pages/rol_student/calendario";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SchoolLogin />} />
          <Route element={<PrivateRoute />}>
            <Route path="/home-student" element={<StudentSidebar />}>
              <Route index element={<InicioStudent />} />
              
              <Route path="grades" element={<Calificaciones />} />
              <Route path="profile" element={<Perfil />} />
              <Route path="materias" element={<Perfil />} />
              <Route path="horario" element={<HorarioStudent />} />
              <Route path="calendar" element={<CalendarioEscolarEstudiante />} />
            </Route>
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/home-teacher" element={<TeacherSidebar />}>
              <Route index element={<InicioDocente />} />
              <Route path="register" element={<RegistroEstudiantes />} />
              <Route path="upload-grades" element={<RegistroNotas />} />
              <Route path="calendar" element={<CalendarioEscolar />} />
              <Route path="profile" element={<PerfilDocente />} />
              <Route path="reports" element={<ReportesTeacher />} />
            </Route>
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/home-intendente" element={<SidebarDirector />}>
              <Route index element={<DashboardDirector />} />
              <Route path="managerest" element={<GestionEstudiantes />} />
              <Route path="teachers" element={<GestionDocentes />} />
              <Route path="reports" element={<ReportesDire />} />
              <Route path="statistics" element={<Estadisticas />} />
              <Route path="calendar" element={<CalendarioEscolarDire />} />
              <Route path="boletines" element={<Boletines />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
