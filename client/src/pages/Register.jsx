import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Compute password strength and criteria
  const passwordCriteria = useMemo(() => {
    const pwd = formData.password;
    const name = formData.name.toLowerCase().trim();
    const email = formData.email.toLowerCase().trim();
    const emailPrefix = email ? email.split('@')[0] : '';

    const hasMinLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    // Check if password contains name (parts >= 3 chars)
    let containsName = false;
    if (name) {
      const parts = name.split(/[\s_-]+/).filter(p => p.length >= 3);
      for (const part of parts) {
        if (pwd.toLowerCase().includes(part)) {
          containsName = true;
          break;
        }
      }
    }

    // Check if password contains email prefix (if >= 3 chars)
    let containsEmail = false;
    if (emailPrefix && emailPrefix.length >= 3 && pwd.toLowerCase().includes(emailPrefix)) {
      containsEmail = true;
    }

    const doesNotContainPersonal = !containsName && !containsEmail;

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber && hasSymbol) score += 1;
    if (doesNotContainPersonal && pwd.length >= 10) score += 1;

    let label = 'Too Weak';
    let color = 'bg-rose-500';
    let textColor = 'text-rose-600 dark:text-rose-400';

    if (score === 1) {
      label = 'Weak';
      color = 'bg-rose-500';
      textColor = 'text-rose-600 dark:text-rose-400';
    } else if (score === 2) {
      label = 'Fair';
      color = 'bg-amber-500';
      textColor = 'text-amber-600 dark:text-amber-400';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-cyan-500';
      textColor = 'text-cyan-600 dark:text-cyan-400';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
      textColor = 'text-emerald-600 dark:text-emerald-400';
    }

    const isValid = hasMinLength && (hasUpper && hasLower) && (hasNumber || hasSymbol) && doesNotContainPersonal;

    return {
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
      doesNotContainPersonal,
      containsName,
      containsEmail,
      score,
      label,
      color,
      textColor,
      isValid
    };
  }, [formData.password, formData.name, formData.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!passwordCriteria.hasMinLength) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (passwordCriteria.containsName) {
      setError('For security, your password cannot contain your name');
      return;
    }

    if (passwordCriteria.containsEmail) {
      setError('For security, your password cannot contain your email username');
      return;
    }

    if (!passwordCriteria.isValid) {
      setError('Please choose a stronger password matching all security criteria');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      await register(formData.name.trim(), formData.email.trim(), formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start your synchronized household journal and invite your flatmates."
      switchText="Already have an account?"
      switchLinkText="Sign in"
      switchLinkTo="/login"
    >
      {/* Error Alert Box */}
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 animate-fade-in-up">
          <svg className="size-4 shrink-0 text-rose-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1"
          >
            Full name
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Maya Lin"
            className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white focus:ring-1 focus:ring-[#1A1A1A] dark:focus:ring-white transition-colors"
          />
        </div>

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="maya@example.com"
            className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white focus:ring-1 focus:ring-[#1A1A1A] dark:focus:ring-white transition-colors"
          />
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]"
            >
              Password
            </label>
            {formData.password && (
              <span className={`text-[11px] font-semibold ${passwordCriteria.textColor}`}>
                {passwordCriteria.label}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full h-11 px-4 pr-11 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white focus:ring-1 focus:ring-[#1A1A1A] dark:focus:ring-white transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Interactive Password Strength Progress Meter */}
          {formData.password && (
            <div className="mt-2 space-y-2 animate-fade-in-up">
              {/* Strength Bar Segments */}
              <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 1 ? passwordCriteria.color : 'bg-[#EAE8E1] dark:bg-[#252522]'}`} />
                <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 2 ? passwordCriteria.color : 'bg-[#EAE8E1] dark:bg-[#252522]'}`} />
                <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 3 ? passwordCriteria.color : 'bg-[#EAE8E1] dark:bg-[#252522]'}`} />
                <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 4 ? passwordCriteria.color : 'bg-[#EAE8E1] dark:bg-[#252522]'}`} />
              </div>

              {/* Password Requirement Checklist */}
              <div className="p-3 bg-[#FAF9F5] dark:bg-[#181816] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28] grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passwordCriteria.hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#71716E] dark:text-[#8E8E88]'}`}>
                  <span>{passwordCriteria.hasMinLength ? '✓' : '○'}</span>
                  <span>8+ characters</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#71716E] dark:text-[#8E8E88]'}`}>
                  <span>{passwordCriteria.hasUpper && passwordCriteria.hasLower ? '✓' : '○'}</span>
                  <span>Uppercase & lowercase</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordCriteria.hasNumber || passwordCriteria.hasSymbol ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#71716E] dark:text-[#8E8E88]'}`}>
                  <span>{passwordCriteria.hasNumber || passwordCriteria.hasSymbol ? '✓' : '○'}</span>
                  <span>Number or symbol</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordCriteria.doesNotContainPersonal ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-rose-600 dark:text-rose-400 font-medium'}`}>
                  <span>{passwordCriteria.doesNotContainPersonal ? '✓' : '✕'}</span>
                  <span>No name or email</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            placeholder="••••••••"
            className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white focus:ring-1 focus:ring-[#1A1A1A] dark:focus:ring-white transition-colors"
          />
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || (formData.password && !passwordCriteria.isValid)}
            className="w-full h-12 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-[#FAF9F5] active:scale-[0.99] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin size-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Creating account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}
