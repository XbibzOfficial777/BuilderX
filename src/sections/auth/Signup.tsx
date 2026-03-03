import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Chrome,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';

export function Signup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setUser } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }
    
    if (!agreeTerms) {
      toast({
        title: 'Error',
        description: 'Please agree to the terms and conditions',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    const { user, error } = await signUpWithEmail(email, password, name);
    
    if (error) {
      toast({
        title: 'Signup failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    if (user) {
      setUser(user);
      toast({
        title: 'Welcome to FlutterForge!',
        description: 'Your account has been created successfully.',
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };
  
  const handleGoogleSignup = async () => {
    setIsLoading(true);
    
    const { user, error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: 'Signup failed',
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
        description: 'You have successfully signed up with Google.',
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };
  
  const strength = passwordStrength();
  
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
            <h1 className="text-2xl font-bold text-[#F2F4F8] mb-2">Create your account</h1>
            <p className="text-[#A7ACB8]">Start building Flutter apps visually</p>
          </div>
          
          {/* Google Signup */}
          <Button
            variant="outline"
            className="w-full mb-6 bg-transparent border-[#2D2D3D] text-[#F2F4F8] hover:bg-[#1E1E2E] hover:border-[#7B6DFF]/50"
            onClick={handleGoogleSignup}
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
          
          {/* Email Signup Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#F2F4F8]">Full name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A7ACB8]" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] placeholder:text-[#A7ACB8]/50 focus:border-[#7B6DFF] focus:ring-[#7B6DFF]/20"
                  disabled={isLoading}
                />
              </div>
            </div>
            
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
              
              {/* Password strength */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength 
                            ? strength >= 3 
                              ? 'bg-green-500' 
                              : strength >= 2 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                            : 'bg-[#2D2D3D]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    strength >= 3 ? 'text-green-500' : strength >= 2 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {strength === 0 && 'Very weak'}
                    {strength === 1 && 'Weak'}
                    {strength === 2 && 'Fair'}
                    {strength === 3 && 'Good'}
                    {strength === 4 && 'Strong'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#F2F4F8]">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A7ACB8]" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-[#07080D] border-[#2D2D3D] text-[#F2F4F8] placeholder:text-[#A7ACB8]/50 focus:border-[#7B6DFF] focus:ring-[#7B6DFF]/20"
                  disabled={isLoading}
                />
              </div>
              {confirmPassword && password === confirmPassword && (
                <div className="flex items-center gap-1 text-green-500 text-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  Passwords match
                </div>
              )}
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="border-[#2D2D3D] data-[state=checked]:bg-[#7B6DFF] data-[state=checked]:border-[#7B6DFF] mt-1"
              />
              <Label htmlFor="terms" className="text-sm text-[#A7ACB8] cursor-pointer leading-relaxed">
                I agree to the{' '}
                <Link to="/terms" className="text-[#7B6DFF] hover:text-[#9B8FFF]">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#7B6DFF] hover:text-[#9B8FFF]">Privacy Policy</Link>
              </Label>
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
                  Create account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
          
          <p className="text-center mt-6 text-[#A7ACB8]">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-[#7B6DFF] hover:text-[#9B8FFF] transition-colors font-medium">
              Sign in
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
