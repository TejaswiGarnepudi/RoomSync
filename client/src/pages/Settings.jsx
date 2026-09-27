import React, { useState, useRef, useContext } from 'react';
import AppLayout from '../layouts/AppLayout';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, changePassword } from '../services/authService';

export default function Settings() {
  const { user, updateUser, logout } = useContext(AuthContext);

  
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security' | 'preferences'

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Notification preferences state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [choreReminders, setChoreReminders] = useState(true);
  const [expenseAlerts, setExpenseAlerts] = useState(true);
  const [decisionPolls, setDecisionPolls] = useState(true);

  const fileInputRef = useRef(null);

  // Avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80'
  ];

  // Password strength calculations
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-stone-300 dark:bg-stone-700' };
    
    let score = 0;
    const hasLength = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (hasLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;

    // Penalty if password contains name or email
    const lowerPwd = pwd.toLowerCase();
    const nameParts = (user?.name || '').toLowerCase().split(/[\s_-]+/).filter(p => p.length >= 3);
    for (const part of nameParts) {
      if (lowerPwd.includes(part)) score = Math.min(score, 1);
    }
    const emailPrefix = (user?.email || '').toLowerCase().split('@')[0];
    if (emailPrefix.length >= 3 && lowerPwd.includes(emailPrefix)) {
      score = Math.min(score, 1);
    }

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  // Handle local image file upload & smart square-crop compress to lightweight base64
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileMessage({ type: 'error', text: 'Please select a valid image file (JPG, PNG, WebP)' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for smart square avatar cropping / downscaling (400x400 max)
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        const { width, height } = img;

        let sx = 0;
        let sy = 0;
        let sWidth = width;
        let sHeight = height;

        if (width > height) {
          sx = (width - height) / 2;
          sWidth = height;
        } else if (height > width) {
          sy = (height - width) / 2;
          sHeight = width;
        }

        canvas.width = Math.min(sWidth, maxSize);
        canvas.height = Math.min(sHeight, maxSize);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

        // Convert to high quality JPEG data URL (~30-60kb)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.88);
        setProfilePhoto(compressedBase64);
        setProfileMessage({ type: '', text: '' });
      };
      img.onerror = () => {
        setProfileMessage({ type: 'error', text: 'Failed to process selected image' });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };


  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (!name.trim()) {
      setProfileMessage({ type: 'error', text: 'Please enter your full name' });
      return;
    }

    if (!email.trim()) {
      setProfileMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setProfileLoading(true);
    try {
      const res = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        profilePhoto
      });
      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
      }
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: 'Please enter your current password' });
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      return;
    }

    if (passwordStrength.score < 2) {
      setPasswordMessage({ type: 'error', text: 'Please create a stronger password with letters, numbers, and symbols' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update password. Verify your current password.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in-up">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] dark:text-white">
              Account Settings
            </h1>
            <p className="text-sm text-[#71716E] dark:text-[#8E8E88] mt-1">
              Manage your personal profile, avatar, security credentials, and preferences.
            </p>
          </div>

          {/* Quick pill tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EAE8E1] dark:bg-[#1C1C1A] rounded-2xl border border-[#E8E7E1] dark:border-[#2E2E2A] self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-[#2A2A28] text-[#1A1A1A] dark:text-white shadow-xs'
                  : 'text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-[#2A2A28] text-[#1A1A1A] dark:text-white shadow-xs'
                  : 'text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              Security
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-white dark:bg-[#2A2A28] text-[#1A1A1A] dark:text-white shadow-xs'
                  : 'text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white'
              }`}
            >
              Preferences
            </button>
          </div>
        </div>

        {/* TAB 1: PROFILE & AVATAR */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              
              {/* Profile Message Banner */}
              {profileMessage.text && (
                <div
                  className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between border ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{profileMessage.type === 'success' ? '✓' : '⚠'}</span>
                    <span>{profileMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileMessage({ type: '', text: '' })}
                    className="opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Avatar Upload Card */}
              <div className="bg-[#FAF9F5] dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-6">
                  <div>
                    <h2 className="text-base font-bold text-[#1A1A1A] dark:text-white">Profile Picture</h2>
                    <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">
                      Upload a photo, pick an avatar preset, or provide an image URL.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Avatar Preview */}
                  <div className="relative group shrink-0">
                    <div className="size-24 rounded-full border-2 border-[#E8E7E1] dark:border-[#2A2A28] bg-[#EAE8E1] dark:bg-[#1C1C1A] overflow-hidden flex items-center justify-center text-3xl font-bold text-[#1A1A1A] dark:text-white shadow-inner">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt={user?.name || 'Profile'}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            setProfilePhoto('');
                          }}
                        />
                      ) : (
                        <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions & File Picker */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload Photo
                      </button>

                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={() => setProfilePhoto('')}
                          className="px-3.5 py-2 rounded-full border border-[#E8E7E1] dark:border-[#2A2A28] bg-[#FAF9F5] dark:bg-[#181816] text-[#71716E] dark:text-[#8E8E88] hover:text-rose-600 dark:hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8E8E88] dark:text-[#6C6C68]">
                      Supports JPG, PNG or WebP. Max size: 2MB.
                    </p>
                  </div>
                </div>

                {/* Avatar Presets */}
                <div className="pt-4 border-t border-[#E8E7E1] dark:border-[#2A2A28]/60 space-y-2.5">
                  <span className="text-xs font-semibold text-[#71716E] dark:text-[#8E8E88]">Or choose an avatar style:</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfilePhoto(preset)}
                        className={`size-11 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                          profilePhoto === preset
                            ? 'border-[#1A1A1A] dark:border-white ring-2 ring-[#1A1A1A]/20 dark:ring-white/20'
                            : 'border-[#E8E7E1] dark:border-[#2A2A28] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Preset ${idx + 1}`} className="size-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Photo URL Input */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-[#71716E] dark:text-[#8E8E88] mb-1.5">
                    Custom Photo URL (optional)
                  </label>
                  <input
                    type="url"
                    value={profilePhoto.startsWith('data:') ? '' : profilePhoto}
                    onChange={(e) => setProfilePhoto(e.target.value)}
                    placeholder="https://example.com/your-avatar.jpg"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] dark:placeholder-[#6C6C68] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] dark:focus:ring-white"
                  />
                </div>
              </div>

              {/* Personal Information Card */}
              <div className="bg-[#FAF9F5] dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-4">
                  <h2 className="text-base font-bold text-[#1A1A1A] dark:text-white">Personal Information</h2>
                  <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">
                    Update your display name and email address.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] dark:focus:ring-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-2.5 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                  >
                    {profileLoading ? (
                      <>
                        <div className="size-3.5 border-2 border-white dark:border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORD */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              
              {/* Password Message Banner */}
              {passwordMessage.text && (
                <div
                  className={`p-4 rounded-2xl text-xs font-medium flex items-center justify-between border ${
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{passwordMessage.type === 'success' ? '✓' : '⚠'}</span>
                    <span>{passwordMessage.text}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPasswordMessage({ type: '', text: '' })}
                    className="opacity-70 hover:opacity-100 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="bg-[#FAF9F5] dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-4">
                  <h2 className="text-base font-bold text-[#1A1A1A] dark:text-white">Change Password</h2>
                  <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">
                    Ensure your account stays secure by using a strong, unique password.
                  </p>
                </div>

                <div className="space-y-5 max-w-xl">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] dark:focus:ring-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white text-xs cursor-pointer"
                      >
                        {showCurrentPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] dark:focus:ring-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white text-xs cursor-pointer"
                      >
                        {showNewPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="pt-2 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#71716E] dark:text-[#8E8E88]">Password strength:</span>
                          <span className="font-semibold text-[#1A1A1A] dark:text-white">{passwordStrength.label}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-all ${
                                step <= passwordStrength.score ? passwordStrength.color : 'bg-[#E8E7E1] dark:bg-[#2A2A28]'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Security Requirements Checklist */}
                        <div className="pt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[#71716E] dark:text-[#8E8E88]">
                          <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                            <span>{newPassword.length >= 8 ? '✓' : '○'}</span>
                            <span>At least 8 characters</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                            <span>{/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? '✓' : '○'}</span>
                            <span>Upper & lower case</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) || /[!@#$%^&*]/.test(newPassword) ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                            <span>{/[0-9]/.test(newPassword) || /[!@#$%^&*]/.test(newPassword) ? '✓' : '○'}</span>
                            <span>Number or special symbol</span>
                          </div>
                          <div className={`flex items-center gap-1.5 ${passwordStrength.score >= 2 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}`}>
                            <span>{passwordStrength.score >= 2 ? '✓' : '○'}</span>
                            <span>No name or email parts</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-white">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#181816] border border-[#E8E7E1] dark:border-[#2A2A28] text-xs text-[#1A1A1A] dark:text-white placeholder-[#8E8E88] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] dark:focus:ring-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71716E] dark:text-[#8E8E88] hover:text-[#1A1A1A] dark:hover:text-white text-xs cursor-pointer"
                      >
                        {showConfirmPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-6 py-2.5 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                    >
                      {passwordLoading ? (
                        <>
                          <div className="size-3.5 border-2 border-white dark:border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: PREFERENCES & HOUSEHOLD */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            
            {/* Notification Preferences */}
            <div className="bg-[#FAF9F5] dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-4">
                <h2 className="text-base font-bold text-[#1A1A1A] dark:text-white">Notification Preferences</h2>
                <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">
                  Control the updates and alerts you receive from roommates.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[#E8E7E1]/60 dark:border-[#2A2A28]/60">
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A] dark:text-white">Chore Reminders</p>
                    <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">Receive notifications when chores are due or assigned to you</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={choreReminders}
                    onChange={(e) => setChoreReminders(e.target.checked)}
                    className="size-4 accent-[#1A1A1A] dark:accent-white cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#E8E7E1]/60 dark:border-[#2A2A28]/60">
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A] dark:text-white">Expense & Split Alerts</p>
                    <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">Notify me when a new shared expense is added or settled</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={expenseAlerts}
                    onChange={(e) => setExpenseAlerts(e.target.checked)}
                    className="size-4 accent-[#1A1A1A] dark:accent-white cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-[#E8E7E1]/60 dark:border-[#2A2A28]/60">
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A] dark:text-white">Decision Polls</p>
                    <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">Alerts when roommates create a household vote or survey</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={decisionPolls}
                    onChange={(e) => setDecisionPolls(e.target.checked)}
                    className="size-4 accent-[#1A1A1A] dark:accent-white cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A] dark:text-white">Weekly Email Digest</p>
                    <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">Summary of completed chores, upcoming bills, and workload balance</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="size-4 accent-[#1A1A1A] dark:accent-white cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Account & Session Controls */}
            <div className="bg-[#FAF9F5] dark:bg-[#141413] border border-[#E8E7E1] dark:border-[#2A2A28] rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="border-b border-[#E8E7E1] dark:border-[#2A2A28] pb-4">
                <h2 className="text-base font-bold text-[#1A1A1A] dark:text-white">Account & Sessions</h2>
                <p className="text-xs text-[#71716E] dark:text-[#8E8E88] mt-0.5">
                  Manage active session and sign out options.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A] dark:text-white">Signed in as {user?.email}</p>
                  <p className="text-[11px] text-[#71716E] dark:text-[#8E8E88]">Member ID: {user?._id || 'Standard User'}</p>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="px-5 py-2.5 rounded-full border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Sign Out from RoomSync
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </AppLayout>
  );
}
