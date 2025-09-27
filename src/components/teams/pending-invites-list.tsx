"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/app-provider";
import {
  getPendingInvites,
  deleteInviteFromFirestore,
  resendInviteEmail,
} from "@/services/invites";
import { Invitation } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PendingInvitesList() {
  const { activeTeam } = useApp();
  const [pendingInvites, setPendingInvites] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);
  const [isResending, setIsResending] = useState<string | null>(null);
  const [openRevokeDialog, setOpenRevokeDialog] = useState(false);
  const [inviteToRevoke, setInviteToRevoke] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingInvites = async () => {
    if (!activeTeam?.id) return;
    setIsLoading(true);
    try {
      const invites = await getPendingInvites(activeTeam.id);
      setPendingInvites(invites);
    } catch (error) {
      console.error("Error fetching pending invites:", error);
      toast({
        title: "Error",
        description: "Failed to load pending invites.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInvites();
  }, [activeTeam?.id]);

  const handleRevokeInvite = async (inviteId: string) => {
    setIsRevoking(inviteId);
    try {
      await deleteInviteFromFirestore(inviteId);
      setPendingInvites((prev) =>
        prev.filter((invite) => invite.id !== inviteId)
      );
      toast({
        title: "Success",
        description: "Invitation revoked successfully.",
      });
    } catch (error) {
      console.error("Error revoking invite:", error);
      toast({
        title: "Error",
        description: "Failed to revoke invitation.",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(null);
    }
  };

  const handleRevokeClick = (inviteId: string) => {
    setInviteToRevoke(inviteId);
    setOpenRevokeDialog(true);
  };

  const handleConfirmRevoke = async () => {
    if (inviteToRevoke) {
      await handleRevokeInvite(inviteToRevoke);
      setInviteToRevoke(null);
      setOpenRevokeDialog(false);
    }
  };

  const handleResendInvite = async (invite: Invitation) => {
    if (!activeTeam?.id) return;
    setIsResending(invite.id);
    try {
      await resendInviteEmail(activeTeam.id, invite.inviteeEmail, invite.id);
      toast({
        title: "Success",
        description: `Invitation to ${invite.inviteeEmail} resent successfully.`,
      });
    } catch (error) {
      console.error("Error resending invite:", error);
      toast({
        title: "Error",
        description: "Failed to resend invitation.",
        variant: "destructive",
      });
    } finally {
      setIsResending(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
          <p className="mt-2">Loading invites...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingInvites.length === 0 ? (
          <p className="text-muted-foreground">No pending invitations.</p>
        ) : (
          <div className="space-y-4">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary"
              >
                <div>
                  <p className="font-semibold">{invite.inviteeEmail}</p>
                  <p className="text-sm text-muted-foreground">
                    {/* Invited by {invite.inviterId} */}
                    on {format(invite.createdAt.toDate(), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResendInvite(invite)}
                    disabled={isResending === invite.id}
                  >
                    {isResending === invite.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Resend
                  </Button>
                  <AlertDialog open={openRevokeDialog && inviteToRevoke === invite.id} onOpenChange={setOpenRevokeDialog}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeClick(invite.id)}
                        disabled={isRevoking === invite.id}
                      >
                        {isRevoking === invite.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently revoke the invitation for {invite.inviteeEmail}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmRevoke}>Revoke</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
