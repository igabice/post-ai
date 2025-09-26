import { Card } from "@/components/ui/card";
import { 
  Calendar, 
  TrendingUp, 
  Brain, 
  User, 
  BarChart3, 
  Clock, 
  Settings,
  Users
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Visual Content Calendar",
    description: "Plan, organize, and schedule your content with an intuitive drag-and-drop calendar interface that makes content planning effortless.",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Trending Topic Alerts",
    description: "Stay ahead of the curve with real-time monitoring of trending topics and keywords, complete with AI-generated content suggestions.",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    icon: Brain,
    title: "AI Content Suggestions",
    description: "Get personalized thread ideas, follow-up content, and engagement strategies powered by advanced AI that learns your brand voice.",
    gradient: "from-pink-500 to-red-600"
  },
  {
    icon: User,
    title: "Custom Profile Setup",
    description: "Tailor your experience by selecting core topics, preferred posting frequency, and audience preferences for maximum relevance.",
    gradient: "from-green-500 to-blue-600"
  },
  {
    icon: BarChart3,
    title: "Engagement Analytics",
    description: "Track performance with detailed analytics on likes, retweets, impressions, and engagement rates for data-driven decisions.",
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    icon: Clock,
    title: "Optimal Posting Times",
    description: "Discover the perfect times to post based on your audience's activity patterns and maximize your content's reach and impact.",
    gradient: "from-indigo-500 to-purple-600"
  },
  {
    icon: Settings,
    title: "Smart Post Control",
    description: "Choose between auto-publish for efficiency or manual verification for complete control over every piece of content that goes live.",
    gradient: "from-teal-500 to-green-600"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members, assign roles, and collaborate seamlessly on content creation with workspace sharing and permission management.",
    gradient: "from-orange-500 to-red-600"
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Everything You Need to 
            <span className="bg-primary-gradient bg-clip-text text-transparent"> Dominate Social Media</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered tools transforms how you create, schedule, and optimize your social media content.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-6 bg-card-gradient border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-card-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
