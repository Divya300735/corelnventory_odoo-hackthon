import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, ArrowLeft, KeyRound, CheckCircle2,
  Lock, Eye, EyeOff, ShieldCheck, RefreshCw, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { cn } from '../../lib/utils';

type Step = 1 | 2 | 3 | 4;
// Step 1: Enter email
// Step 2: Enter 6-digit OTP
// Step 3: Set new password
// Step 4: Success

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

const stepMeta = [
  { label: 'Email', icon: Mail },
  { label: 'Verify OTP', icon: ShieldCheck },
  { label: 'New Password', icon: Lock },
  { label: 'Done', icon: CheckCircle2 },
];

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    // Check if email exists (demo always works)
    const storedUsers = JSON.parse(localStorage.getItem('core_inventory_users') || '[]');
    const userExists = storedUsers.some((u: any) => u.email === email) || email === 'demo@example.com';
    if (!userExists) {
      toast.error('No account found with this email address.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const code = generateOTP();
      setGeneratedOtp(code);
      startTimer();
      setIsLoading(false);
      setStep(2);
      toast.success(`OTP sent! Your code is: ${code}`, {
        autoClose: 15000,
        icon: '🔐',
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    setOtp(['', '', '', '', '', '']);
    const code = generateOTP();
    setGeneratedOtp(code);
    startTimer();
    toast.success(`New OTP sent! Your code is: ${code}`, { autoClose: 15000, icon: '🔄' });
    document.getElementById('rp-otp-0')?.focus();
  };

  const handleOtpChange = (idx: number, value: string) => {
    if (!/^\d*$/.test(value) || value.length > 1) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) document.getElementById(`rp-otp-${idx + 1}`)?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`rp-otp-${idx - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    for (let i = 0; i < 6; i++) next[i] = paste[i] || '';
    setOtp(next);
    document.getElementById(`rp-otp-${Math.min(paste.length, 5)}`)?.focus();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) { toast.error('Please enter all 6 digits'); return; }

    setIsLoading(true);
    setTimeout(() => {
      if (entered === generatedOtp) {
        setIsLoading(false);
        setStep(3);
        toast.success('OTP verified! Now set your new password.', { icon: '✅' });
      } else {
        toast.error('Incorrect OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        document.getElementById('rp-otp-0')?.focus();
        setIsLoading(false);
      }
    }, 800);
  };

  const passwordStrength = passwordChecks.filter(c => c.test(newPassword)).length;
  const strengthColor = ['bg-destructive', 'bg-warning', 'bg-warning', 'bg-success'][passwordStrength];

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordStrength < 3) { toast.error('Password is too weak'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }

    setIsLoading(true);
    setTimeout(() => {
      // Update password in localStorage
      const storedUsers = JSON.parse(localStorage.getItem('core_inventory_users') || '[]');
      const updated = storedUsers.map((u: any) =>
        u.email === email ? { ...u, password: newPassword } : u
      );
      localStorage.setItem('core_inventory_users', JSON.stringify(updated));
      setIsLoading(false);
      setStep(4);

      // Auto-redirect after 3s
      setTimeout(() => navigate('/auth/login'), 3000);
    }, 1000);
  };

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        to="/auth/login"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-base"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
      </Link>

      {/* Step Progress */}
      {step !== 4 && (
        <div className="flex items-center justify-between">
          {stepMeta.slice(0, 3).map((s, i) => {
            const stepNum = (i + 1) as Step;
            const isDone = step > stepNum;
            const isActive = step === stepNum;
            return (
              <div key={s.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                    isDone ? "bg-success border-success text-white"
                      : isActive ? "bg-primary border-primary text-primary-foreground"
                        : "bg-secondary border-border text-muted-foreground"
                  )}>
                    {isDone ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className={cn("text-[10px] font-medium hidden sm:block",
                    isActive ? "text-primary" : isDone ? "text-success" : "text-muted-foreground"
                  )}>{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={cn("flex-1 h-0.5 mx-2 mb-4 transition-all",
                    step > stepNum ? "bg-success" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Steps */}
      <AnimatePresence mode="wait">
        {/* STEP 1 — Enter email */}
        {step === 1 && (
          <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25 }} className="space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Forgot Password?</h2>
              <p className="text-muted-foreground mt-1 text-sm">Enter your email and we'll send a reset code.</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email" required
                    className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
                    placeholder="Enter your registered email"
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-base disabled:opacity-50">
                {isLoading
                  ? <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  : <><ShieldCheck className="w-4 h-4 mr-2" /> Send OTP Code</>
                }
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 2 — Verify OTP */}
        {step === 2 && (
          <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25 }} className="space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Check Your Email</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Enter 6-digit OTP</label>
                  <div className="text-xs text-muted-foreground">
                    {timer > 0
                      ? <span className="text-primary font-medium">Resend in {timer}s</span>
                      : (
                        <button type="button" onClick={handleResendOtp}
                          className="flex items-center gap-1 text-primary hover:underline font-medium">
                          <RefreshCw className="w-3 h-3" /> Resend OTP
                        </button>
                      )
                    }
                  </div>
                </div>

                {/* OTP boxes */}
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`rp-otp-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(idx, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(idx, e)}
                      className={cn(
                        "w-full aspect-square text-center text-xl font-bold bg-background border-2 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all",
                        digit ? "border-primary text-primary" : "border-border"
                      )}
                    />
                  ))}
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {otp.map((d, i) => (
                    <div key={i} className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      d ? "bg-primary" : "bg-border"
                    )} />
                  ))}
                </div>

                <p className="text-xs text-center text-muted-foreground mt-2">
                  💡 The OTP appears in the toast notification at the top of the screen.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(['','','','','','']); }}
                  className="flex items-center gap-1 px-4 py-2 border rounded-lg text-sm hover:bg-secondary transition-base"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.join('').length < 6}
                  className="flex-1 flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-base disabled:opacity-50"
                >
                  {isLoading
                    ? <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    : <><KeyRound className="w-4 h-4 mr-2" /> Verify Code</>
                  }
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* STEP 3 — New Password */}
        {step === 3 && (
          <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.25 }} className="space-y-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Set New Password</h2>
              <p className="text-muted-foreground mt-1 text-sm">Your identity is verified. Create a strong new password.</p>
            </div>

            <form onSubmit={handleSetPassword} className="space-y-4">
              {/* New password */}
              <div>
                <label className="text-sm font-medium mb-1 block">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showNew ? 'text' : 'password'} required
                    className="w-full pl-10 pr-10 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
                    placeholder="Create a strong password"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-1.5">
                    <div className="flex gap-1 h-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className={cn("flex-1 rounded-full transition-all",
                          i < passwordStrength ? strengthColor : 'bg-border'
                        )} />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {passwordChecks.map(check => (
                        <span key={check.label}
                          className={cn("flex items-center gap-1 text-xs",
                            check.test(newPassword) ? 'text-success' : 'text-muted-foreground'
                          )}>
                          <Check className="w-3 h-3" /> {check.label}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-sm font-medium mb-1 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showConfirm ? 'text' : 'password'} required
                    className={cn(
                      "w-full pl-10 pr-10 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 transition-base",
                      confirmPassword
                        ? confirmPassword === newPassword
                          ? 'border-success focus:ring-success'
                          : 'border-destructive focus:ring-destructive'
                        : 'focus:ring-primary'
                    )}
                    placeholder="Repeat new password"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                )}
                {confirmPassword && confirmPassword === newPassword && (
                  <p className="text-xs text-success mt-1 flex items-center gap-1"><Check className="w-3 h-3" /> Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || passwordStrength < 3 || newPassword !== confirmPassword}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-base disabled:opacity-50"
              >
                {isLoading
                  ? <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  : <><CheckCircle2 className="w-4 h-4 mr-2" /> Reset Password</>
                }
              </button>
            </form>
          </motion.div>
        )}

        {/* STEP 4 — Success */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.15 }}
              className="w-20 h-20 bg-success/10 border-2 border-success rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-success" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Password Reset!</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Your password has been successfully updated.
              </p>
            </div>
            <div className="w-full p-3 rounded-lg bg-success/10 border border-success/20 text-xs text-success">
              ✅ You can now sign in with your new password.
            </div>
            <p className="text-xs text-muted-foreground">Redirecting to login in 3 seconds...</p>
            <Link to="/auth/login"
              className="text-sm text-primary hover:underline font-medium">
              Go to Login now →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
