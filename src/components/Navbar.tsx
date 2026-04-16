import { Link, useLocation } from "react-router-dom";
import { TrendingUp, BarChart3, Briefcase, LogOut, Wallet, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./AuthModal";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const links = [
    { to: "/", label: "Dashboard", icon: BarChart3 },
    { to: "/trades", label: "Trades", icon: TrendingUp },
    { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Trade<span className="gradient-text">Wide</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  pathname === to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
          
          <div className="h-6 w-px bg-border my-auto mx-2 hidden sm:block"></div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-full border border-border/50">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold tracking-tight">
                  ₹{typeof user.balance === 'number' ? user.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 }) : '0'}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-secondary/80 border border-border/50 transition-transform hover:scale-105">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email || 'user@tradewide.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to="/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-loss focus:bg-loss/10 focus:text-loss transition-colors">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <AuthModal />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
