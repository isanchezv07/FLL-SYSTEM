import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface User {
  id: number;
  username: string;
  password: string;
  role: string;
}

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const userFound = await response.json();
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', userFound.username);
        localStorage.setItem('role', userFound.role);
        localStorage.setItem('token', userFound.token);

        toast.success(`Bienvenido, ${userFound.username}`);

        switch (userFound.role) {
          case 'admin':
            window.location.href = '/roles/admin/admin_dashboard';
            break;
          case 'ref':
            window.location.href = '/roles/referee/ref';
            break;
          default:
            window.location.href = '/auth/login';
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Usuario o contraseña incorrectos');
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error al autenticar usuario:', error);
      toast.error('Error al conectar con el servidor');
      localStorage.clear();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8fafc] relative overflow-hidden font-sans">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Fondo decorativo profesional */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
        <div className="absolute top-0 left-0 w-full h-1 flex">
          <div className="h-full flex-1 bg-gradient-to-r from-[#006847] to-[#008f62]"></div>
          <div className="h-full flex-1 bg-white"></div>
          <div className="h-full flex-1 bg-gradient-to-r from-[#CE1126] to-[#ef4444]"></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden border border-white/20">
          <div className="p-8 pb-0 text-center">
            <img 
                src="/img/logo_internacional.svg" 
                alt="FLL Logo" 
                className="h-16 mx-auto"
              />
            <p className="text-gray-500 mt-6 font-medium">Sistema de Puntaje</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="username" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Usuario
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  placeholder="user123"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006847]/10 focus:border-[#006847] transition-all duration-200 placeholder:text-gray-300"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#006847]/10 focus:border-[#006847] transition-all duration-200 placeholder:text-gray-300"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-gray-900/20 transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest text-sm relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Iniciar Sesión
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#006847] via-transparent to-[#CE1126] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              </button>
            </form>
          </div>

          <div className="bg-gray-50/50 px-8 py-6 border-t border-gray-100 flex flex-col items-center gap-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Season 2025 - 2026</p>
            <div className="flex gap-4">
               <div className="w-8 h-1 bg-[#006847] rounded-full opacity-30"></div>
               <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
               <div className="w-8 h-1 bg-[#CE1126] rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
        
        <footer className="mt-8 text-center">
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            © 2026 FIRST LEGO League México
          </p>
          <div className="mt-2">
            <a
              href="https://github.com/isanchezv07"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#006847] transition-colors"
            >
              System by @isanchezv07
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LoginForm;