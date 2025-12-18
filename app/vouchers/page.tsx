"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateVoucherDialog } from "./components/CreateVoucherDialog";
import { VoucherCard } from "./components/VoucherCard";

interface Voucher {
  id: number;
  referencia: string;
  validadeMeses: number;
  valor: number;
  criadoEm: string;
  descricao: string | null;
  observacoes: string | null;
  usado: boolean;
  usadoEm: string | null;
  utente: {
    id: number;
    nomeCompleto: string;
    email: string | null;
  };
  criadoPor: {
    id: string;
    name: string;
    email: string;
  };
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vouchers");
      if (response.ok) {
        const data = await response.json();
        setVouchers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchVouchers();
  };

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden max-w-full w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-dark">Vouchers</h1>
          <p className="text-text-light mt-1 md:mt-2 text-sm md:text-base">Gerencie os vouchers dos utentes</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Criar Voucher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Vouchers</CardTitle>
              <CardDescription>
                {loading
                  ? "A carregar..."
                  : `${vouchers.length} ${vouchers.length === 1 ? "voucher cadastrado" : "vouchers cadastrados"}`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">A carregar vouchers...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">Nenhum voucher cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  onUpdate={fetchVouchers}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateVoucherDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
