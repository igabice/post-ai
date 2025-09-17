
import { Icons } from '@/components/icons';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-xl mx-auto">
            <div className="flex justify-center items-center gap-2 mb-8">
                <Icons.Logo className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold">Content Compass</h1>
            </div>
            {children}
        </div>
    </div>
  );
}
