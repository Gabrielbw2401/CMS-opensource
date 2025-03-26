import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { LogOut, Settings, User, Menu, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">CV</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">CMS Visuel</span>
          </Link>
        </div>

        {/* Navigation desktop */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Tableau de bord</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Menu utilisateur</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuLabel>{user?.nom}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer flex w-full">
                      <span>Tableau de bord</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings/profile" className="cursor-pointer flex w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Connexion</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login">Commencer</Link>
              </Button>
            </>
          )}
        </div>

        {/* Navigation mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full py-6">
                <div className="flex items-center mb-8">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">CV</span>
                  </div>
                  <span className="font-bold text-xl ml-2">CMS Visuel</span>
                </div>
                
                <nav className="flex flex-col space-y-4">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        to="/dashboard" 
                        className="px-2 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        Tableau de bord
                      </Link>
                      <Link 
                        to="/settings/profile" 
                        className="px-2 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        Paramètres
                      </Link>
                      <button 
                        onClick={logout}
                        className="px-2 py-2 rounded-md hover:bg-muted transition-colors text-left flex items-center"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="px-2 py-2 rounded-md hover:bg-muted transition-colors"
                      >
                        Connexion
                      </Link>
                      <Button asChild className="mt-2">
                        <Link to="/login">Commencer</Link>
                      </Button>
                    </>
                  )}
                </nav>
                
                <div className="mt-auto">
                  {isAuthenticated && user && (
                    <div className="flex items-center p-4 bg-muted rounded-md">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{user.nom}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}