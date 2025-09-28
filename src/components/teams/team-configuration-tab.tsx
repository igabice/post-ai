"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/app-provider";
import { SocialMediaAccount } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Pencil,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Music,
} from "lucide-react";
import Image from "next/image"; // Assuming Image component is used for icons
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs
import { updateTeamSocialMediaAccounts } from "@/services/teams";
import ReactImagePickerEditor, {
  ImagePickerConf,
} from "react-image-picker-editor";
import "react-image-picker-editor/dist/index.css";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SocialMediaAccountItem } from "./social-media-account-item";

const formSchema = z.object({
  name: z.string().min(1, { message: "Account Name is required." }),
  userName: z.string().min(1, { message: "Username/Handle is required." }),
  title: z.string().min(1, { message: "Platform is required." }),
  image: z.string().default(""),
  profileLink: z
    .string()
    .url({ message: "Invalid URL." })
    .optional()
    .or(z.literal("")),
  active: z.boolean().default(true),
});

type SocialMediaFormValues = z.infer<typeof formSchema>;

export function TeamConfigurationTab() {
  const { activeTeam, updateTeam, user } = useApp();
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<
    SocialMediaAccount[]
  >([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<SocialMediaAccount | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const { toast } = useToast();

  const form = useForm<SocialMediaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      userName: "",
      title: "",
      image: "",
      profileLink: "",
      active: true,
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = form;

  const isAdmin = user && activeTeam?.members[user.uid]?.permissions.isAdmin;

  useEffect(() => {
    if (activeTeam?.socialMediaAccounts) {
      setSocialMediaAccounts(activeTeam.socialMediaAccounts);
    }
  }, [activeTeam]);

  useEffect(() => {
    if (isAddEditDialogOpen && editingAccount) {
      reset({
        name: editingAccount.name,
        userName: editingAccount.userName,
        title: editingAccount.title,
        image: editingAccount.image || "",
        profileLink: editingAccount.profileLink,
        active: editingAccount.active,
      });
    } else if (!isAddEditDialogOpen) {
      reset({
        name: "",
        userName: "",
        title: "",
        image: "",
        profileLink: "",
        active: true,
      });
    }
  }, [isAddEditDialogOpen, editingAccount, reset]);

  const handleAddAccountClick = () => {
    setEditingAccount(null);
    setIsAddEditDialogOpen(true);
  };

  const handleEditAccountClick = (account: SocialMediaAccount) => {
    setEditingAccount(account);
    setIsAddEditDialogOpen(true);
  };

  const confirmDeleteAccount = (accountId: string) => {
    setAccountToDelete(accountId);
    setIsDeleteDialogOpen(true);
  };

  const onSubmit = async (values: SocialMediaFormValues) => {
    if (!activeTeam) return;

    const newAccount: SocialMediaAccount = {
      id: editingAccount?.id || uuidv4(),
      ...values,
    };

    let updatedAccounts: SocialMediaAccount[];
    if (editingAccount) {
      updatedAccounts = socialMediaAccounts.map((acc) =>
        acc.id === newAccount.id ? newAccount : acc
      );
    } else {
      updatedAccounts = [...socialMediaAccounts, newAccount];
    }

    try {
      await updateTeamSocialMediaAccounts(activeTeam.id, updatedAccounts);
      setSocialMediaAccounts(updatedAccounts);
      updateTeam(activeTeam.id, { socialMediaAccounts: updatedAccounts }); // Update global context
      toast({ title: "Success", description: "Social media account saved." });
      setIsAddEditDialogOpen(false);
    } catch (error) {
      console.error("Error saving social media account:", error);
      toast({
        title: "Error",
        description: "Failed to save social media account.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!activeTeam) return;

    const updatedAccounts = socialMediaAccounts.filter(
      (acc) => acc.id !== accountToDelete
    );

    try {
      await updateTeamSocialMediaAccounts(activeTeam.id, updatedAccounts);
      setSocialMediaAccounts(updatedAccounts);
      updateTeam(activeTeam.id, { socialMediaAccounts: updatedAccounts }); // Update global context
      toast({ title: "Success", description: "Social media account deleted." });
      setIsDeleteDialogOpen(false);
      setAccountToDelete(null);
    } catch (error) {
      console.error("Error deleting social media account:", error);
      toast({
        title: "Error",
        description: "Failed to delete social media account.",
        variant: "destructive",
      });
    }
  };

  const imagePickerConfig: ImagePickerConf = {
    borderRadius: "4px",
    language: "en",
    width: "100%",
    height: "150px",
    objectFit: "contain",
    compressInitial: null,
    darkMode: false,
    rtl: false,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Social Media Accounts</CardTitle>
        <Button onClick={handleAddAccountClick}>
          <Plus className="mr-2 h-4 w-4" /> Add Account
        </Button>
      </CardHeader>
      <CardContent>
        {socialMediaAccounts.length === 0 ? (
          <p className="text-muted-foreground">
            No social media accounts configured yet.
          </p>
        ) : (
          <div className="space-y-4">
            {socialMediaAccounts.map((account) => (
              <SocialMediaAccountItem
                key={account.id}
                account={account}
                onEdit={handleEditAccountClick}
                onDelete={confirmDeleteAccount}
                isAdmin={!!isAdmin}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isAddEditDialogOpen} onOpenChange={setIsAddEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAccount
                ? "Edit Social Media Account"
                : "Add Social Media Account"}
            </DialogTitle>
            <DialogDescription>
              {editingAccount
                ? "Edit the details of your social media account."
                : "Add a new social media account for your team."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Account Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Username/Handle</Label>
              <Input id="userName" {...register("userName")} />
              {errors.userName && (
                <p className="text-red-500 text-sm">
                  {errors.userName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Platform</Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Instagram">
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" /> Instagram
                        </div>
                      </SelectItem>
                      <SelectItem value="Twitter">
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4" /> Twitter
                        </div>
                      </SelectItem>
                      <SelectItem value="Facebook">
                        <div className="flex items-center gap-2">
                          <Facebook className="h-4 w-4" /> Facebook
                        </div>
                      </SelectItem>
                      <SelectItem value="LinkedIn">
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4" /> LinkedIn
                        </div>
                      </SelectItem>
                      <SelectItem value="TikTok">
                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4" /> TikTok
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profileLink">Profile Link</Label>
              <Input id="profileLink" {...register("profileLink")} />
              {errors.profileLink && (
                <p className="text-red-500 text-sm">
                  {errors.profileLink.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Profile Image</Label>
              <Controller
                name="image"
                control={control}
                render={({ field }) => (
                  <ReactImagePickerEditor
                    config={imagePickerConfig}
                    imageSrcProp={field.value}
                    imageChanged={(newDataUri: string | null) => {
                      field.onChange(newDataUri || "");
                    }}
                  />
                )}
              />
              {errors.image && (
                <p className="text-red-500 text-sm">{errors.image.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active" className="flex-1">
                Active
              </Label>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddEditDialogOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit">Save Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              social media account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
