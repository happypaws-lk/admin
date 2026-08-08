"use client";

import { useState } from "react";
import { User } from "lucide-react";
import type { MeResponse } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: MeResponse | null;
  profileName: string;
  onSaveName: (newName: string) => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
  user,
  profileName,
  onSaveName,
}: ProfileSettingsModalProps) {
  const [nameInput, setNameInput] = useState(profileName);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveName(nameInput.trim() || "Admin User");
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <DialogTitle>Profile &amp; Preferences</DialogTitle>
              <DialogDescription>Manage your administrative account settings</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave}>
          <div className="px-6 py-5 space-y-5">
            {isSaved && (
              <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium flex items-center gap-2">
                ✓ Profile preferences updated successfully!
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="display-name" className="text-xs font-medium text-muted-foreground">Display Name</Label>
              <Input
                id="display-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. System Administrator"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  disabled
                  value={user?.email || "admin@happypaws.lk"}
                  className="pr-20 cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                  Verified
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Assigned Role</Label>
              <div className="flex gap-2">
                {(user?.roles ?? ["Admin"]).map((role) => (
                  <span
                    key={role}
                    className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-semibold"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-3">
              {[
                {
                  id: "emailAlerts",
                  state: emailAlerts,
                  setState: setEmailAlerts,
                  title: "Email Digest & System Alerts",
                  desc: "Receive critical notifications via email",
                },
                {
                  id: "securityAlerts",
                  state: securityAlerts,
                  setState: setSecurityAlerts,
                  title: "Security Log Notifications",
                  desc: "Notify on unusual login attempts",
                },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-foreground">{pref.title}</p>
                    <p className="text-[11px] text-muted-foreground">{pref.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => pref.setState(!pref.state)}
                    className={`w-10 h-5.5 rounded-full transition-colors relative p-0.5 shrink-0 ${
                      pref.state ? "bg-primary" : "bg-muted"
                    }`}
                    style={{ height: "22px", width: "40px" }}
                  >
                    <div
                      className={`w-[18px] h-[18px] rounded-full bg-white transition-transform ${
                        pref.state ? "translate-x-[18px]" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
