import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart2, User, LogOut, Menu } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { logout } from "../../services/authServices";

export const StudentSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      name: "Calificaciones",
      icon: <BarChart2 size={20} />,
      link: "/home-student/grades",
    },
    { name: "Perfil", icon: <User size={20} />, link: "/home-student/profile" },
    {
      name: "Calendario",
      icon: <User size={20} />,
      link: "/home-student/calendar",
    },
    
    {
      name: "Mi Horario",
      icon: <User size={20} />,
      link: "/home-student/horario",
    },
    { name: "Cerrar Sesión", icon: <LogOut size={20} /> },
  ];

  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 text-white">
      {/* Sidebar */}
      <motion.div
        animate={{ width: isOpen ? 240 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-blue-800/80 backdrop-blur-lg border-r border-white/20 p-5 pt-8 relative shadow-xl flex flex-col justify-between"
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-9 w-8 h-8 bg-white text-blue-800 rounded-full flex justify-center items-center shadow cursor-pointer"
        >
          {isOpen ? "<" : ">"}
        </button>

        {/* Logo */}
        <div className="gap-3 mb-10">
          <motion.img
            src="/logo.png"
            alt="Logo Colegio"
            className="h-10 w-10 rounded-full border-2 border-blue-400 shadow-md block ml-auto mr-auto "
            initial={{ rotate: -10, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          <br />

          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.span
                key="boletin-escolar"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="text-lg font-bold text-blue-100 block text-center"
              >
                Boletín Escolar
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Menú */}

        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {item.name === "Cerrar Sesión" ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                >
                  <span className="text-red-300">{item.icon}</span>
                  {isOpen && (
                    <span className="text-red-100 font-medium tracking-wide">
                      {item.name}
                    </span>
                  )}
                </button>
              ) : (
                <Link
                  to={item.link}
                  className="flex items-center gap-4 p-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  <span className="text-blue-200">{item.icon}</span>
                  {isOpen && (
                    <span className="text-blue-100 font-medium tracking-wide">
                      {item.name}
                    </span>
                  )}
                </Link>
              )}
            </motion.li>
          ))}
        </ul>

        {/* Pie del menú */}
        <div className="mt-auto pt-6 text-center text-xs text-blue-300 border-t border-white/20">
          © 2025 Portal Estudiantil
        </div>
      </motion.div>

      {/* Contenido dinámico */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-1  text-blue-100 overflow-auto"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};
