"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SocialMediaAccount } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { getPlatformIcon } from "@/lib/social-media-utils";

interface SocialMediaAccountItemProps {
  account: SocialMediaAccount;
  onEdit: (account: SocialMediaAccount) => void;
  onDelete: (accountId: string) => void;
  isAdmin: boolean;
}

export function SocialMediaAccountItem({
  account,
  onEdit,
  onDelete,
  isAdmin,
}: SocialMediaAccountItemProps) {
  return (
    <div
      key={account.id}
      className="flex items-center justify-between p-2 rounded-lg border"
    >
      <div className="flex items-center gap-3">
        {account.image ? (
          <Image
            src={account.image}
            alt={account.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        ) : (
          <Image
            src={getPlatformIcon(account.title)}
            alt={account.name}
            width={24}
            height={24}
            className="rounded-full"
          />
        )}
        <div>
          <p className="font-semibold">
            {account.name} ({account.userName})
          </p>
          <p className="text-sm text-muted-foreground">
            {account.title}
          </p>
          {account.profileLink && (
            <a
              href={account.profileLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View Profile
            </a>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(account)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(account.id)}
          disabled={!isAdmin}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
