import React, { useState } from 'react';
import { authService, UserSession } from '../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authService.login(username, password, rememberMe);
      if (result.success && result.session) {
        onLoginSuccess(result.session);
        onClose();
      } else {
        setError(result.message || 'Error al iniciar sesión.');
      }
    } catch {
      setError('Ocurrió un error inesperado al autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ✕
          </button>
          <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Acceso a El Profe UT</h2>
          <p className="text-blue-100 text-sm mt-1">Ingresa con tus credenciales de suscriptor activo</p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start space-x-2 animate-shake">
              <span className="text-base">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Usuario de Acceso
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: alumno1_ut"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-gray-50 focus:bg-white"
              />
              <span className="absolute left-3 top-3.5 text-gray-400 text-sm">👤</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-700 mb-1">
              Contraseña / Clave
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-gray-50 focus:bg-white"
              />
              <span className="absolute left-3 top-3.5 text-gray-400 text-sm">🔑</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-sm p-1"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Recordar sesión</span>
            </label>
            <a
              href="https://wa.me/573042147440?text=Hola%20Smith,%20olvid%C3%A9%20mi%20clave%20de%20El%20Profe%20UT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              ¿Olvidaste tu clave?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <span>Entrar al Tutor Virtual →</span>
            )}
          </button>
        </form>

        {/* Modal Footer / WhatsApp Purchase Link */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-600 space-y-1">
          <p>¿Aún no tienes suscripción activa?</p>
          <a
            href="https://wa.me/573042147440?text=Hola%20Smith,%20deseo%20adquirir%20mi%20acceso%20mensual%20a%20El%20Profe%20UT"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-green-700 font-bold hover:underline"
          >
            <span className="mr-1">💬</span> Adquiere tu plan mensual por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
