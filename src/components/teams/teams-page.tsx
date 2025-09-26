"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/app-provider";
import { UserProfile, TeamMember } from "@/lib/types";
import { getUserProfile } from "@/services/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnrichedTeamMember extends TeamMember {
  profile?: UserProfile;
}

export default function TeamsPageClient() {
  const { activeTeam, sendInvite } = useApp();
  const [members, setMembers] = useState<EnrichedTeamMember[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (activeTeam) {
      const fetchMemberProfiles = async () => {
        const enrichedMembers = await Promise.all(
                    Object.entries(activeTeam.members).map(async ([memberUid, memberData]) => {
            const profile = await getUserProfile(memberUid);
            
            return { ...memberData, uid: memberUid, profile };
          })
        );
        setMembers(enrichedMembers);
      };
      fetchMemberProfiles();
    }
  }, [activeTeam]);

  const handleSendInvite = async () => {
    if (activeTeam && inviteEmail) {
      const inviteId = await sendInvite(activeTeam.id, inviteEmail);
      if (inviteId) {
        // Maybe show the invite link to the user to share
        alert(
          `Invitation sent! Share this link: /accept-invite?token=${inviteId}`
        );
        setInviteEmail("");
      }
    }
  };

  if (!activeTeam) {
    return <div>No active team selected.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite New Member</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="user@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleSendInvite} className="self-end">
            Send Invite
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.profile?.uid}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.profile?.avatarUrl} />
                    <AvatarFallback>{member.profile?.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{member.profile?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.permissions.isAdmin ? "Admin" : "Member"}
                    </p>
                  </div>
                </div>
                {/* Add controls for permissions and status here */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
