"use client";

import { useState, useRef, use } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUpdateProfileWithFiles } from "@/hooks/profile/useProfile";
import {
  PublicProfileResponse,
  UpdateProfileRequest,
} from "@/lib/api/services/profile";
import { Camera, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks";

// Form validation schema
const profileEditSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  middleName: z.string().max(50, "Middle name too long").optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PublicProfileResponse;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  profile,
}: ProfileEditModalProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();

  const { mutate: updateProfile, isPending } = useUpdateProfileWithFiles(
    user?.id
  );

  const form = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      firstName: profile.user.firstName || "",
      middleName: profile.user.middleName || "",
      lastName: profile.user.lastName || "",
      bio: profile.user.bio || "",
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ProfileEditFormData) => {
    const files: { avatar?: File; cover?: File } = {};
    if (avatarFile) files.avatar = avatarFile;
    if (coverFile) files.cover = coverFile;

    updateProfile(
      { profileData: data, files },
      {
        onSuccess: () => {
          onClose();
          // Reset form and files
          form.reset();
          setAvatarPreview(null);
          setCoverPreview(null);
          setAvatarFile(null);
          setCoverFile(null);
        },
      }
    );
  };

  const handleClose = () => {
    onClose();
    form.reset();
    setAvatarPreview(null);
    setCoverPreview(null);
    setAvatarFile(null);
    setCoverFile(null);
  };

  // Generate user initials for avatar fallback
  const initials = [profile.user.firstName, profile.user.lastName]
    .filter(Boolean)
    .map((name) => name!.charAt(0).toUpperCase())
    .join("");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Cover Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Cover Image
              </label>
              <div className="relative">
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  ) : profile.user.coverImageUrl ? (
                    <img
                      src={profile.user.coverImageUrl}
                      alt="Current cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/80 to-purple-600/80" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Change
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            </div>

            {/* Avatar */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={avatarPreview || profile.user.avatarUrl}
                      alt="Profile picture"
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute -bottom-1 -right-1"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Picture
                  </Button>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: Square image, at least 200x200px
                  </p>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter first name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter last name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter middle name (optional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Tell others about yourself..."
                      className="resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    {field.value?.length || 0}/500 characters
                  </p>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileEditModal;
