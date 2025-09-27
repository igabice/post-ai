"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SocialMediaAccount {
  id: string;
  name: string;
  userName: string;
  title: string; // e.g., "Instagram", "Twitter"
  image: string; // URL to image
  profileLink: string;
  active: boolean;
}

export function TeamSocialMediaTab() {
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [newAccount, setNewAccount] = useState<Omit<SocialMediaAccount, "id">>({
    name: "",
    userName: "",
    title: "",
    image: "",
    profileLink: "",
    active: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccount((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setNewAccount((prev) => ({ ...prev, title: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setNewAccount((prev) => ({ ...prev, active: checked }));
  };

  const addAccount = () => {
    if (newAccount.name && newAccount.userName && newAccount.title) {
      setAccounts((prev) => [
        ...prev,
        { ...newAccount, id: String(prev.length + 1) },
      ]);
      setNewAccount({
        name: "",
        userName: "",
        title: "",
        image: "",
        profileLink: "",
        active: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        Social Media Accounts
      </h2>
      <p className="text-muted-foreground">
        Manage your team's connected social media accounts.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Add New Social Media Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              name="name"
              value={newAccount.name}
              onChange={handleInputChange}
              placeholder="e.g., My Brand Instagram"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="userName">Username/Handle</Label>
            <Input
              id="userName"
              name="userName"
              value={newAccount.userName}
              onChange={handleInputChange}
              placeholder="e.g., @mybrand"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Platform</Label>
            <Select onValueChange={handleSelectChange} value={newAccount.title}>
              <SelectTrigger>
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Twitter">Twitter</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profileLink">Profile Link</Label>
            <Input
              id="profileLink"
              name="profileLink"
              value={newAccount.profileLink}
              onChange={handleInputChange}
              placeholder="e.g., https://instagram.com/mybrand"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Image URL (Optional)</Label>
            <Input
              id="image"
              name="image"
              value={newAccount.image}
              onChange={handleInputChange}
              placeholder="e.g., https://example.com/profile.jpg"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={newAccount.active}
              onCheckedChange={handleToggleChange}
            />
            <Label htmlFor="active">Active</Label>
          </div>
          <Button onClick={addAccount}>Add Account</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Social Media Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">
              No social media accounts added yet.
            </p>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-md border p-4"
                >
                  <div className="flex items-center space-x-4">
                    {account.image && (
                      <img
                        src={account.image}
                        alt={account.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {account.title} - {account.userName}
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
                  <Switch checked={account.active} disabled />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
