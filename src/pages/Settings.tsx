import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Settings as SettingsIcon, 
  Mail, 
  Phone, 
  Trash2, 
  Loader2, 
  UserCircle 
} from "lucide-react";
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

const Settings = () => {
  const { user, loginState, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) {
    return (
      <div className="container py-24 text-center">
        <div className="mx-auto max-w-md glass-card p-12 glow-border">
           <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
           <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
           <p className="text-muted-foreground">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      contactNumber: formData.get("contactNumber") as string,
      alternateEmail: formData.get("alternateEmail") as string,
    };

    try {
      const res = await fetchApi("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (res.status === "success") {
        // Update local context
        const token = localStorage.getItem("token") || "";
        loginState(token, res.data.user);
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await fetchApi("/auth/me", {
        method: "DELETE",
      });

      // DELETE usually returns 204 No Content, our fetchApi returns data if present.
      // But if it was successful, we should just logout.
      logout();
      toast.success("Account deleted successfully. We're sorry to see you go.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl opacity-0 animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your profile and account preferences.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_300px]">
        {/* Profile Section */}
        <div className="space-y-6">
          <div className="glass-card gradient-border p-8 glow-blue">
            <div className="mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    defaultValue={user.name} 
                    required 
                    placeholder="John Doe" 
                    className="bg-secondary/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Primary Email (Read-only)</Label>
                  <div className="relative">
                    <Input 
                      id="email" 
                      defaultValue={user.email} 
                      disabled 
                      className="bg-secondary/10 border-dashed opacity-70"
                    />
                    <Mail className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <div className="relative">
                    <Input 
                      id="contactNumber" 
                      name="contactNumber" 
                      defaultValue={user.contactNumber} 
                      required 
                      placeholder="9876543210" 
                      className="bg-secondary/30 pl-9"
                    />
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternateEmail">Alternate Email</Label>
                  <Input 
                    id="alternateEmail" 
                    name="alternateEmail" 
                    defaultValue={user.alternateEmail || ""} 
                    placeholder="backup@example.com" 
                    className="bg-secondary/30"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="h-11 px-8" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {isLoading ? "Saving Changes..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="glass-card border-loss/20 p-8 glow-red bg-loss/5">
            <div className="mb-4 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-loss" />
              <h2 className="text-xl font-semibold text-loss">Danger Zone</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Permanently delete your account and all of your data. This action is irreversible and you will lose your virtual balance and trade history.
            </p>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-loss text-loss hover:bg-loss hover:text-white transition-all">
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-loss">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    className="bg-loss text-white hover:bg-loss/90"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 border-border/40 bg-secondary/20">
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Virtual Balance</p>
                <p className="text-xl font-bold text-primary">₹{user.balance?.toLocaleString('en-IN') || '0'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Account Status</p>
                <p className="text-sm font-medium flex items-center gap-1.5 text-profit">
                  <span className="h-2 w-2 rounded-full bg-profit animate-pulse" /> Verified
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-border/40 bg-secondary/20 border-dashed">
            <h3 className="font-semibold mb-2 text-sm">Need Help?</h3>
            <p className="text-xs text-muted-foreground mb-4">
              If you have any questions or need technical support, our team is here to help.
            </p>
            <Button variant="link" className="p-0 h-auto text-xs text-primary">Contact Support</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
