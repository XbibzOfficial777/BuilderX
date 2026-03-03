import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { resetPassword } from '@/lib/firebase';

export function ResetPassword() {
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }
    
    setIsSent(true);
    setIsLoading(false);
    
    toast({
      title: 'Email sent',
      description: 'Check your inbox for password reset instructions.',
    });
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
          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-[#F2F4F8] mb-2">Reset your password</h1>
                  <p className="text-[#A7ACB8]">Enter your email and we'll send you instructions</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  
                  <Button
                    type="submit"
                    className="w-full bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#F2F4F8] mb-2">Check your email</h2>
                <p className="text-[#A7ACB8] mb-6">
                  We've sent password reset instructions to<br />
                  <span className="text-[#F2F4F8]">{email}</span>
                </p>
                <Button
                  variant="outline"
                  className="bg-transparent border-[#2D2D3D] text-[#F2F4F8] hover:bg-[#1E1E2E]"
                  onClick={() => setIsSent(false)}
                >
                  Didn't receive it? Try again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-6 pt-6 border-t border-[#1E1E2E]">
            <Link 
              to="/auth/login" 
              className="flex items-center justify-center gap-2 text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
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
