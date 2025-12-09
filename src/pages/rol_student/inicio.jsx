import React from "react";
import { motion } from "framer-motion";

export const Inicio = () => {
  const cards = [
    {
      title: "Mis Boletines",
      text: "Accede a tus boletines trimestrales de este año escolar.",
    },
    {
      title: "Calificaciones",
      text: "Revisa tus calificaciones por materia y trimestre.",
    },
    {
      title: "Calendario Escolar",
      text: "Consulta las fechas importantes de evaluaciones y actividades.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white/15 to-blue-950 text-white p-6">
      {/* Encabezado */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-extrabold text-center text-blue-100"
      >
        Bienvenido al Portal Estudiantil
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="mt-4 text-center text-blue-200 max-w-2xl mx-auto"
      >
        Aquí puedes consultar tus boletines trimestrales, ver tus calificaciones y seguir el calendario escolar.
      </motion.p>

      {/* Tarjetas */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index, duration: 0.6 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 20px rgba(96, 165, 250, 0.5)",
            }}
            className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300"
          >
            <h2 className="text-xl font-semibold text-blue-100 mb-2">
              {card.title}
            </h2>
            <p className="text-blue-200">{card.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
