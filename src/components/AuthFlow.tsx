import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, Shield, User as UserIcon } from 'lucide-react';
import { useLMS } from '../store/LMSContext';
import { UserRole } from '../types/lms';
import { BrandMark } from './BrandMark';

interface AuthFlowProps {
  mode: 'signup' | 'signin';
}

export const AuthFlow: React.FC<AuthFlowProps> = ({ mode }) => {
  const { signUp, signIn, navigate } = useLMS();

  // Sign-Up fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('learner');

  // Banners & errors
  const [error, setError] = useState('');
  const [signupSuccessBanner, setSignupSuccessBanner] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('created') === '1';
  });

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = signUp({ name, email, password, role });
    if (!res.ok) {
      setError(res.error || 'Unable to create account.');
      return;
    }
    setPassword('');
    setSignupSuccessBanner(true);
    navigate('/signin?created=1');
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = signIn(email, password);
    if (!res.ok || !res.user) {
      setError(res.error || 'Authentication failed.');
      return;
    }
    navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
  };

  const handleQuickDemo = (demoEmail: string, demoPassword: string) => {
    setError('');
    const res = signIn(demoEmail, demoPassword);
    if (res.ok && res.user) {
      navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <header className="border-b border-[#E4E4E7] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-[13px] text-[#71717A] hover:text-[#09090B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span>Back to Intergrid IT</span>
          </button>
          <BrandMark theme="light" size="sm" />
          <div className="text-[13px] text-[#71717A]">
            {mode === 'signup' ? (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  navigate('/signin');
                }}
                className="font-medium text-[#09090B] hover:underline"
              >
                Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setSignupSuccessBanner(false);
                  navigate('/signup');
                }}
                className="font-medium text-[#09090B] hover:underline"
              >
                Create Account
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-[460px]">
          {mode === 'signin' && signupSuccessBanner && (
            <div
              role="status"
              className="mb-5 p-4 rounded-[8px] bg-[#09090B] text-white flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="text-[13px] leading-relaxed">
                Account created. Please sign in to access your workspace.
              </div>
            </div>
          )}

          <div className="bg-white border border-[#E4E4E7] rounded-[10px] p-8">
            <div className="mb-6">
              <h1 className="font-display font-semibold text-[24px] text-[#09090B]">
                {mode === 'signup' ? 'Create your workspace account' : 'Sign in to Intergrid IT'}
              </h1>
              <p className="mt-1.5 text-[14px] text-[#71717A]">
                {mode === 'signup'
                  ? 'Register as a Learner or Admin to explore the curriculum and management tools.'
                  : 'Enter your credentials to enter your personalized learning or admin workspace.'}
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 px-3.5 py-2.5 rounded-[6px] border border-[#09090B] bg-[#F4F4F5] text-[13px] text-[#09090B]"
              >
                {error}
              </div>
            )}

            {mode === 'signup' ? (
              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#09090B] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Mercer"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[14px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#09090B] mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.mercer@company.com"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[14px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#09090B] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[14px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                  />
                </div>

                <div>
                  <span className="block text-[13px] font-medium text-[#09090B] mb-1.5">
                    Account Role (Demo Toggle)
                  </span>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F4F5] rounded-[8px] border border-[#E4E4E7]">
                    <button
                      type="button"
                      onClick={() => setRole('learner')}
                      className={`py-2 px-3 rounded-[6px] text-[13px] font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                        role === 'learner'
                          ? 'bg-[#09090B] text-white'
                          : 'text-[#71717A] hover:text-[#09090B]'
                      }`}
                    >
                      <UserIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Learner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2 px-3 rounded-[6px] text-[13px] font-medium inline-flex items-center justify-center gap-2 transition-colors ${
                        role === 'admin'
                          ? 'bg-[#09090B] text-white'
                          : 'text-[#71717A] hover:text-[#09090B]'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Admin</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#09090B] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya.lin@intergrid.it"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[14px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#09090B] mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-[6px] border border-[#E4E4E7] bg-white text-[14px] text-[#09090B] focus:outline-none focus:border-[#09090B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-[6px] bg-[#09090B] hover:bg-[#18181B] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span>Sign In</span>
                </button>
              </form>
            )}

            {mode === 'signin' && (
              <div className="mt-7 pt-6 border-t border-[#E4E4E7]">
                <div className="text-[12px] font-medium text-[#71717A] mb-3">
                  Instant Demo Accounts
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('maya.lin@intergrid.it', 'password123')}
                    className="p-3 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] hover:border-[#09090B] text-left transition-colors"
                  >
                    <div className="text-[13px] font-semibold text-[#09090B]">Maya Lin</div>
                    <div className="text-[11px] text-[#71717A] mt-0.5">
                      Learner Workspace
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin@intergrid.it', 'admin123')}
                    className="p-3 rounded-[6px] border border-[#E4E4E7] bg-[#FAFAFA] hover:border-[#09090B] text-left transition-colors"
                  >
                    <div className="text-[13px] font-semibold text-[#09090B]">Claire Sterling</div>
                    <div className="text-[11px] text-[#71717A] mt-0.5">
                      Admin Console
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
