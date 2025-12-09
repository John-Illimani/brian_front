import React from "react";
import { Users, BookOpen, BarChart2, Calendar } from "lucide-react";

export const DashboardDirector = () => {
  return (
    <div className="p-6 space-y-10">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-500 text-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-extrabold mb-2">🎓 Bienvenido, Director</h1>
        <p className="text-purple-100 text-sm md:text-base">
          Supervisa el rendimiento académico, gestiona docentes y estudiantes, y mantente al tanto de los eventos escolares.
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-purple-100 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-4">
          <Users size={40} className="text-purple-700" />
          <div>
            <p className="text-gray-600">Estudiantes</p>
            <p className="text-2xl font-bold text-purple-800">120</p>
          </div>
        </div>

        <div className="bg-purple-100 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-4">
          <Users size={40} className="text-purple-700" />
          <div>
            <p className="text-gray-600">Docentes</p>
            <p className="text-2xl font-bold text-purple-800">15</p>
          </div>
        </div>

        <div className="bg-purple-100 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-4">
          <BookOpen size={40} className="text-purple-700" />
          <div>
            <p className="text-gray-600">Notas Registradas</p>
            <p className="text-2xl font-bold text-purple-800">350</p>
          </div>
        </div>

        <div className="bg-purple-100 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-4">
          <Calendar size={40} className="text-purple-700" />
          <div>
            <p className="text-gray-600">Eventos Próximos</p>
            <p className="text-2xl font-bold text-purple-800">5</p>
          </div>
        </div>
      </div>

      
    </div>
  );
};
