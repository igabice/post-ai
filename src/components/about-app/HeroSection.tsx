import { Button } from "@/components/ui/button";

import {
  Calendar,
  TrendingUp,
  Brain,
  Zap,
  BarChart3,
  Clock,
} from "lucide-react";

const heroImage = "/hero-image.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Floating Icons Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Calendar
          className="absolute top-20 left-10 text-white/30 animate-pulse"
          size={24}
        />
        <TrendingUp
          className="absolute top-40 right-20 text-white/30 animate-bounce"
          size={28}
        />
        <Brain
          className="absolute bottom-40 left-20 text-white/30 animate-pulse"
          size={32}
        />
        <Zap
          className="absolute bottom-20 right-10 text-white/30 animate-bounce"
          size={24}
        />
        <BarChart3
          className="absolute top-60 left-1/4 text-white/30 animate-pulse"
          size={28}
        />
        <Clock
          className="absolute bottom-60 right-1/3 text-white/30 animate-bounce"
          size={24}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Brain className="w-4 h-4 text-white mr-2" />
            <span className="text-white text-sm font-medium">
              AI-Powered Content Strategy
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Master Your
            <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Content Calendar
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your social media strategy with AI-driven content
            suggestions, optimal timing insights, and trending topic alerts.
            Never miss an opportunity to engage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button variant="default" size="lg" className="text-lg px-8 py-3">
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-3 bg-white text-primary border-white hover:bg-white/90"
            >
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold">10x</div>
              <div className="text-sm">Engagement Boost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm">AI Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm">Content Types</div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
