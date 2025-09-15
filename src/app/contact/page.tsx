import Link from 'next/link';
import { ContactForm } from '@/components/contact/contact-form';

export default function ContactPage() {
  return (
    <div className="bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/" className="text-primary hover:underline mb-8 block">&larr; Back to App</Link>
                <header className="text-center mb-12">
                    <h1 className="text-5xl font-bold tracking-tighter mb-4">Contact Us</h1>
                    <p className="text-xl text-muted-foreground">
                        Have a question or feedback? We'd love to hear from you.
                    </p>
                </header>
                <main>
                    <ContactForm />
                </main>
            </div>
        </div>
    </div>
  );
}
