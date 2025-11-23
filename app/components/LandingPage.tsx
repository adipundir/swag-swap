"use client";

import { motion } from "framer-motion";
import { SmoothScroll } from "./SmoothScroll";
import { 
  ShoppingBag, 
  Shield, 
  Zap, 
  Globe, 
  ArrowRight,
  Upload,
  Search,
  Wallet
} from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";
import { useEffect, type ElementType } from "react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { login, authenticated, ready } = usePrivy();

  useEffect(() => {
    if (ready && authenticated) {
      onGetStarted();
    }
  }, [ready, authenticated, onGetStarted]);

  const handleGetStarted = () => {
    if (authenticated) {
      onGetStarted();
    } else {
      login();
    }
  };

  const features = [
    {
      icon: ShoppingBag,
      title: "Trade Swag",
      description: "Buy and sell exclusive hackathon merchandise from events worldwide"
    },
    {
      icon: Shield,
      title: "Secure Database",
      description: "Your listings stored securely in Neon PostgreSQL database"
    },
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Seamless crypto payments powered by x402 protocol"
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Connect with hackers and discover unique collectibles"
    }
  ];

  const steps = [
    {
      icon: Upload,
      title: "Create Listing",
      description: "Upload your hackathon swag with images stored in the database"
    },
    {
      icon: Search,
      title: "Browse Marketplace",
      description: "Discover unique items from hackathons around the globe"
    },
    {
      icon: Wallet,
      title: "Pay & Trade",
      description: "Complete transactions instantly with crypto payments"
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20 selection:text-primary">
      <SmoothScroll />
      {/* Subtle Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-3xl -z-10" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Subtle Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-full text-xs text-muted-foreground mb-6"
              >
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Decentralized Marketplace
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]"
              >
                Trade Hackathon
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Swag</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg"
              >
                Buy and sell exclusive hackathon merchandise. Discover rare collectibles and connect with hackers globally.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex gap-8 mb-8 border-l-2 border-border pl-6"
              >
                <div>
                  <div className="text-2xl font-bold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Listings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">2.5K+</div>
                  <div className="text-sm text-muted-foreground">Traders</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">50+</div>
                  <div className="text-sm text-muted-foreground">Events</div>
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGetStarted}
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground text-base font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Browse Marketplace
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Column - Product Cards Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                <PreviewCard 
                  icon={ShoppingBag}
                  title="ETH Denver Hoodie"
                  subtitle="Limited Edition 2024"
                  price="50 USDC"
                  tag="ETH Denver"
                  delay={0.5}
                />
                <PreviewCard 
                  icon={Shield}
                  title="Chainlink Cap"
                  subtitle="Official Swag"
                  price="15 USDC"
                  tag="Chainlink"
                  delay={0.6}
                  className="mt-8"
                />
                <PreviewCard 
                  icon={Zap}
                  title="Base T-Shirt"
                  subtitle="Brand New"
                  price="20 USDC"
                  tag="Base"
                  delay={0.7}
                />
                <PreviewCard 
                  icon={Globe}
                  title="Sticker Pack"
                  subtitle="Complete Set"
                  price="5 USDC"
                  tag="Polygon"
                  delay={0.8}
                  className="mt-8"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              Why SwagSwap?
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for the modern hacker. Trade with confidence on the most trusted decentralized marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Simple steps to start trading hackathon swag
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {steps.map((step, index) => {
              return (
                <div key={index} className="relative flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg shadow-primary/20">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground max-w-xs">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-20 text-center sm:px-16 shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl mb-4">
                Ready to Start Trading?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80 mb-10">
                Join thousands of hackers buying and selling exclusive hackathon merchandise.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center justify-center rounded-lg bg-background px-8 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent transition-colors"
                >
                  Browse Marketplace
                </button>
                <button
                  onClick={handleGetStarted}
                  className="inline-flex items-center justify-center rounded-lg border border-primary-foreground/20 bg-transparent px-8 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
                >
                  Create Listing
                </button>
              </div>
            </div>
            
            {/* Background Pattern */}
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
              aria-hidden="true"
            >
              <circle cx="512" cy="512" r="512" fill="url(#gradient)" fillOpacity="0.25" />
              <defs>
                <radialGradient id="gradient">
                  <stop stopColor="white" />
                  <stop offset="1" stopColor="white" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

interface PreviewCardProps {
  icon: ElementType;
  title: string;
  subtitle: string;
  price: string;
  tag: string;
  delay: number;
  className?: string;
}

function PreviewCard({ icon: Icon, title, subtitle, price, tag, delay, className = "" }: PreviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -4 }}
      className={`bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <div className="aspect-square bg-muted relative flex items-center justify-center">
        <Icon className="w-12 h-12 text-muted-foreground/20" />
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded-md text-xs font-medium border border-border">
          {tag}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold">{price}</span>
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            S
          </div>
          <span className="font-bold text-xl tracking-tight">SwagSwap</span>
        </div>
        
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} SwagSwap
        </div>
      </div>
    </footer>
  );
}
