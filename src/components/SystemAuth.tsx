import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  Mail, 
  User, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  School, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Briefcase,
  HelpCircle,
  BookOpen
} from 'lucide-react';

export interface UserSession {
  username: string;
  email: string;
  role: 'Administrator' | 'Teacher' | 'Parent' | 'Staff';
  avatarSeed?: string;
}

interface SystemAuthProps {
  onLoginSuccess: (session: UserSession) => void;
}

const DEFAULT_USERS = [
  {
    username: 'admin',
    email: 'admin@kidsvilla.ac.ug',
    password: 'adminadmin',
    role: 'Administrator' as const,
    name: 'Admin Director'
  },
  {
    username: 'grace',
    email: 'grace@kidsvilla.ac.ug',
    password: 'teachergrace',
    role: 'Teacher' as const,
    name: 'Teacher Grace'
  },
  {
    username: 'ssewankambo',
    email: 'ssewankambo@kidsvilla.ac.ug',
    password: 'parentkids',
    role: 'Parent' as const,
    name: 'David Ssewankambo'
  }
];

export function SystemAuth({ onLoginSuccess }: SystemAuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Administrator' | 'Teacher' | 'Parent' | 'Staff'>('Teacher');
  const [fullName, setFullName] = useState('');

  // Notifications or errors
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load or sync registered users inside localStorage
  const [registeredUsers, setRegisteredUsers] = useState<typeof DEFAULT_USERS>(() => {
    const saved = localStorage.getItem('kva_auth_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem('kva_auth_users', JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  // Handle email auto-customisation to the school domain kidsvilla.ac.ug as they enter the username
  useEffect(() => {
    if (isSignUp && username.trim() !== '') {
      const sanitized = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      setEmail(`${sanitized}@kidsvilla.ac.ug`);
    }
  }, [username, isSignUp]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    if (!username.trim() || !password) {
      setErrorText("Please fill in both your school Username / Email and Password securely.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Look up user by username OR email
      const userMatch = registeredUsers.find(
        u => (u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === username.trim().toLowerCase())
      );

      if (!userMatch) {
        setErrorText("No security match found for this school Username or Email.");
        setIsLoading(false);
        return;
      }

      if (userMatch.password !== password) {
        setErrorText("Incorrect secure password entered. Please try again or use standard quick sign-in helpers.");
        setIsLoading(false);
        return;
      }

      // Success
      setSuccessText(`Security verification passed! Welcome back, ${userMatch.name || userMatch.username}.`);
      setTimeout(() => {
        onLoginSuccess({
          username: userMatch.username,
          email: userMatch.email,
          role: userMatch.role,
          avatarSeed: userMatch.name || userMatch.username
        });
      }, 800);

    }, 1000);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    if (!username.trim() || !password || !fullName.trim()) {
      setErrorText("Fully complete the Username, Password and Full Name areas.");
      return;
    }

    if (password.length < 5) {
      setErrorText("To satisfy school security compliance, passcodes must be 5 or more characters.");
      return;
    }

    // Check pre-existing username
    const usernameExists = registeredUsers.some(
      u => u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (usernameExists) {
      setErrorText(`The academic username or email domain "${email}" is already registered.`);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newUser = {
        username: username.trim().toLowerCase(),
        email: email.trim() || `${username.trim().toLowerCase()}@kidsvilla.ac.ug`,
        password: password,
        role: role,
        name: fullName.trim()
      };

      const updated = [...registeredUsers, newUser];
      setRegisteredUsers(updated);
      setIsLoading(false);
      setSuccessText("Portal credentials registered! Handing over to Dashboard panel...");
      
      setTimeout(() => {
        onLoginSuccess({
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          avatarSeed: newUser.name
        });
      }, 1000);

    }, 1200);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessText(null);

    if (!username.trim() || !password) {
      setErrorText("Type your exact school username / email and the target new passcode.");
      return;
    }

    const userIndex = registeredUsers.findIndex(
      u => (u.username.toLowerCase() === username.trim().toLowerCase() || u.email.toLowerCase() === username.trim().toLowerCase())
    );

    if (userIndex === -1) {
      setErrorText("No corresponding Kids Villa account matches that directory records.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const updated = [...registeredUsers];
      updated[userIndex].password = password;
      setRegisteredUsers(updated);
      setIsLoading(false);
      setSuccessText("✓ Password reset successfully! You can now log in securely.");
      setIsReset(false);
    }, 1000);
  };

  // Switch to predefined test accounts
  const useDemoCredentials = (u: typeof DEFAULT_USERS[0]) => {
    setUsername(u.username);
    setPassword(u.password);
    setErrorText(null);
    setSuccessText(`Loaded ${u.name}'s school profile shortcuts.`);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden select-none font-sans" id="kidsvilla-secure-auth-screen">
      
      {/* Absolute high-tech glowing bubbles backdrop */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -translate-x-12 -translate-y-12"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none translate-x-12 translate-y-12"></div>
      
      <div className="w-full max-w-5xl bg-slate-950/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left column info panel: Beautiful school branding */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 to-slate-900 p-8 flex flex-col justify-between border-r border-slate-800/60 text-slate-300">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg ring-4 ring-sky-500/15">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-tight">Kids Villa Academy</h1>
                <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block">Kitemu Nsangi • Wakiso</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug">
                Nursery Management & Progress Portal
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Welcome to Kids Villa Academy Junior secure console. Access early learning portfolios, Ugandan NCDC curriculum checklists, offline-safe databases, and parent messaging boards.
              </p>
            </div>

            {/* Ugandan Pre-school checklist points */}
            <div className="space-y-2.5 pt-2 text-[11px] font-semibold text-slate-300">
              <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>NCDC Academic Progress & Registry</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30">
                <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Dual Kids-Parent Messaging Portal</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800/30">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Secured Local Ledger Backups</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-850/60 text-[10px] text-slate-500 flex items-center justify-between">
            <span>© Kids Villa Academy Junior</span>
            <span className="font-mono text-slate-600">v2.6.0-Secured</span>
          </div>
        </div>

        {/* Right column form area */}
        <div className="lg:col-span-7 p-8 md:p-10 flex flex-col justify-center bg-slate-950/80">
          
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              {isReset ? "Reset Portal Code" : isSignUp ? "Create Custom Account" : "Sign In to KVA"}
              <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isReset 
                ? "Provide your registered school email address to write a new password." 
                : isSignUp 
                  ? "Register key system personnel credentials to obtain a customized school email address." 
                  : "State below your secure credentials passed by the school office."}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {errorText && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-red-950/40 text-red-400 border border-red-900/40 p-3.5 rounded-xl text-xs flex items-start gap-2.5 mb-5 font-medium shadow-2xs"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{errorText}</span>
              </motion.div>
            )}

            {successText && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-emerald-950/35 text-emerald-400 border border-emerald-900/40 p-3.5 rounded-xl text-xs flex items-start gap-2.5 mb-5 font-semibold shadow-2xs"
              >
                <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{successText}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Interactive forms */}
          {isReset ? (
            /* RESET FORM */
            <form onSubmit={handleResetPassword} className="space-y-4.5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">School Username / Register Email</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. admin or grace@kidsvilla.ac.ug"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 shadow-3xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter new Password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 shadow-3xs"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReset(false)}
                  className="flex-1 py-3 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Back to Log In
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-black text-[11px] py-3 rounded-xl uppercase tracking-wider cursor-pointer"
                >
                  {isLoading ? "Resetting Code..." : "Save password"}
                </button>
              </div>
            </form>
          ) : isSignUp ? (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="Tr. Sarah Nakigadde"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 shadow-3xs"
                    />
                  </div>
                </div>

                {/* Target Role */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Portal Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 px-4 text-xs text-white focus:ring-1 focus:ring-sky-500 select-none shadow-3xs"
                  >
                    <option value="Administrator">👑 Administrator / Owner</option>
                    <option value="Teacher">👩‍🏫 Academic Teacher</option>
                    <option value="Parent">👪 Registered Parent / Guardian</option>
                    <option value="Staff">💼 School Staff Director</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Username (Prefix)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. sarah"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 px-4 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 shadow-3xs"
                    />
                  </div>
                </div>

                {/* Customized Email (Auto generated) */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Customised School Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      readOnly
                      placeholder="custom@kidsvilla.ac.ug"
                      value={email}
                      className="w-full bg-slate-905/60 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-xs text-sky-400 font-mono"
                      title="Your official school domain email customized in real time during registration."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create security code..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-11 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 shadow-3xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-[11px] py-4 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer pt-3 shadow-md border-t border-emerald-500/20"
              >
                <span>{isLoading ? "Provisioning Profile..." : "Complete secure registration"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-xs text-slate-400 hover:text-white font-semibold underline decoration-dotted"
                >
                  Already have school credentials? Sign In
                </button>
              </div>
            </form>
          ) : (
            /* STANDARD LOG IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">School Username / Academic Email</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter username (e.g. grace) or school email..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 shadow-3xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Portal Password</label>
                  <button
                    type="button"
                    onClick={() => { setIsReset(true); setErrorText(null); }}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-bold uppercase tracking-wider hover:underline"
                  >
                    Forgot passcode?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3.5 pl-11 pr-11 text-xs text-white placeholder-slate-500 focus:ring-1 focus:ring-sky-500 shadow-3xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-black text-[11px] py-4 rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md border-t border-sky-450/20"
              >
                <span>{isLoading ? "Authorizing Access..." : "Sign in to system"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setErrorText(null); }}
                  className="text-xs text-slate-400 hover:text-white font-semibold underline decoration-dotted"
                >
                  No credentials? Register a customised school account
                </button>
              </div>
            </form>
          )}

          {/* QUICK CREDENTIAL SHORTCUTS (DEV & TEST ASSIST) */}
          <div className="mt-6 pt-5 border-t border-slate-850/60">
            <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block mb-2.5">
              🚀 DEV TESTING SHIELDS (Instant Portal Profiles)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {DEFAULT_USERS.map((u) => (
                <button
                  key={u.username}
                  type="button"
                  onClick={() => useDemoCredentials(u)}
                  className="bg-slate-900/45 hover:bg-slate-900 hover:border-slate-700 text-left p-2.5 rounded-xl border border-slate-800/40 text-slate-400 font-semibold cursor-pointer select-none transition-all flex flex-col justify-between"
                >
                  <span className="text-[10px] text-slate-200 truncate font-black">{u.name}</span>
                  <span className="text-[8.5px] text-sky-400 font-mono truncate mt-0.5">{u.email}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
