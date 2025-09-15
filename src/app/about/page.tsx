import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CheckCircle, Search, Sparkles, SlidersHorizontal, View } from 'lucide-react';


const features = [
    {
        icon: <Calendar className="h-8 w-8 mb-4 text-primary" />,
        title: 'Content Calendar',
        description: 'Provides a visual, interactive calendar to plan your content. Set themes, target titles, and ensure a balanced mix of educational, promotional, and personal content.',
    },
    {
        icon: <View className="h-8 w-8 mb-4 text-primary" />,
        title: 'Intuitive Views',
        description: 'Choose between a clear calendar view (monthly or weekly) or a simple list view for quick editing and management of scheduled posts.',
    },
    {
        icon: <CheckCircle className="h-8 w-8 mb-4 text-primary" />,
        title: 'Post Control',
        description: 'Set posts to auto-publish for complete hands-off automation, or require manual verification before a post goes live to ensure brand alignment.',
    },
    {
        icon: <Search className="h-8 w-8 mb-4 text-primary" />,
        title: 'Trending Topic Alerts',
        description: "Our system actively monitors relevant keywords and trending topics in your chosen industry and sends notifications with AI-generated tweet ideas.",
    },
    {
        icon: <Sparkles className="h-8 w-8 mb-4 text-primary" />,
        title: 'Follow-Up Suggestions',
        description: "The AI suggests threads or follow-up ideas to create a deeper conversation, helping you build a more comprehensive and engaging narrative.",
    },
    {
        icon: <SlidersHorizontal className="h-8 w-8 mb-4 text-primary" />,
        title: 'Personalized Profile',
        description: "During onboarding, establish your brand identity by selecting core topics, post frequency, and notification style to get highly relevant suggestions.",
    }
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-primary hover:underline mb-8 block">&larr; Back to App</Link>

          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold tracking-tighter mb-4">About Content Compass</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We transform the daunting task of daily posting into a streamlined, proactive process.
            </p>
          </header>

          <main>
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-center mb-8">How We Help You Grow</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-card">
                    <CardHeader>
                      {feature.icon}
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            
            <section className="text-center">
                 <h2 className="text-3xl font-bold mb-4">Ready to take control of your content?</h2>
                 <p className="text-muted-foreground mb-8">Start planning, creating, and analyzing with Content Compass today.</p>
                 <Link href="/calendar">
                    <span className="inline-block bg-primary text-primary-foreground font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors">
                        Get Started
                    </span>
                </Link>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
