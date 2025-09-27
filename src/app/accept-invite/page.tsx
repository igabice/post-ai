'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function AcceptInviteContent() {
  const [status, setStatus] = useState('validating'); // validating, invalid, accepted, error
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { acceptInvite, user, signInWithGoogle } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      if (user) {
        acceptInvite(token)
          .then(() => {
            setStatus('accepted');
          })
          .catch((error) => {
            console.error(error);
            setStatus('error');
          });
      } else {
        localStorage.setItem('pending-invite-token', token);
      }
    } else {
      setStatus('invalid');
    }
  }, [token, user, acceptInvite]);

  if (!user) {
    return (
      <div className="text-center">
        <p className="mb-4">Please log in to accept the invitation.</p>
        <Button onClick={signInWithGoogle}>Login with Google</Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      {status === 'validating' && <p>Validating your invitation...</p>}
      {status === 'invalid' && <p>This invitation link is invalid.</p>}
      {status === 'accepted' && (
        <div>
          <p className="mb-4">Invitation accepted! You have been added to the team.</p>
          <Button onClick={() => router.push('/calendar')}>Go to Calendar</Button>
        </div>
      )}
      {status === 'error' && <p>There was an error accepting your invitation. It may be invalid or expired.</p>}
    </div>
  );
}

export default function AcceptInvitePage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Suspense fallback={<div>Loading...</div>}>
                <AcceptInviteContent />
            </Suspense>
        </div>
    )
}
