import { User, Mail, Shield, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InfoCard from "@/components/dashboard/InfoCard";
import { getInitials, formatDate } from "@/lib/utils";
import type { UserData } from "@/lib/types";

interface ProfileTabProps {
  user: UserData;
};

export default function ProfileTab({ user }: ProfileTabProps) {
  const initials = getInitials(user.name);
  const memberSince = formatDate(user.createdAt);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Your Profile</CardTitle>
          <CardDescription>Your public identity and account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-20 h-20 ring-2 ring-primary/30 ring-offset-2 ring-offset-card shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground text-sm mt-0.5">{user.email}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Badge variant="success">Active</Badge>
                <Badge variant={user.role === "admin" ? "destructive" : "user"}>
                  {user.role === "admin" ? "Admin" : "User"}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">Free Plan</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard label="Full Name" value={user.name} icon={User} />
        <InfoCard label="Email Address" value={user.email} icon={Mail} />
        <InfoCard label="Account Role" value={user.role === "admin" ? "Administrator" : "Standard User"} icon={Shield} />
        <InfoCard label="Member Since" value={memberSince} icon={Clock} />
      </div>
    </div>
  );
};