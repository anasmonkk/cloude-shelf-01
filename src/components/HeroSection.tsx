import { motion } from "framer-motion";
import { ArrowRight, MapPin, Shield, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center gradient-hero overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-20 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-sm font-body font-medium mb-6">
            Hyperlocal Rental Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground leading-tight mb-4">
            Cloud Shelf
          </h1>
          <p className="text-xl md:text-2xl font-display font-medium text-primary-foreground/90 mb-2">
            It's Your Next Shelf
          </p>
          <p className="text-lg text-primary-foreground/75 font-body mb-8 max-w-lg">
            Rent anything from your neighbors. From tools to dresses, find what you need from people near you — delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="font-display font-semibold gap-2">
                Start Renting <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register?role=owner">
              <Button size="lg" variant="outline" className="font-display font-semibold border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                List Your Items
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-2xl"
        >
          {[
            { icon: MapPin, label: "Hyperlocal", desc: "Items from your area" },
            { icon: Truck, label: "Delivered", desc: "Door-to-door service" },
            { icon: Shield, label: "Secure", desc: "Deposit-backed rentals" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 bg-primary-foreground/10 rounded-lg p-4 backdrop-blur-sm">
              <f.icon className="h-5 w-5 text-primary-foreground" />
              <div>
                <p className="text-sm font-display font-semibold text-primary-foreground">{f.label}</p>
                <p className="text-xs text-primary-foreground/70 font-body">{f.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
