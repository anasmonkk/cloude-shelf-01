import { motion } from "framer-motion";
import { Search, ShoppingBag, Truck, RotateCcw } from "lucide-react";

const steps = [
  { icon: Search, title: "Browse", desc: "Find items available near you based on your area.", color: "bg-primary/10 text-primary" },
  { icon: ShoppingBag, title: "Rent", desc: "Place your order with transparent pricing and commission.", color: "bg-accent/10 text-accent" },
  { icon: Truck, title: "Get Delivered", desc: "Owner delivers or local delivery staff brings it to you.", color: "bg-success/10 text-success" },
  { icon: RotateCcw, title: "Return", desc: "Return the item after your rental period ends.", color: "bg-muted text-muted-foreground" },
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground font-body max-w-md mx-auto">Rent items from your neighborhood in four simple steps.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${step.color}`}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-display font-semibold text-muted-foreground">Step {i + 1}</span>
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
