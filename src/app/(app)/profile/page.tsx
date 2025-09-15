import { ProfileForm } from '@/components/profile/profile-form';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Customize your profile to get personalized content suggestions.
        </p>
      </div>
      <ProfileForm />
    </div>
  );
}
