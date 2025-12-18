"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Save, X } from "lucide-react";

interface Cliente {
  id: number;
  nomeCompleto: string;
  telemovel?: string | null;
  email?: string | null;
}

interface CreateVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateVoucherDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateVoucherDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [referencia, setReferencia] = useState("");
  const [utenteId, setUtenteId] = useState<number | undefined>(undefined);
  const [validadeMeses, setValidadeMeses] = useState<string | undefined>(undefined);
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (open) {
      fetchClientes();
      // Gerar referência ao abrir o dialog
      gerarReferencia();
    } else {
      // Reset form quando fecha
      setUtenteId(undefined);
      setValidadeMeses(undefined);
      setValor("");
      setDescricao("");
      setObservacoes("");
      setReferencia("");
    }
  }, [open]);

  const fetchClientes = async () => {
    try {
      setLoadingClientes(true);
      const response = await fetch("/api/clientes");
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar utentes:", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const gerarReferencia = async () => {
    try {
      // A referência será gerada no backend, mas podemos mostrar um placeholder
      setReferencia("A gerar...");
    } catch (error) {
      console.error("Erro ao gerar referência:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações
    if (!utenteId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione um utente",
      });
      setLoading(false);
      return;
    }

    if (!validadeMeses) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione a validade",
      });
      setLoading(false);
      return;
    }

    if (!valor || parseFloat(valor) < 0) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira um valor válido",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/vouchers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          utenteId,
          validadeMeses: parseInt(validadeMeses),
          valor: parseFloat(valor),
          descricao: descricao.trim() || null,
          observacoes: observacoes.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao criar voucher");
      }

      // Mostrar alerta de sucesso IMEDIATAMENTE após sucesso da API (ANTES de qualquer ação)
      console.log("ALERTA DISPARADO - Voucher criado");
      toast({
        variant: "success",
        title: "Voucher criado!",
        description: "O voucher foi criado com sucesso.",
      });

      // Reset form
      setUtenteId(undefined);
      setValidadeMeses("");
      setValor("");
      setDescricao("");
      setObservacoes("");
      setReferencia("");

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar voucher:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar voucher",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-4 md:px-0 md:py-0">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ color: "#F28C1D" }}>
              Criar Voucher
            </DialogTitle>
            <DialogDescription>
              Crie um novo voucher para um utente
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
            <div>
              <Label htmlFor="referencia" className="text-base font-semibold">
                Referência
              </Label>
              <Input
                id="referencia"
                value={referencia}
                disabled
                className="mt-2 bg-gray-50"
                placeholder="Será gerada automaticamente"
              />
              <p className="text-xs text-text-light mt-1">
                A referência será gerada automaticamente ao criar o voucher
              </p>
            </div>

            <div>
              <Label htmlFor="utente" className="text-base font-semibold">
                Utente <span className="text-primary">*</span>
              </Label>
              {loadingClientes ? (
                <div className="mt-2 p-3 border border-border rounded-md text-sm text-text-light">
                  A carregar utentes...
                </div>
              ) : (
                <div className="mt-2 w-full">
                  <SearchableSelect
                    variant="utente"
                    options={clientes.map((c) => ({
                      value: c.id,
                      label: `${c.nomeCompleto} — ${c.telemovel || "sem telefone"}`,
                    }))}
                    value={utenteId}
                    onChange={(val) => setUtenteId(val as number | undefined)}
                    placeholder="Selecione um utente..."
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validade" className="text-base font-semibold">
                  Validade (meses) <span className="text-primary">*</span>
                </Label>
                <Select
                  value={validadeMeses || ""}
                  onValueChange={(val) => setValidadeMeses(val || undefined)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione a validade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meses</SelectItem>
                    <SelectItem value="6">6 meses</SelectItem>
                    <SelectItem value="9">9 meses</SelectItem>
                    <SelectItem value="12">12 meses</SelectItem>
                    <SelectItem value="15">15 meses</SelectItem>
                    <SelectItem value="18">18 meses</SelectItem>
                    <SelectItem value="21">21 meses</SelectItem>
                    <SelectItem value="24">24 meses</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor" className="text-base font-semibold">
                  Valor (€) <span className="text-primary">*</span>
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0.00"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição para quem recebe</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Mensagem personalizada para o utente..."
                className="mt-2 min-h-[80px] break-words"
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações internas</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Notas internas sobre este voucher..."
                className="mt-2 min-h-[80px] break-words"
              />
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="w-full md:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? "A criar..." : "Criar Voucher"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
