import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login: saveAuth } = useAuth();
  const [formData, setFormData] = useState({
    npm_atau_nip: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await login(formData.npm_atau_nip, formData.password);

      if (response.access_token && response.user) {
        saveAuth(response.access_token, response.user);
      }

      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        setIsLoading(false);
        return;
      } else {
        setError('Terjadi kesalahan saat login');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] flex flex-col items-center pt-20 font-sans">
      
      {/* Header Institusi*/}
      <div className="w-full max-w-md border-t-8 border-yellow-500 bg-white p-6 shadow-sm border-x border-b border-gray-300">
        <div className="text-center">
          <Link to="/dashboard">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase italic hover:opacity-80 transition-opacity">
              SIAK<span className="text-yellow-600">NG</span>-LITE
            </h1>
          </Link>
          <div className="h-px bg-gray-200 w-full my-4"></div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
            Sistem Informasi Akademik Next Generation
          </p>
        </div>
      </div>

      <div className="mt-4 w-full max-w-md">
        <div className="bg-white p-8 border border-gray-300 shadow-none">
          <h2 className="text-lg font-bold text-gray-800 mb-6 border-l-4 border-yellow-500 pl-3">
            LOGIN PENGGUNA
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Input NPM / NIP */}
            <div>
              <label htmlFor="npm_atau_nip" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Nomor Identitas (NPM/NIP)
              </label>
              <input
                id="npm_atau_nip"
                name="npm_atau_nip"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-yellow-600 focus:ring-0 text-sm rounded-none placeholder-gray-300"
                placeholder="Contoh: 2406398381"
                onChange={handleChange}
              />
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full px-3 py-2 border border-gray-400 focus:outline-none focus:border-yellow-600 focus:ring-0 text-sm rounded-none"
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold uppercase text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 text-xs font-bold uppercase tracking-widest transition-colors duration-200 rounded-none border-b-4 border-yellow-600 active:border-b-0 active:mt-1 flex justify-center items-center ${
                  isLoading
                  ? 'bg-gray-500 border-gray-700 cursor-not-allowed text-gray-200'
                  : 'bg-[#2c2c2c] text-white hover:bg-black'
                }`}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="mr-3" />
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </div>
          </form>

          {/* Footer Card */}
          <div className="mt-2f pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-tighter">
              Akses terbatas hanya untuk sivitas akademika.
              <br />
            </p>
          </div>
        </div>
        
        {/* Help Text Outside Card */}
        <p className="text-center mt-6 text-[10px] text-gray-500 font-medium">
          &copy; 2026 Prasetya Surya Syahputra.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;