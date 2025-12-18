"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays,
  Shield,
  Ticket,
  Clock,
  UserRoundSearch,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Utentes", href: "/clientes", icon: Users },
  { name: "Calendário", href: "/calendario", icon: CalendarDays },
  { name: "Calendário do Utente", href: "/calendario/utente", icon: UserRoundSearch },
  { name: "Vouchers", href: "/vouchers", icon: Ticket },
  { name: "Lista de Espera", href: "/lista-espera", icon: Clock },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data } = useSession();
  const isAdmin = data?.user?.role === "ADMIN";

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="w-64 h-full bg-gradient-to-b from-white to-purple-50 border-r border-border flex flex-col">
      {/* Logo e botão fechar (mobile only) */}
      <div className="relative flex flex-col items-center justify-center py-6 px-4">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden z-10"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
        <Image
          src="/logo.jpeg"
          alt="Logo"
          width={260}
          height={260}
          priority
          className="w-auto h-24 object-contain mx-auto"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "text-text-dark hover:bg-accent hover:text-text-dark"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin/usuarios"
            onClick={handleLinkClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mt-2",
              pathname === "/admin/usuarios"
                ? "bg-primary text-white"
                : "text-text-dark hover:bg-accent hover:text-text-dark"
            )}
          >
            <Shield className="w-5 h-5" />
            Gestão de Funcionários
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-text-light text-center">
          © {new Date().getFullYear()} Dr. Bruno Quintela
        </p>
      </div>
    </div>
  );
}

