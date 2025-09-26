import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, Users, Crown } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "per month",
    description: "Perfect for solo creators and small businesses",
    icon: Sparkles,
    features: [
      "3 social accounts",
      "50 scheduled posts/month",
      "Basic analytics",
      "AI content suggestions",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "per month",
    description: "Ideal for growing businesses and agencies",
    icon: Users,
    features: [
      "10 social accounts",
      "Unlimited scheduled posts",
      "Advanced analytics & insights",
      "Trending topic alerts",
      "Priority support",
      "Team collaboration",
      "Custom branding",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "per month",
    description: "For large organizations with custom needs",
    icon: Crown,
    features: [
      "Unlimited social accounts",
      "White-label solution",
      "Advanced AI training",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Phone support",
    ],
    popular: false,
  },
];

const CTASection = () => {
  return (
    <section id="pricing" className="py-20 bg-accent-gradient">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your
            <span className="bg-primary-gradient bg-clip-text text-transparent">
              {" "}
              Growth Plan
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start with a 14-day free trial. No credit card required. Cancel
            anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-8 bg-card border-2 transition-all duration-300 hover:shadow-strong hover:-translate-y-2 ${
                plan.popular
                  ? "border-primary shadow-medium scale-105"
                  : "border-border shadow-soft hover:border-primary/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-gradient text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
                    plan.popular
                      ? "from-purple-500 to-blue-600"
                      : "from-gray-400 to-gray-600"
                  } flex items-center justify-center mx-auto mb-4`}
                >
                  <plan.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-card-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    <span className="text-card-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
                size="lg"
              >
                Start Free Trial
              </Button>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Join thousands of creators and businesses already growing with
            ContentFlow
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-lg font-semibold">TechCrunch</div>
            <div className="text-lg font-semibold">Product Hunt</div>
            <div className="text-lg font-semibold">Forbes</div>
            <div className="text-lg font-semibold">Entrepreneur</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
