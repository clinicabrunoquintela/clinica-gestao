"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Search, User, LogOut, Shield, CalendarPlus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { AniversariosPopover } from "./aniversarios-popover";
import { LembretesDropdown } from "./lembretes-dropdown";
import { AdicionarMarcacaoDialog } from "./adicionar-marcacao-dialog";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { data: session } = useSession();
  const [marcacaoDialogOpen, setMarcacaoDialogOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <div className="h-20 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shadow-sm sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)] md:pt-0 min-h-[calc(5rem+env(safe-area-inset-top,0px))] md:min-h-20">
        <div className="flex items-center gap-4">
          {/* Botão hambúrguer - mobile only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {session && (
            <span className="hidden md:block text-[22px] font-semibold text-gray-800 leading-none">
              Bem-vindo, {session.user?.name}
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-4 md:gap-6">
          <Button variant="ghost" size="icon" className="relative">
            <Search className="h-5 w-5 md:h-6 md:w-6" />
          </Button>

          <AniversariosPopover />

          <LembretesDropdown />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMarcacaoDialogOpen(true)}
            title="Adicionar Marcação"
            className="text-orange-500 hover:text-orange-600 bg-orange-100 rounded-full"
          >
            <CalendarPlus className="h-5 w-5 md:h-6 md:w-6" />
          </Button>

          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-4 md:ml-6">
                  <User className="h-5 w-5 md:h-6 md:w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-lg shadow-lg">
                <DropdownMenuLabel className="px-5 py-5">
                  <div className="flex flex-col space-y-3">
                    <span className="font-bold text-base leading-tight">{session.user?.name}</span>
                    <span className="text-sm leading-tight" style={{ color: "#6b7280" }}>
                      {session.user?.email}
                    </span>
                    <span className="text-xs mt-1">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          session.user?.role === "ADMIN"
                            ? "bg-primary text-white"
                            : "bg-accent text-text-dark"
                        }`}
                      >
                        {session.user?.role}
                      </span>
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                {session.user?.role === "ADMIN" && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin/usuarios"
                        className="flex items-center cursor-pointer px-5 py-3.5 text-base min-h-[48px]"
                      >
                        <Shield className="w-5 h-5 mr-3 flex-shrink-0" />
                        Gestão de Funcionários
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-red-600 px-5 py-3.5 text-base min-h-[48px]"
                >
                  <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AdicionarMarcacaoDialog
        open={marcacaoDialogOpen}
        onOpenChange={setMarcacaoDialogOpen}
      />
    </>
  );
}

