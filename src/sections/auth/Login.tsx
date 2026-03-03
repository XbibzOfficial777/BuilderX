import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Chrome,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

export function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    const { user, error } = await signInWithEmail(email, password);
    
    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    if (user) {
      setUser(user);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    const { user, error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    if (user) {
      setUser(user);
      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in with Google.',
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-[#07080D] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7B6DFF]/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#2EE7FF]/5 rounded-full blur-[128px]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7B6DFF] to-[#2EE7FF] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#F2F4F8]">FlutterForge</span>
          </Link>
        </div>
        
        {/* Card */}
        <div className="bg-[#0E111A] border border-[#1E1E2E] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#F2F4F8] mb-2">Welcome back</h1>
            <p className="text-[#A7ACB8]">Sign in to continue building</p>
          </div>
          
          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full mb-6 bg-transparent border-[#2D2D3D] text-[#F2F4F8] hover:bg-[#1E1E2E] hover:border-[#7B6DFF]/50"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Continue with Google
          </Button>
          
          <div className="relative mb-6">
            <Separator className="bg-[#2D2D3D]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0E111A] px-3 text-sm text-[#A7ACB8]">
              or
            </span>
          </div>
          
          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#F2F4F8]">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A7ACB8]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] placeholder:text-[#A7ACB8]/50 focus:border-[#7B6DFF] focus:ring-[#7B6DFF]/20"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#F2F4F8]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A7ACB8]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] placeholder:text-[#A7ACB8]/50 focus:border-[#7B6DFF] focus:ring-[#7B6DFF]/20"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-[#2D2D3D] data-[state=checked]:bg-[#7B6DFF] data-[state=checked]:border-[#7B6DFF]"
                />
                <Label htmlFor="remember" className="text-sm text-[#A7ACB8] cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link 
                to="/auth/reset-password" 
                className="text-sm text-[#7B6DFF] hover:text-[#9B8FFF] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
          
          <p className="text-center mt-6 text-[#A7ACB8]">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-[#7B6DFF] hover:text-[#9B8FFF] transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
        
        {/* Back to home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
