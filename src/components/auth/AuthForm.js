'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

const AuthForm = ({ defaultMode = 'login' }) => {
  const router = useRouter();
  const [switched, setSwitched] = useState(defaultMode === 'register');
  const [formData, setFormData] = useState({
    username: '',  
    email: '',
    password: ''
  });  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setSwitched(defaultMode === 'register');
  }, [defaultMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const response = switched 
        ? await authApi.register({
            username: formData.username,
            email: formData.email,
            password: formData.password
          })
        : await authApi.login({
            email: formData.email,
            password: formData.password
          });
  
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-6 flex flex-col items-center justify-center font-['Roboto',-apple-system,BlinkMacSystemFont,Helvetica,Arial,sans-serif]">
      <div className="w-[1000px] max-w-full relative mb-8">
        <div className={`h-[600px] relative filter drop-shadow-2xl ${switched ? 's--switched' : ''}`}>
          {/* Inner Container with Arrow Shape */}
          <div className="relative h-full pr-[300px] bg-white/95 backdrop-blur-sm overflow-hidden transition-[clip-path] duration-1000 ease-in-out"
               style={{
                 clipPath: switched 
                   ? 'polygon(40px 0, 100% 0, 100% 50%, 100% 100%, 40px 100%, 0 50%)'
                   : 'polygon(0 0, calc(100% - 40px) 0, 100% 50%, calc(100% - 40px) 100%, 0 100%, 0 50%)'
               }}>
            
            {/* Forms Container */}
            <div className={`h-full transition-transform duration-1000 ease-in-out ${switched ? 'translate-x-[300px]' : ''}`}>
              {/* Sign In Form */}
              <div className={`absolute inset-0 transition-all duration-500 transform ${switched ? 'opacity-0 translate-x-8 pointer-events-none' : 'translate-x-0'}`}>
                <div className="w-[350px] mx-auto">
                  <form onSubmit={handleSubmit} className="flex flex-col items-center w-full h-full pt-[60px] space-y-6 text-center">
                    <div className="text-3xl font-bold text-indigo-900">Welcome back to Habitly</div>
                    <p className="text-gray-600">Track your habits, achieve your goals</p>
                    
                    {error && (
                      <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                        {error}
                      </div>
                    )}
                    
                    <label className="w-full">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Email</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full mt-2 pb-2 text-lg text-center border-b-2 border-gray-300 focus:border-indigo-500 transition-colors focus:outline-none"
                        required
                      />
                    </label>
                    
                    <label className="w-full">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Password</span>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="block w-full mt-2 pb-2 text-lg text-center border-b-2 border-gray-300 focus:border-indigo-500 transition-colors focus:outline-none"
                        required
                      />
                    </label>

                    <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors">
                      Forgot your password?
                    </a>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all ${loading ? 'opacity-70' : ''}`}
                    >
                      {loading ? 'Processing...' : 'Sign In'}
                    </button>

                    <div className="relative w-full py-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-sm text-gray-500">Or continue with</span>
                      </div>
                    </div>

                    <button type="button" className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      Continue with Google
                    </button>
                  </form>
                </div>
              </div>

              {/* Sign Up Form */}
              <div className={`absolute inset-0 transition-all duration-500 transform ${switched ? 'translate-x-0' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
                <div className="w-[350px] mx-auto">
                  <form onSubmit={handleSubmit} className="flex flex-col items-center w-full h-full pt-[60px] space-y-6 text-center">
                    <div className="text-3xl font-bold text-indigo-900">Join Habitly</div>
                    <p className="text-gray-600">Start your journey to better habits</p>
                    
                    {error && (
                      <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                        {error}
                      </div>
                    )}

<label className="w-full">
  <span className="text-xs text-gray-500 uppercase tracking-wider">Username</span>
  <input
    type="text"
    name="username"
    value={formData.username}
    onChange={handleInputChange}
    className="block w-full mt-2 pb-2 text-lg text-center border-b-2 border-gray-300 focus:border-indigo-500 transition-colors focus:outline-none"
    required
  />
</label>
                    
                    <label className="w-full">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Email</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="block w-full mt-2 pb-2 text-lg text-center border-b-2 border-gray-300 focus:border-indigo-500 transition-colors focus:outline-none"
                        required
                      />
                    </label>
                    
                    <label className="w-full">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">Password</span>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="block w-full mt-2 pb-2 text-lg text-center border-b-2 border-gray-300 focus:border-indigo-500 transition-colors focus:outline-none"
                        required
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-lg rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all ${loading ? 'opacity-70' : ''}`}
                    >
                      {loading ? 'Processing...' : 'Create Account'}
                    </button>

                    <div className="relative w-full py-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-sm text-gray-500">Or join with</span>
                      </div>
                    </div>

                    <button type="button" className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      Continue with Google
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Switcher */}
            <div 
              className="absolute inset-0 overflow-hidden bg-cover bg-center transition-[clip-path] duration-1000 ease-in-out z-10"
              style={{
                backgroundImage: "url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/142996/sections-3.jpg')",
                clipPath: switched
                  ? 'polygon(40px 0, 300px 0, 260px 50%, 300px 100%, 40px 100%, 0 50%)'
                  : 'polygon(calc(100% - 300px) 0, calc(100% - 40px) 0, 100% 50%, calc(100% - 40px) 100%, calc(100% - 300px) 100%, calc(100% - 300px + 40px) 50%)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90" />
              
              <div className={`h-full transition-transform duration-1000 ease-in-out ${switched ? '-translate-x-[calc(100%-300px)]' : ''}`}>
                <div className="absolute right-0 top-0 flex flex-col justify-center w-[300px] h-full text-white">
                  <div className={`flex h-[180px] transition-transform duration-1000 ease-in-out ${switched ? '-translate-x-full' : ''}`}>
                    <div className="w-full flex-shrink-0 text-center px-12">
                      <h3 className="text-2xl font-bold mb-6">New to Habitly?</h3>
                      <p className="text-lg leading-relaxed text-gray-200">
                        Join us and start building better habits for a better tomorrow!
                      </p>
                    </div>
                    <div className="w-full flex-shrink-0 text-center px-12">
                      <h3 className="text-2xl font-bold mb-6">Welcome Back!</h3>
                      <p className="text-lg leading-relaxed text-gray-200">
                        Sign in to continue your journey to better habits!
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSwitched(!switched)}
                    className="relative w-[140px] h-12 mx-auto mt-8 overflow-hidden group"
                  >
                    <div className="absolute inset-0 border-2 border-white rounded-lg group-hover:bg-white/10 transition-colors" />
                    <div className="absolute inset-0">
                      <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-1000 uppercase text-base font-medium tracking-wider ${switched ? 'translate-y-full' : ''}`}>
                        Get Started
                      </span>
                      <span className={`absolute inset-0 flex items-center justify-center -translate-y-full transition-transform duration-1000 uppercase text-base font-medium tracking-wider ${switched ? 'translate-y-full' : ''}`}>
                        Sign In
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;