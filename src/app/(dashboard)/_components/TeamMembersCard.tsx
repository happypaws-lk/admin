"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Viewer" | "Developer" | "Owner" | "Admin";
  initials: string;
}

const MEMBERS: TeamMember[] = [
  { id: "1", name: "Saman Fernando", email: "saman@happypaws.lk", role: "Owner", initials: "SF" },
  { id: "2", name: "Kasun Perera", email: "kasun@happypaws.lk", role: "Developer", initials: "KP" },
  { id: "3", name: "Dilini Silva", email: "dilini@happypaws.lk", role: "Admin", initials: "DS" },
];

export function TeamMembersCard() {
  return (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-white">Team Members</h3>
        <p className="text-xs text-zinc-400 mt-0.5">Invite your team members to collaborate.</p>
      </div>

      <div className="space-y-3">
        {MEMBERS.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-3 p-1.5 rounded-lg hover:bg-zinc-800/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-zinc-700">
                <AvatarFallback className="text-xs font-bold bg-zinc-800 text-zinc-100">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{member.name}</p>
                <p className="text-[11px] text-zinc-400 truncate">{member.email}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
                >
                  <span>{member.role}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 bg-[#121215] border-zinc-800 text-xs">
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800">Viewer</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800">Developer</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800">Admin</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
