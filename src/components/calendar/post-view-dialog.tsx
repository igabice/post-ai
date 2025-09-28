"use client";

import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Pencil, Share2, Copy, ExternalLink } from "lucide-react";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/app-provider";
import { getPlatformIcon } from "@/lib/social-media-utils";
import { useToast } from "@/hooks/use-toast";

type PostViewDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  post: Post | null;
  onEdit: (post: Post) => void;
};

const statusColors: { [key: string]: string } = {
  Published: "bg-green-100 text-green-800 border-green-200",
  Scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  "Needs Verification": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Draft: "bg-gray-100 text-gray-800 border-gray-200",
};

export function PostViewDialog({
  isOpen,
  setIsOpen,
  post,
  onEdit,
}: PostViewDialogProps) {
  const { activeTeam } = useApp();
  const { toast } = useToast();

  if (!post) return null;

  const socialMediaAccounts = post.socialMediaAccountIds
    .map((id) => activeTeam?.socialMediaAccounts.find((acc) => acc.id === id))
    .filter(Boolean);

  const handleShare = (platform: string) => {
    const text = encodeURIComponent(post.content);
    let url = "";

    switch (platform.toLowerCase()) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${text}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=&summary=${text}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          window.location.href
        )}&quote=${text}`;
        break;
      // Add other platforms as needed
      default:
        toast({
          title: "Sharing not supported",
          description: `Sharing is not yet implemented for ${platform}.`,
        });
        return;
    }
    window.open(url, "_blank");
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(post.content);
    toast({ title: "Content copied to clipboard" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{post.title}</DialogTitle>
          <DialogDescription>
            {format(post.date, "MMMM d, yyyy, p")}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="prose prose-sm dark:prose-invert max-w-none py-4 whitespace-pre-wrap">
          {post.content}
        </div>
        <Separator />
        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <Badge
                variant="outline"
                className={cn(
                  "font-normal border-border",
                  statusColors[post.status]
                )}
              >
                {post.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">Auto-publish:</span>
              <Badge variant={post.autoPublish ? "default" : "secondary"}>
                {post.autoPublish ? "On" : "Off"}
              </Badge>
            </div>
          </div>
          {socialMediaAccounts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-semibold">Accounts:</span>
              <div className="flex flex-wrap gap-2">
                {socialMediaAccounts.map((account) => (
                  <Badge
                    key={account!.id}
                    variant="outline"
                    className="flex items-center gap-1.5"
                  >
                    {account!.image ? (
                      <Image
                        src={account!.image}
                        alt={account!.name}
                        width={14}
                        height={14}
                        className="rounded-full"
                      />
                    ) : (
                      <Image
                        src={getPlatformIcon(account!.title)}
                        alt={account!.name}
                        width={14}
                        height={14}
                        className="rounded-full"
                      />
                    )}
                    {account!.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        {post.status === "Published" && (
          <>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">Analytics</h4>
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold">
                    {post.analytics.impressions.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Impressions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {post.analytics.likes.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {post.analytics.retweets.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Retweets</p>
                </div>
              </div>
            </div>
          </>
        )}
        <DialogFooter className="pt-4 sm:justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {socialMediaAccounts.map((account) => (
                <DropdownMenuItem
                  key={account!.id}
                  onClick={() => handleShare(account!.title)}
                >
                  <Image
                    src={getPlatformIcon(account!.title)}
                    alt={account!.name}
                    width={14}
                    height={14}
                    className="mr-2 rounded-full"
                  />
                  Share to {account!.name}
                </DropdownMenuItem>
              ))}
              {socialMediaAccounts.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={handleCopyContent}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Content
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                onEdit(post);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
