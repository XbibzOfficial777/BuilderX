import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Play,
  Box,
  Layout,
  Code,
  Layers,
  Zap,
  Users,
  Check,
  Github,
  Twitter,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useState } from 'react';

const features = [
  {
    icon: Layout,
    title: 'Visual Canvas',
    description: 'Drag, snap, and align with real Flutter constraints.',
  },
  {
    icon: Play,
    title: 'Live Preview',
    description: 'See changes instantly on device frames.',
  },
  {
    icon: Code,
    title: 'Real Dart Export',
    description: 'Clean, readable code. No bloat.',
  },
  {
    icon: Layers,
    title: 'Widget Library',
    description: '100+ vetted Material & Cupertino widgets.',
  },
  {
    icon: Zap,
    title: 'State-Friendly',
    description: 'Bind values, events, and mocks.',
  },
  {
    icon: Users,
    title: 'Team Sync',
    description: 'Share links, review previews, merge changes.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Add widgets',
    description: 'Drag from the library. Snap to layout.',
  },
  {
    number: '02',
    title: 'Tune properties',
    description: 'Spacing, color, text—live.',
  },
  {
    number: '03',
    title: 'Export & run',
    description: 'Copy Dart or download the project.',
  },
];

const testimonials = [
  {
    quote: 'The fastest way to prototype.',
    content: 'I go from idea to interactive preview in minutes.',
    author: 'Elena R.',
    role: 'Mobile Lead',
  },
  {
    quote: 'Actually readable Dart.',
    content: 'No weird generated classes. It feels like I wrote it.',
    author: 'Sam K.',
    role: 'Freelance Dev',
  },
  {
    quote: "Our team's new default.",
    content: "We design in FlutterForge, then paste into the repo.",
    author: 'Mina O.',
    role: 'Engineering Manager',
  },
];

