import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Store, Warehouse, UserPlus, Eye, EyeOff, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { cn } from '../../lib/utils';

type Role = 'manager' | 'staff';

const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('manager');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setLogin = useAuthStore(state => state.login);

  const passwordStrength = passwordChecks.filter(c => c.test(password)).length;

  const strengthColor = ['bg-destructive', 'bg-warning', 'bg-warning', 'bg-success'][passwordStrength];
  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Strong'][passwordStrength];

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordStrength < 3) {
      toast.error('Password is too weak. Check requirements.');
      return;
    }
    if (!terms) {
      toast.error('Please accept the Terms of Service');
      return;
    }

    // Role validation based on email
    let finalRole = role;
    if (email.startsWith('manager_')) {
      finalRole = 'manager';
    } else if (email.startsWith('staff_')) {
      finalRole = 'staff';
    } else {
      toast.error('Email must start with manager_ or staff_ (e.g., manager_admin@domain.com or staff_01@domain.com)');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem('core_inventory_users') || '[]');

      if (storedUsers.some((u: any) => u.email === email)) {
        toast.error('An account with this email already exists.');
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        role: finalRole,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      storedUsers.push(newUser);
      localStorage.setItem('core_inventory_users', JSON.stringify(storedUsers));

      // Auto-login
      const loginUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
      setLogin(loginUser);
      sessionStorage.setItem('core_inventory_session', JSON.stringify({
        user: loginUser,
        expires: new Date(Date.now() + 8 * 60 * 60 * 1000)
      }));

      toast.success(`Welcome to CoreInventory, ${name}! 🎉`);
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create Account</h2>
        <p className="text-muted-foreground mt-1 text-sm">Join CoreInventory to manage your stock</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium mb-1 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" required
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
              placeholder="John Doe"
              value={name} onChange={e => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="email" required
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
              placeholder="manager_name@example.com or staff_1@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            * Use <span className="text-primary font-mono">manager_...</span> for Manager role, 
            <span className="text-primary font-mono"> staff_...</span> for Staff role.
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium mb-1 block">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type={showPassword ? 'text' : 'password'} required
              className="w-full pl-10 pr-10 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
              placeholder="Create a strong password"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {/* Strength meter */}
          {password && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-1.5">
              <div className="flex gap-1 h-1">
                {[0,1,2].map(i => (
                  <div key={i} className={cn("flex-1 rounded-full transition-all", i < passwordStrength ? strengthColor : 'bg-border')} />
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {passwordChecks.map(check => (
                  <span key={check.label} className={cn("flex items-center gap-1 text-xs", check.test(password) ? 'text-success' : 'text-muted-foreground')}>
                    <Check className="w-3 h-3" /> {check.label}
                  </span>
                ))}
              </div>
              <p className="text-xs font-medium" style={{ color: passwordStrength === 3 ? 'hsl(var(--success))' : passwordStrength >= 2 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))' }}>
                {strengthLabel}
              </p>
            </motion.div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-medium mb-1 block">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type={showConfirm ? 'text' : 'password'} required
              className={cn("w-full pl-10 pr-10 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 transition-base",
                confirmPassword && (confirmPassword === password ? 'border-success focus:ring-success' : 'border-destructive focus:ring-destructive')
              )}
              placeholder="Repeat your password"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword && confirmPassword !== password && (
            <p className="text-xs text-destructive mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label className="text-sm font-medium mb-2 block">Select Your Role</label>
          <div className="grid grid-cols-2 gap-3">
            {/* Inventory Manager */}
            <button
              type="button"
              onClick={() => setRole('manager')}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                role === 'manager'
                  ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                  : 'border-border hover:border-primary/40 hover:bg-secondary/50'
              )}
            >
              {role === 'manager' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className={cn("p-3 rounded-xl mb-2", role === 'manager' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground')}>
                <Store className="w-6 h-6" />
              </div>
              <span className={cn("text-sm font-semibold", role === 'manager' ? 'text-primary' : 'text-foreground')}>
                Inventory Manager
              </span>
              <span className="text-xs text-muted-foreground mt-0.5 text-center leading-tight">
                Full access & reports
              </span>
            </button>

            {/* Warehouse Staff */}
            <button
              type="button"
              onClick={() => setRole('staff')}
              className={cn(
                "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                role === 'staff'
                  ? 'border-primary bg-primary/10 shadow-md shadow-primary/20'
                  : 'border-border hover:border-primary/40 hover:bg-secondary/50'
              )}
            >
              {role === 'staff' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
              <div className={cn("p-3 rounded-xl mb-2", role === 'staff' ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground')}>
                <Warehouse className="w-6 h-6" />
              </div>
              <span className={cn("text-sm font-semibold", role === 'staff' ? 'text-primary' : 'text-foreground')}>
                Warehouse Staff
              </span>
              <span className="text-xs text-muted-foreground mt-0.5 text-center leading-tight">
                Ops & picking tasks
              </span>
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={() => setTerms(!terms)}
            className={cn(
              "flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition-all",
              terms ? 'bg-primary border-primary' : 'border-border hover:border-primary/50'
            )}
          >
            {terms && <Check className="w-3 h-3 text-primary-foreground" />}
          </button>
          <label className="text-sm text-foreground leading-relaxed cursor-pointer" onClick={() => setTerms(!terms)}>
            I agree to the{' '}
            <a href="#" onClick={e => e.stopPropagation()} className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" onClick={e => e.stopPropagation()} className="text-primary hover:underline">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-base disabled:opacity-50"
        >
          {isLoading
            ? <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            : <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>
          }
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/auth/login" className="text-primary hover:underline font-medium">Log in</Link>
      </p>
    </div>
  );
}
