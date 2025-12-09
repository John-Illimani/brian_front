// src/components/SchoolLogin.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock } from "lucide-react";
import { login } from "../services/authServices"; // ← corregido
import { useNavigate } from "react-router-dom";

// Partículas decorativas
const Particles = () => {
  const particles = Array.from({ length: 25 });
  return (
    <div className="absolute inset-0 overflow-hidden -z-10">
      {particles.map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            y: [Math.random() * window.innerHeight, -20],
            opacity: [0.3, 1, 0],
            scale: [0.5, 1, 0.8],
          }}
          transition={{
            duration: 8 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const SchoolLogin = () => {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login({ username, password }); 
      switch ((user?.rol || "").toLowerCase()) {
        case "docente":
          navigate("/home-teacher", { replace: true });
          break;
        case "estudiante":
          navigate("/home-student", { replace: true });
          break;
        case "director":
          navigate("/home-intendente", { replace: true });
          break;
        default:
          navigate("/teacher", { replace: true });
      }
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Credenciales inválidas o error de servidor."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-white/5 to-blue-950 text-white px-4 overflow-hidden">
      <Particles />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md bg-gray-700/60 backdrop-blur-lg border border-white/20 shadow-2xl rounded-3xl p-8 md:p-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-8 "
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-100">
            🎓 Portal Estudiantil
          </h1>
          <p className="text-blue-200 mt-2 text-sm md:text-base">
            Inicia sesión con tu cuenta institucional
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleLogin}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-6"
        >
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-blue-400" size={20} />
            <input
              type="text"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 border border-white/20 text-blue-50 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 transition-all"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-blue-400" size={20} />
            <input
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 border border-white/20 text-blue-50 placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/30 transition-all"
              required
            />
          </div>

          {error && <p className="text-red-300 text-sm -mt-2">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px #3b82f6" }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-sm text-blue-200"
        >
          ¿Olvidaste tu contraseña?{" "}
          <a href="#" className="text-blue-400 hover:underline font-medium">
            Recuperar
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-blue-700 via-blue-800 to-transparent rounded-t-[50%] blur-3xl -z-20"
      />
    </div>
  );
};