const pricing = [
  {
    name: 'Free',
    description: 'Personal projects',
    price: '$0',
    period: '/mo',
    features: [
      '3 projects',
      'Live preview',
      'Code export',
      'Basic widgets',
    ],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For serious builders',
    price: '$12',
    period: '/mo',
    features: [
      'Unlimited projects',
      'Private previews',
      'Version history',
      'All widgets',
      'Priority support',
    ],
    cta: 'Start free trial',
    highlighted: true,
  },
  {
    name: 'Team',
    description: 'For teams',
    price: '$29',
    period: '/mo/seat',
    features: [
      'Everything in Pro',
      'Shared libraries',
      'Team permissions',
      'Slack alerts',
      'SSO',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-[#07080D]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#07080D]/80 backdrop-blur-md border-b border-[#1E1E2E]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B6DFF] to-[#2EE7FF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#F2F4F8]">FlutterForge</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                Features
              </a>
              <a href="#preview" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                Preview
              </a>
              <a href="#widgets" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                Widgets
              </a>
              <a href="#pricing" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                Pricing
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth/login')}
                className="text-[#A7ACB8] hover:text-[#F2F4F8] hover:bg-[#1E1E2E]"
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate('/auth/signup')}
                className="bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white"
              >
                Start building — free
              </Button>
            </div>

            <button
              className="md:hidden text-[#F2F4F8]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-[#0E111A] border-b border-[#1E1E2E]"
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-[#A7ACB8] hover:text-[#F2F4F8]">
                Features
              </a>
              <a href="#preview" className="block text-[#A7ACB8] hover:text-[#F2F4F8]">
                Preview
              </a>
              <a href="#widgets" className="block text-[#A7ACB8] hover:text-[#F2F4F8]">
                Widgets
              </a>
              <a href="#pricing" className="block text-[#A7ACB8] hover:text-[#F2F4F8]">
                Pricing
              </a>
              <div className="pt-4 border-t border-[#1E1E2E] space-y-2">
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-[#2D2D3D] text-[#F2F4F8]"
                  onClick={() => navigate('/auth/login')}
                >
                  Log in
                </Button>
                <Button
                  className="w-full bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white"
                  onClick={() => navigate('/auth/signup')}
                >
                  Start building — free
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#7B6DFF]/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#2EE7FF]/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#F2F4F8] leading-tight mb-6">
              Design Flutter UIs.
              <br />
              <span className="bg-gradient-to-r from-[#7B6DFF] to-[#2EE7FF] bg-clip-text text-transparent">
                Preview instantly.
              </span>
              <br />
              Ship clean code.
            </h1>
            <p className="text-lg sm:text-xl text-[#A7ACB8] max-w-2xl mx-auto mb-10">
              A visual builder that stays true to Flutter—real widgets, real layout, real Dart.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/auth/signup')}
                className="bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white px-8"
              >
                Start building — free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-[#2D2D3D] text-[#F2F4F8] hover:bg-[#1E1E2E] px-8"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch how it works
              </Button>
            </div>
          </motion.div>

          {/* IDE Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-[#0E111A] border border-[#1E1E2E] rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-10 bg-[#07080D] border-b border-[#1E1E2E] flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center text-sm text-[#A7ACB8]">main.dart - FlutterForge</div>
              </div>
              <div className="h-[400px] flex">
                <div className="w-48 bg-[#07080D] border-r border-[#1E1E2E] p-4">
                  <div className="text-xs text-[#A7ACB8] uppercase tracking-wider mb-3">Explorer</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-[#F2F4F8]">
                      <Box className="w-4 h-4 text-[#7B6DFF]" />
                      lib/
                    </div>
                    <div className="pl-6 flex items-center gap-2 text-sm text-[#A7ACB8]">
                      <Code className="w-4 h-4" />
                      main.dart
                    </div>
                    <div className="pl-6 flex items-center gap-2 text-sm text-[#A7ACB8]">
                      <Layers className="w-4 h-4" />
                      widgets/
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-4 font-mono text-sm">
                  <div className="text-[#A7ACB8]">
                    <span className="text-[#7B6DFF]">import</span>{' '}
                    <span className="text-[#2EE7FF]">'package:flutter/material.dart'</span>;
                  </div>
                  <div className="mt-4 text-[#A7ACB8]">
                    <span className="text-[#7B6DFF]">class</span>{' '}
                    <span className="text-[#F2F4F8]">MyApp</span>{' '}
                    <span className="text-[#7B6DFF]">extends</span>{' '}
                    <span className="text-[#F2F4F8]">StatelessWidget</span>{' '}
                    {'{'}
                  </div>
                  <div className="pl-4 text-[#A7ACB8]">
                    <span className="text-[#7B6DFF]">@override</span>
                  </div>
                  <div className="pl-4 text-[#A7ACB8]">
                    <span className="text-[#F2F4F8]">Widget</span>{' '}
                    <span className="text-[#7B6DFF]">build</span>(BuildContext context) {'{'}
                  </div>
                  <div className="pl-8 text-[#A7ACB8]">
                    <span className="text-[#7B6DFF]">return</span>{' '}
                    <span className="text-[#F2F4F8]">Scaffold</span>(
                  </div>
                  <div className="pl-12 text-[#A7ACB8]">
                    body: <span className="text-[#F2F4F8]">Center</span>(
                  </div>
                  <div className="pl-16 text-[#A7ACB8]">
                    child: <span className="text-[#F2F4F8]">Text</span>(
                  </div>
                  <div className="pl-20 text-[#2EE7FF]">'Hello, FlutterForge!'</div>
                  <div className="pl-16">),</div>
                  <div className="pl-12">),</div>
                  <div className="pl-8">);</div>
                  <div className="pl-4">{'}'}</div>
                  <div>{'}'}</div>
                </div>
                <div className="w-64 bg-[#07080D] border-l border-[#1E1E2E] p-4">
                  <div className="text-xs text-[#A7ACB8] uppercase tracking-wider mb-3">Preview</div>
                  <div className="bg-[#0E111A] rounded-xl border border-[#1E1E2E] p-4 aspect-[9/16]">
                    <div className="h-full flex items-center justify-center">
                      <span className="text-[#F2F4F8] text-sm">Hello, FlutterForge!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F2F4F8] mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-lg text-[#A7ACB8] max-w-2xl mx-auto">
              From layout to logic—build real Flutter screens without losing control.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#0E111A] border border-[#1E1E2E] rounded-xl p-6 hover:border-[#7B6DFF]/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#7B6DFF]/20 flex items-center justify-center mb-4 group-hover:bg-[#7B6DFF]/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#7B6DFF]" />
                </div>
                <h3 className="text-lg font-semibold text-[#F2F4F8] mb-2">{feature.title}</h3>
                <p className="text-[#A7ACB8]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0E111A]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F2F4F8] mb-4">
              Build in three steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-[#7B6DFF]/30 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-[#F2F4F8] mb-2">{step.title}</h3>
                <p className="text-[#A7ACB8]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F2F4F8] mb-4">
              Loved by Flutter devs
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#0E111A] border border-[#1E1E2E] rounded-xl p-6"
              >
                <div className="text-2xl font-bold text-[#7B6DFF] mb-3">"{testimonial.quote}"</div>
                <p className="text-[#A7ACB8] mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#7B6DFF]/20 flex items-center justify-center">
                    <span className="text-[#7B6DFF] font-semibold">
                      {testimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-[#F2F4F8]">{testimonial.author}</div>
                    <div className="text-sm text-[#A7ACB8]">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0E111A]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F2F4F8] mb-4">
              Start free. Scale when you ship.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  'bg-[#07080D] border rounded-xl p-6',
                  plan.highlighted
                    ? 'border-[#7B6DFF] shadow-lg shadow-[#7B6DFF]/10'
                    : 'border-[#1E1E2E]'
                )}
              >
                {plan.highlighted && (
                  <div className="inline-block px-3 py-1 bg-[#7B6DFF]/20 text-[#7B6DFF] text-xs font-medium rounded-full mb-4">
                    Recommended
                  </div>
                )}
                <h3 className="text-xl font-semibold text-[#F2F4F8] mb-1">{plan.name}</h3>
                <p className="text-[#A7ACB8] text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-[#F2F4F8]">{plan.price}</span>
                  <span className="text-[#A7ACB8]">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-[#A7ACB8]">
                      <Check className="w-4 h-4 text-[#7B6DFF]" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    'w-full',
                    plan.highlighted
                      ? 'bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white'
                      : 'bg-transparent border border-[#2D2D3D] text-[#F2F4F8] hover:bg-[#1E1E2E]'
                  )}
                  onClick={() => navigate('/auth/signup')}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F2F4F8] mb-4">
              Start building your first screen
            </h2>
            <p className="text-lg text-[#A7ACB8] mb-8">
              No install. No credit card. Just Flutter.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth/signup')}
              className="bg-[#7B6DFF] hover:bg-[#6B5DEE] text-white px-8"
            >
              Start building — free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7B6DFF] to-[#2EE7FF] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-[#F2F4F8]">FlutterForge</span>
            </div>

            <div className="flex items-center gap-8">
              <a href="#features" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                Pricing
              </a>
              <a href="#" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                Docs
              </a>
              <a href="#" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                Support
              </a>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#A7ACB8] hover:text-[#F2F4F8] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#1E1E2E] text-center text-[#A7ACB8] text-sm">
            © 2024 FlutterForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

import { cn } from '@/lib/utils';
