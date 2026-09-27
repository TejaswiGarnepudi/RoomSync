import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import { forgotPassword, resetPassword } from '../services/authService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter code & new password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Compute password strength for the reset password step
  const passwordCriteria = useMemo(() => {
    const pwd = newPassword;
    const emailPrefix = email ? email.split('@')[0].toLowerCase() : '';

    const hasMinLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    let containsEmail = false;
    if (emailPrefix && emailPrefix.length >= 3 && pwd.toLowerCase().includes(emailPrefix)) {
      containsEmail = true;
    }

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber && hasSymbol) score += 1;
    if (!containsEmail && pwd.length >= 10) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';
    let textColor = 'text-rose-600 dark:text-rose-400';

    if (score === 2) {
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

    const isValid = hasMinLength && (hasUpper && hasLower) && (hasNumber || hasSymbol) && !containsEmail;

    return {
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSymbol,
      doesNotContainPersonal: !containsEmail,
      score,
      label,
      color,
      textColor,
      isValid
    };
  }, [newPassword, email]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await forgotPassword({ email: email.trim() });
      setSuccessMessage(res.data.message || 'Reset instructions sent.');
      if (res.data.data?.resetCode) {
        setResetCode(res.data.data.resetCode);
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!passwordCriteria.isValid) {
      setError('Please choose a password meeting all strength requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword({
        email: email.trim(),
        newPassword
      });
      alert('Password successfully updated! You can now sign in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 1 ? "Forgot password?" : "Create new password"}
      subtitle={
        step === 1
          ? "Enter your account email to receive reset instructions."
          : `Enter the reset code sent to ${email} and set your new password.`
      }
      switchText="Remember your password?"
      switchLinkText="Sign in"
      switchLinkTo="/login"
    >
      {/* Error Alert */}
      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-2xl border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 animate-fade-in-up">
          <svg className="size-4 shrink-0 text-rose-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <span className="leading-relaxed font-medium">{error}</span>
        </div>
      )}

      {/* Success Info Box */}
      {successMessage && step === 2 && (
        <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl border border-emerald-200 dark:border-emerald-900/50 flex items-start gap-2.5 animate-fade-in-up">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {step === 1 ? (
        /* STEP 1: Request Code */
        <form onSubmit={handleRequestCode} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1.5"
            >
              Account Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-[#FAF9F5] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-60"
          >
            {loading ? 'Sending Instructions...' : 'Send Reset Instructions →'}
          </button>
        </form>
      ) : (
        /* STEP 2: Enter Code & New Password */
        <form onSubmit={handleResetSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="resetCode"
              className="block text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1"
            >
              Verification Code
            </label>
            <input
              id="resetCode"
              type="text"
              required
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value)}
              placeholder="6-digit code (e.g. 849201)"
              className="w-full h-11 px-4 rounded-xl font-mono text-center tracking-widest bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88]"
              >
                New Password
              </label>
              {newPassword && (
                <span className={`text-[11px] font-semibold ${passwordCriteria.textColor}`}>
                  {passwordCriteria.label}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 px-4 pr-11 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* Strength indicator */}
            {newPassword && (
              <div className="mt-2 space-y-1.5 animate-fade-in-up">
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 1 ? passwordCriteria.color : 'bg-[#EAE8E1] dark:bg-[#252522]'}`} />
                  <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 2 ? passwordCriteria.color : 'bg-[#EAE8E1] dark:bg-[#252522]'}`} />
                  <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 3 ? passwordCriteria.color : 'bg-[#EAE8E1] dark:bg-[#252522]'}`} />
                  <div className={`rounded-full transition-all duration-300 ${passwordCriteria.score >= 4 ? passwordCriteria.color : 'bg-[#EAE8E1] dark:bg-[#252522]'}`} />
                </div>
                <div className="p-2.5 bg-[#FAF9F5] dark:bg-[#181816] rounded-xl border border-[#E8E7E1] dark:border-[#2A2A28] grid grid-cols-2 gap-1 text-[10px]">
                  <span className={passwordCriteria.hasMinLength ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#71716E]'}>
                    {passwordCriteria.hasMinLength ? '✓' : '○'} 8+ characters
                  </span>
                  <span className={passwordCriteria.hasUpper && passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#71716E]'}>
                    {passwordCriteria.hasUpper && passwordCriteria.hasLower ? '✓' : '○'} Upper & lowercase
                  </span>
                  <span className={passwordCriteria.hasNumber || passwordCriteria.hasSymbol ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#71716E]'}>
                    {passwordCriteria.hasNumber || passwordCriteria.hasSymbol ? '✓' : '○'} Number or symbol
                  </span>
                  <span className={passwordCriteria.doesNotContainPersonal ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                    {passwordCriteria.doesNotContainPersonal ? '✓' : '✕'} No personal info
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-[#71716E] dark:text-[#8E8E88] mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] text-sm text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:border-[#1A1A1A] dark:focus:border-white transition-colors"
            />
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading || (newPassword && !passwordCriteria.isValid)}
              className="w-full h-12 rounded-xl bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-[#FAF9F5] active:scale-[0.99] transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Reset Password & Sign In →'}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2 text-xs text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
            >
              ← Back to enter email
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
