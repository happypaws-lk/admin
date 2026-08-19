"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop";
import {
  Check,
  AlertCircle,
  Lock,
  Mail,
  Camera,
  ImageIcon,
  Loader2,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";
import { apiClient, ApiError } from "@/lib/api";
import type { UserProfileResponse } from "@/lib/types";
import { getAvatarUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas context unavailable")); return; }
      ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height,
      );
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      }, "image/jpeg", 0.92);
    });
    image.addEventListener("error", reject);
    image.src = imageSrc;
  });
}

export default function SettingsPage() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    apiClient
      .get<UserProfileResponse>("/api/v1/users/me")
      .then((p) => {
        setProfile(p);
        setName(p.name ?? "");
        if (p.avatarUrl) setAvatarPreview(p.avatarUrl);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setRawImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCropModalOpen(true);
    });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    try {
      const blob = await getCroppedBlob(rawImageSrc, croppedAreaPixels);
      const preview = URL.createObjectURL(blob);
      setAvatarPreview(preview);
      setCroppedBlob(blob);
      setCropModalOpen(false);
      setRawImageSrc(null);
    } catch {
      // ignore crop errors
    }
  };

  const handleCancelCrop = () => {
    setCropModalOpen(false);
    setRawImageSrc(null);
  };

  const handleDeleteAvatar = async () => {
    setProfileError(null);
    try {
      if (profile?.avatarUrl) {
        await apiClient.delete("/api/v1/users/me/avatar");
        setProfile((prev) => (prev ? { ...prev, avatarUrl: null } : null));
        setAvatarPreview(null);
        setCroppedBlob(null);
        setProfileSuccess(true);
        await refreshUser();
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setCroppedBlob(null);
        setAvatarPreview(null);
      }
    } catch (err) {
      setProfileError(
        err instanceof ApiError ? err.title : "Failed to remove avatar.",
      );
    } finally {
      setDeleteConfirmOpen(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    try {
      const formData = new FormData();
      if (croppedBlob) {
        formData.append("avatar", croppedBlob, "avatar.jpg");
      }
      const updated = await apiClient.putForm<UserProfileResponse>(
        "/api/v1/users/me",
        formData,
        { name: name.trim() || undefined },
      );
      setProfile(updated);
      setName(updated.name);
      if (updated.avatarUrl) {
        setAvatarPreview(updated.avatarUrl);
      }
      setCroppedBlob(null);
      setProfileSuccess(true);
      await refreshUser();
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(
        err instanceof ApiError ? err.title : "Failed to save profile.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setPasswordSaving(true);
    try {
      await apiClient.post("/api/v1/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof ApiError ? err.title : "Failed to update password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const displayName = name || profile?.name || "Administrator";
  const email = profile?.email ?? "";

  return (
    <div className="min-h-full space-y-8 p-6 lg:p-8 max-w-6xl mx-auto">
      {/* ── Page Header ── */}
      <div className="border-b border-zinc-800/80 pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 mb-1">Account Settings</h1>
        <p className="text-sm text-zinc-400">
          Manage your administrator identity and security preferences.
        </p>
      </div>

      {/* ── Crop Modal ── */}
      {cropModalOpen && rawImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-100">Crop Profile Photo</h3>
              <button
                type="button"
                onClick={handleCancelCrop}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative h-72 bg-zinc-950">
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="px-5 py-4 space-y-3 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancelCrop}
                  className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyCrop}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Apply Crop
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile Section ── */}
      <Card className="max-w-2xl bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Update your administrator name and profile photo.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-6">
            {profileLoading ? (
              <div className="flex items-center gap-3 text-zinc-500 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading profile…
              </div>
            ) : null}

            {profileSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Profile updated successfully!
              </div>
            )}

            {profileError && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {profileError}
              </div>
            )}

            {/* ── Avatar Upload ── */}
            <div className="flex items-center gap-5 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
              <div className="relative group">
                <Avatar className="w-20 h-20 border-2 border-indigo-500/40 shadow-md">
                  {avatarPreview ? (
                    <AvatarImage src={getAvatarUrl(avatarPreview)} alt={displayName} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-xl font-bold bg-zinc-800 text-zinc-100">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                {avatarPreview ? (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(true)}
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-rose-400 hover:text-rose-300 cursor-pointer"
                    title="Remove Photo"
                    aria-label="Remove Photo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer"
                    title="Upload Photo"
                    aria-label="Upload Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-zinc-200 block">Profile Avatar</span>
                <p className="text-[11px] text-zinc-400">PNG, JPG, or WEBP · Max 5 MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFileSelected}
                />
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200 text-xs h-7 gap-1.5"
                  >
                    <ImageIcon className="w-3 h-3" /> Select Photo
                  </Button>
                  {croppedBlob && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCroppedBlob(null);
                        setAvatarPreview(profile?.avatarUrl ?? null);
                      }}
                      className="text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs h-7"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Name ── */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-name" className="text-xs font-semibold text-zinc-300">
                Full Name
              </Label>
              <Input
                id="admin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={profileLoading}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs focus-visible:ring-indigo-500"
              />
            </div>

            {/* ── Email (read-only) ── */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-email" className="text-xs font-semibold text-zinc-300">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="admin-email"
                  value={email}
                  disabled
                  className="bg-zinc-900/60 border-zinc-800/80 text-zinc-400 text-xs pr-10 cursor-not-allowed font-mono"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[11px] text-zinc-500">
                Email is managed by HappyPaws Auth and cannot be changed here.
              </p>
            </div>
          </CardContent>

          <CardFooter className="border-t border-zinc-800/80 pt-4 flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={profileSaving || profileLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs gap-1.5 min-w-[110px]"
            >
              {profileSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ── Security Section ── */}
      <Card className="max-w-2xl bg-[#121215] border-zinc-800 text-zinc-100 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-400" /> Password & Security
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400">
            Update your account password securely.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSavePassword}>
          <CardContent className="space-y-5">
            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                Password changed successfully!
              </div>
            )}
            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passwordError}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="current-pass" className="text-xs font-semibold text-zinc-300">
                Current Password
              </Label>
              <Input
                id="current-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs focus-visible:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="new-pass" className="text-xs font-semibold text-zinc-300">
                New Password
              </Label>
              <Input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs focus-visible:ring-indigo-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirm-pass" className="text-xs font-semibold text-zinc-300">
                Confirm New Password
              </Label>
              <Input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-100 text-xs focus-visible:ring-indigo-500"
              />
            </div>
          </CardContent>

          <CardFooter className="border-t border-zinc-800/80 pt-4 flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={passwordSaving}
              className="bg-zinc-700 hover:bg-zinc-600 text-white font-medium text-xs gap-1.5 min-w-[130px]"
            >
              {passwordSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              Update Password
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* ── Remove Avatar Confirmation Modal ── */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Remove Profile Photo"
        description="Are you sure you want to remove your profile photo? Your avatar will revert to your name initials."
        confirmLabel="Remove Photo"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDeleteAvatar}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}
