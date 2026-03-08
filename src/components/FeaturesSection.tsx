import { motion } from "framer-motion";
import { MapPin, Wallet, Users, BarChart3, Package, CreditCard } from "lucide-react";

const features = [
  { icon: MapPin, title: "Area-Based Discovery", desc: "Items are shown based on your Panchayath and Area for true hyperlocal rentals." },
  { icon: Package, title: "Flexible Listings", desc: "Vendors set prices, deposits, and choose pre or post payment options." },
  { icon: Users, title: "Delivery Network", desc: "Local delivery staff accept broadcast orders within their assigned area." },
  { icon: Wallet, title: "Wallet System", desc: "Owners and delivery staff track earnings, settlements, and transactions." },
  { icon: CreditCard, title: "Transparent Pricing", desc: "Rental price + platform commission + delivery charge — no hidden fees." },
  { icon: BarChart3, title: "Admin Control", desc: "Full settlement, payment monitoring, and area management for admins." },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-secondary">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">Built for Hyperlocal Rentals</h2>
          <p className="text-muted-foreground font-body max-w-lg mx-auto">Everything you need to rent and earn within your community.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-elevated transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
