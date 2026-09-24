import React, { useState } from 'react';
import BrainIcon from './icons/BrainIcon';
import LoginModal from './LoginModal';
import { UserSession } from '../services/authService';

interface LandingPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const whatsappBaseUrl = "https://wa.me/573042147440?text=";

  const getWhatsappLink = (planName: string, price: string) => {
    const text = encodeURIComponent(`Hola Smith, deseo adquirir el *${planName}* (${price}) para acceder a *El Profe UT*. ¿Cuáles son los métodos de pago?`);
    return `${whatsappBaseUrl}${text}`;
  };

  const faqs = [
    {
      q: "¿Cómo funciona El Profe UT?",
      a: "El Profe UT es un tutor inteligente diseñado especialmente con el pensum de matemáticas escolares y universitarias de la Universidad del Tolima. Te explica conceptos paso a paso con fórmulas claras en LaTeX, resuelve dudas en tiempo real y te pone ejercicios interactivos con retroalimentación instantánea."
    },
    {
      q: "¿Qué temas incluye la plataforma?",
      a: "Incluye Álgebra (básica y avanzada), Geometría, Trigonometría, Cálculo Diferencial, Cálculo Integral y Estadística. Todo con niveles desde principiante hasta experto."
    },
    {
      q: "¿Cómo obtengo mi usuario y clave de acceso?",
      a: "Elige cualquiera de nuestros planes (Mensual, Semestral o Anual), haz clic en 'Adquirir por WhatsApp' y tras confirmar tu pago (vía Nequi, Daviplata o Bancolombia) recibirás tus credenciales exclusivas al instante."
    },
    {
      q: "¿Puedo usarlo desde mi celular o computador?",
      a: "¡Sí! El Profe UT es 100% web responsive. Puedes estudiar cómodamente desde tu smartphone, tablet, laptop o PC sin instalar aplicaciones pesadas."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-gray-100 flex flex-col selection:bg-blue-500 selection:text-white font-sans">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-xs md:text-sm py-2 px-4 text-center font-medium shadow-md">
        <span>🚀 <strong>Nuevo semestre:</strong> ¡Planes con 40% de descuento disponibles por tiempo limitado!</span>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600/20 p-2.5 rounded-xl border border-blue-500/30">
              <BrainIcon className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                El Profe UT
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">IA Tutor</span>
              </span>
              <p className="text-[11px] text-gray-400 hidden sm:block">AissistPro • Universidad del Tolima</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="#planes"
              className="text-sm font-semibold text-gray-300 hover:text-white px-3 py-2 transition hidden md:inline-block"
            >
              Ver Planes
            </a>
            <a
              href="#modulos"
              className="text-sm font-semibold text-gray-300 hover:text-white px-3 py-2 transition hidden md:inline-block"
            >
              Módulos
            </a>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition transform active:scale-95 flex items-center space-x-2"
            >
              <span>🔑</span>
              <span>Ingresar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 rounded-full px-4 py-1.5 mb-8 shadow-inner">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-gray-300">Potenciado con IA de Última Generación</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
            Domina las Matemáticas y <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Gana Todos tus Parciales en la UT
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Tu tutor particular con Inteligencia Artificial disponible las 24 horas del día. Explicaciones paso a paso en <strong className="text-white">Cálculo, Álgebra, Trigonometría y Estadística</strong> con fórmulas claras y resolución de dudas en vivo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <a
              href="#planes"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl text-base shadow-xl shadow-blue-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0 text-center"
            >
              🚀 Comenzar Ahora (Ver Planes)
            </a>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-gray-200 border border-slate-700 font-bold rounded-xl text-base transition text-center"
            >
              🔑 Ya tengo cuenta (Ingresar)
            </button>
          </div>

          {/* Metric highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-blue-400">24/7</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Disponibilidad Total</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-indigo-400">100%</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Paso a Paso con LaTeX</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-purple-400">+500</p>
              <p className="text-xs text-gray-400 font-medium mt-1">Ejercicios & Problemas</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">0 Estrés</p>
              <p className="text-xs text-gray-400 font-medium mt-1">A tu propio ritmo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules & Features Section */}
      <section id="modulos" className="py-20 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400 mb-2">Características Clave</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Diseñado para Que Entiendas de Verdad
            </p>
            <p className="text-gray-400 mt-4 text-base">
              No más videos confusos ni profesores que explican de afán. El Profe UT se adapta a tu nivel de comprensión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition group">
              <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6 text-blue-400 group-hover:scale-110 transition">
                📘
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Modo Aprende Conceptual</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Explicaciones teóricas y prácticas estructuradas con rigor matemático. Cada tema viene desglosado con fórmulas renderizadas en LaTeX y recomendaciones de videos para reforzar.
              </p>
              <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                Álgebra • Cálculo • Trigonometría
              </span>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6 text-indigo-400 group-hover:scale-110 transition">
                💬
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Tutor IA Conversacional</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Hazle cualquier pregunta en lenguaje natural. Si no entiendes un paso, dile &quot;explícamelo más sencillo&quot; o &quot;dame una analogía de la vida real&quot; y el tutor se adaptará inmediatamente.
              </p>
              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Preguntas Ilimitadas 24/7
              </span>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition group">
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6 text-purple-400 group-hover:scale-110 transition">
                📝
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Banco de Práctica & Simulacros</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Generación infinita de ejercicios calibrados por dificultad (Fácil, Medio, Difícil, Experto). Ingresa tu respuesta y obtén corrección inmediata con desglose paso a paso.
              </p>
              <span className="text-xs font-semibold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                Calibrado a Parciales UT
              </span>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition group">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6 text-emerald-400 group-hover:scale-110 transition">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Modo Repaso Relámpago</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Ideal para la noche antes del parcial. Resúmenes compactos, propiedades clave, identidades trigonométricas y teoremas esenciales para memorizar y aplicar rápido.
              </p>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Ahorro de Tiempo Máximo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Planes Mensuales) */}
      <section id="planes" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400 mb-2">Planes de Suscripción</h2>
            <p className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Invierte en tus Notas y Tranquilidad
            </p>
            <p className="text-gray-400 mt-4 text-base">
              Menos de lo que cuesta una sola hora de profesor particular tradicional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan Mensual */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition relative">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  Básico Mensual
                </span>
                <h3 className="text-2xl font-bold text-white mt-4">Plan Mes a Mes</h3>
                <p className="text-gray-400 text-xs mt-1">Ideal para probar o preparar un corte específico</p>
                
                <div className="my-6">
                  <span className="text-4xl font-black text-white">$24.900</span>
                  <span className="text-gray-400 text-sm font-medium"> COP / mes</span>
                </div>

                <ul className="space-y-3 text-sm text-gray-300 mb-8">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Acceso completo 24/7</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Todos los temas (Álgebra a Cálculo)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Tutor IA Conversacional sin límites</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-400">✓</span>
                    <span>Banco de ejercicios interactivo</span>
                  </li>
                </ul>
              </div>

              <a
                href={getWhatsappLink("Plan Mensual", "$24.900 COP")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm text-center transition border border-slate-700 flex items-center justify-center space-x-2"
              >
                <span>💬</span>
                <span>Adquirir por WhatsApp</span>
              </a>
            </div>

            {/* Plan Semestral (DESTACADO) */}
            <div className="rounded-3xl bg-gradient-to-b from-blue-900/40 to-slate-900 border-2 border-blue-500 p-8 flex flex-col justify-between relative shadow-2xl shadow-blue-500/10 transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-lg">
                🔥 Más Popular • Ahorra 40%
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                  Semestre Académico
                </span>
                <h3 className="text-2xl font-bold text-white mt-4">Plan Semestral Pro</h3>
                <p className="text-gray-300 text-xs mt-1">Acompañamiento garantizado todo el semestre</p>
                
                <div className="my-6">
                  <span className="text-4xl font-black text-white">$89.900</span>
                  <span className="text-gray-400 text-sm font-medium"> COP / semestre</span>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-1">Equivale a ~$14.900 COP / mes</p>
                </div>

                <ul className="space-y-3 text-sm text-gray-200 mb-8">
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span><strong>6 Meses de Acceso Total</strong></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>Todos los módulos de Matemáticas & Cálculo</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>Simulacros de parciales UT incluidos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-blue-400 font-bold">✓</span>
                    <span>Soporte prioritario por WhatsApp</span>
                  </li>
                </ul>
              </div>

              <a
                href={getWhatsappLink("Plan Semestral Pro", "$89.900 COP")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-extrabold text-sm text-center shadow-lg shadow-blue-500/30 transition transform hover:scale-102 flex items-center justify-center space-x-2"
              >
                <span>🚀</span>
                <span>Adquirir Plan Semestral</span>
              </a>
            </div>

            {/* Plan Anual */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 flex flex-col justify-between hover:border-slate-700 transition relative">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                  Acceso Total Anual
                </span>
                <h3 className="text-2xl font-bold text-white mt-4">Plan Anual Éxito</h3>
                <p className="text-gray-400 text-xs mt-1">Máximo ahorro para dos semestres completos</p>
                
                <div className="my-6">
                  <span className="text-4xl font-black text-white">$149.900</span>
                  <span className="text-gray-400 text-sm font-medium"> COP / año</span>
                  <p className="text-[11px] text-purple-400 font-semibold mt-1">Equivale a ~$12.400 COP / mes</p>
                </div>

                <ul className="space-y-3 text-sm text-gray-300 mb-8">
                  <li className="flex items-center space-x-2">
                    <span className="text-purple-400">✓</span>
                    <span><strong>12 Meses de Acceso Ilimitado</strong></span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-purple-400">✓</span>
                    <span>Todas las actualizaciones y nuevas materias</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-purple-400">✓</span>
                    <span>Acceso para 2 dispositivos simultáneos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-purple-400">✓</span>
                    <span>Garantía de satisfacción</span>
                  </li>
                </ul>
              </div>

              <a
                href={getWhatsappLink("Plan Anual Éxito", "$149.900 COP")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm text-center transition border border-slate-700 flex items-center justify-center space-x-2"
              >
                <span>💬</span>
                <span>Adquirir por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 bg-slate-950/40 border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400 mb-2">Casos de Éxito</h2>
            <p className="text-3xl font-extrabold text-white">Lo Que Dicen Nuestros Estudiantes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <p className="text-gray-300 text-sm italic leading-relaxed mb-4">
                &quot;Iba perdiendo Cálculo Diferencial con 2.1. Empecé a usar El Profe UT para entender las derivadas por regla de la cadena y en el segundo corte saqué 4.4. Las explicaciones paso a paso no tienen comparación.&quot;
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                  CM
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Carlos Morales</p>
                  <p className="text-xs text-gray-400">Ingeniería de Sistemas • Universidad del Tolima</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <p className="text-gray-300 text-sm italic leading-relaxed mb-4">
                &quot;Poder preguntarle al Tutor IA a las 11 de la noche sin pena de preguntar cosas básicas fue lo que me salvó en Álgebra Lineal y Trigonometría. 100% recomendado para cualquiera en la UT.&quot;
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                  VR
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Valentina Restrepo</p>
                  <p className="text-xs text-gray-400">Licenciatura en Matemáticas • Universidad del Tolima</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs uppercase font-bold tracking-widest text-blue-400 mb-2">Dudas Frecuentes</h2>
            <p className="text-3xl font-extrabold text-white">Preguntas Frecuentes</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/50"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full py-4 px-6 text-left font-bold text-white text-base flex items-center justify-between hover:bg-slate-800/50 transition"
                >
                  <span>{faq.q}</span>
                  <span className="text-blue-400 text-xl ml-4 font-normal">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-sm text-gray-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Bar */}
      <section className="py-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            ¿Listo para Transformar tus Notas de Matemáticas?
          </h2>
          <p className="text-blue-100 text-base max-w-xl mx-auto">
            Únete a los estudiantes que ya están aprobando con tranquilidad. Elige tu plan y obtén tus credenciales en menos de 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="#planes"
              className="w-full sm:w-auto px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-black rounded-xl text-base shadow-2xl transition transform hover:scale-102"
            >
              Comprar Suscripción por WhatsApp
            </a>
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-black/30 hover:bg-black/40 text-white font-bold rounded-xl text-base border border-white/20 transition"
            >
              🔑 Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-10 border-t border-slate-800/80 text-gray-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="font-bold text-white text-sm mb-1">El Profe UT — Tutor de Matemáticas con IA</p>
            <p>Respaldado por <strong className="text-blue-400">AissistPro</strong> y la <strong className="text-blue-400">Universidad del Tolima</strong></p>
            <p className="mt-1">Desarrollado y dirigido por <strong className="text-gray-200">Smith Córdoba</strong></p>
          </div>
          <div className="space-y-1">
            <p>📞 Contacto directo de ventas y soporte:</p>
            <a
              href="https://wa.me/573042147440"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline font-bold text-sm block"
            >
              +57 304 214 7440 (WhatsApp)
            </a>
            <p className="text-[11px] text-gray-500">© 2026 El Profe UT. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
};

export default LandingPage;
