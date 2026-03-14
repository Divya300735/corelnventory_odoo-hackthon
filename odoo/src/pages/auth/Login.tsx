import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setLoginStore = useAuthStore((state) => state.login);

  const doLogin = (user: { id: string; name: string; email: string; role: 'manager' | 'staff' }) => {
    setLoginStore(user);
    const session = { user, expires: new Date(Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000) };
    if (remember) {
      localStorage.setItem('core_inventory_session', JSON.stringify(session));
    } else {
      sessionStorage.setItem('core_inventory_session', JSON.stringify(session));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Derive role from email as per requirements
    let derivedRole: 'manager' | 'staff' = 'staff';
    if (email.startsWith('manager_')) derivedRole = 'manager';
    else if (email.startsWith('staff_')) derivedRole = 'staff';
    else {
      toast.error('Login email must start with manager_ or staff_');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const storedUsers = JSON.parse(localStorage.getItem('core_inventory_users') || '[]');
      const user = storedUsers.find((u: any) => u.email === email && u.password === password);

      if (email === 'demo@coreinventory.com' && password === 'Demo123!') {
        const demoUser = { id: 'demo123', name: 'Demo Manager', email, role: 'manager' as const };
        doLogin(demoUser);
        toast.success('Welcome back, Demo Manager! 👋');
        navigate('/');
        return;
      }
      
      if (user) {
        // Force the derived role based on email even if stored differently
        doLogin({ id: user.id, name: user.name, email: user.email, role: derivedRole });
        const updated = storedUsers.map((u: any) => u.email === email ? { ...u, lastLogin: new Date().toISOString(), role: derivedRole } : u);
        localStorage.setItem('core_inventory_users', JSON.stringify(updated));
        toast.success(`Welcome back, ${user.name}! 👋`);
        setIsLoading(false);
        navigate('/');
      } else {
        toast.error('Invalid email or password.');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-muted-foreground mt-1 text-sm">Sign in to your account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email" required
              className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
              placeholder="name@company.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium">Password</label>
            <Link to="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'} required
              className="w-full pl-10 pr-10 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-base"
              placeholder="Enter your password"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <input type="checkbox" id="remember" className="rounded h-4 w-4 accent-indigo-600"
            checked={remember} onChange={e => setRemember(e.target.checked)} />
          <label htmlFor="remember" className="ml-2 text-sm">Remember me</label>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-base disabled:opacity-50 gap-2">
          {isLoading
            ? <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            : <><LogIn className="w-4 h-4" /> Sign In</>
          }
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="text-primary hover:underline font-medium">Sign up</Link>
      </p>
    </div>
  );
}
