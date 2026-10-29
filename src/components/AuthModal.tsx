import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Lock, Mail, User, Phone, AlertCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  defaultRole?: 'customer' | 'salon_owner';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  defaultRole = 'customer',
  onClose,
  onSuccess
}) => {
  const { login, register, demoLogin } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<'customer' | 'salon_owner'>(defaultRole);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          fullName,
          email,
          phone,
          password,
          role
        });
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole: 'customer' | 'salon_owner' | 'admin') => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await demoLogin(demoRole);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-semibold text-purple-900 tracking-wider uppercase block mb-1">
            SalonBook Account
          </span>
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            {mode === 'login'
              ? 'Access your appointments, preferences, and saved salons.'
              : 'Join thousands of satisfied clients booking India’s best salons.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <>
              {/* Role Picker */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    role === 'customer'
                      ? 'border-purple-950 bg-purple-50/50 text-purple-950'
                      : 'border-neutral-200 text-neutral-600 bg-neutral-50'
                  }`}
                >
                  I'm a Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('salon_owner')}
                  className={`py-2 px-3 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    role === 'salon_owner'
                      ? 'border-purple-950 bg-purple-50/50 text-purple-950'
                      : 'border-neutral-200 text-neutral-600 bg-neutral-50'
                  }`}
                >
                  Salon Owner / Partner
                </button>
              </div>

              <div>
                <label className="text-neutral-700 font-semibold block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-700 font-semibold block mb-1">Mobile Phone (India)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-900"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-neutral-700 font-semibold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>
          </div>

          <div>
            <label className="text-neutral-700 font-semibold block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-purple-950 hover:bg-purple-900 text-white rounded-xl font-bold transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Login / Register */}
        <div className="mt-4 pt-4 border-t border-neutral-100 text-center text-xs text-neutral-600">
          {mode === 'login' ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-purple-950 font-bold hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-purple-950 font-bold hover:underline cursor-pointer"
              >
                Log in
              </button>
            </p>
          )}
        </div>

        {/* Quick Demo Accounts Helper Strip */}
        <div className="mt-5 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Instant Demo Switcher (For Evaluation):</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="py-1.5 px-2 bg-white hover:bg-purple-50 text-neutral-800 hover:text-purple-950 rounded-lg border border-neutral-200 font-semibold text-center transition-colors cursor-pointer"
            >
              Rohit (Client)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('salon_owner')}
              className="py-1.5 px-2 bg-white hover:bg-purple-50 text-neutral-800 hover:text-purple-950 rounded-lg border border-neutral-200 font-semibold text-center transition-colors cursor-pointer"
            >
              Arjun (Owner)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 bg-white hover:bg-purple-50 text-neutral-800 hover:text-purple-950 rounded-lg border border-neutral-200 font-semibold text-center transition-colors cursor-pointer"
            >
              Vikram (Admin)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
