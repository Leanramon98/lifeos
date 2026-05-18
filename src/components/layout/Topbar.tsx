import { Menu } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

export function Topbar() {
  const { userData } = useAuth();
  
  return (
    <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
      <Sheet>
        <SheetTrigger asChild>
          <button className="p-2 -ml-2 text-foreground-secondary hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[240px]">
          <VisuallyHidden.Root>
            <SheetTitle>Menú principal</SheetTitle>
            <SheetDescription>Navegación de la aplicación</SheetDescription>
          </VisuallyHidden.Root>
          <Sidebar isMobile />
        </SheetContent>
      </Sheet>

      <Logo />

      <Avatar className="h-8 w-8">
        <AvatarImage src={userData?.avatarUrl || ""} alt={userData?.name || "User"} />
        <AvatarFallback className="bg-primary/20 text-primary text-xs">
          {userData?.name?.slice(0, 2).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
