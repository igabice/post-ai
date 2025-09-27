'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PostSheet } from '@/components/calendar/post-sheet';

export function CreatePostButton({ children }: { children?: React.ReactNode }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleNewPost = () => {
    setIsSheetOpen(true);
  };

  return (
    <>
      <Button onClick={handleNewPost}>{children || 'Create Post'}</Button>
      <PostSheet
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        post={null}
        selectedDate={new Date()}
      />
    </>
  );
}
