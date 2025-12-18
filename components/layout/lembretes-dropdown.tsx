"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Trash2, Clock, Mail, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/ui/time-picker";

interface Lembrete {
  id: number;
  titulo: string;
  descricao: string | null;
  dataHora: string;
  notificacao: string;
  antecedencia: number;
  enviado: boolean;
  criador: {
    id: string;
    name: string;
    email: string;
  };
  destino: {
    id: string;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function LembretesDropdown() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lembreteToDelete, setLembreteToDelete] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    dataHora: new Date(),
    hora: "",
    notificacao: "app",
    antecedencia: 60,
    targetId: undefined as string | undefined,
  });

  useEffect(() => {
    fetchLembretes();
    fetchUsers();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchLembretes, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLembretes = async () => {
    try {
      const response = await fetch("/api/lembretes?apenasNaoEnviados=true");
      if (response.ok) {
        const data = await response.json();
        setLembretes(data);
      }
    } catch (error) {
      console.error("Erro ao buscar lembretes:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/usuarios");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleCreateLembrete = async () => {
    if (!formData.titulo || !formData.targetId || !formData.dataHora || !formData.hora) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setCreating(true);
    try {
      // Combinar data e hora
      const [hours, minutes] = formData.hora.split(":");
      if (!hours || !minutes) {
        alert("Por favor, insira uma hora válida");
        setCreating(false);
        return;
      }
      const dataHora = new Date(formData.dataHora);
      dataHora.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const response = await fetch("/api/lembretes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo: formData.titulo,
          descricao: formData.descricao || null,
          dataHora: dataHora.toISOString(),
          notificacao: formData.notificacao,
          antecedencia: formData.antecedencia,
          targetId: formData.targetId,
        }),
      });

      if (response.ok) {
        await fetchLembretes();
        setCreateDialogOpen(false);
        // Reset form
        setFormData({
          titulo: "",
          descricao: "",
          dataHora: new Date(),
          hora: "",
          notificacao: "app",
          antecedencia: 60,
          targetId: "",
        });
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao criar lembrete");
      }
    } catch (error) {
      console.error("Erro ao criar lembrete:", error);
      alert("Erro ao criar lembrete");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLembrete = (id: number) => {
    setLembreteToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteLembrete = async () => {
    if (!lembreteToDelete) return;

    try {
      const response = await fetch(`/api/lembretes/${lembreteToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchLembretes();
        toast({
          variant: "success",
          title: "Lembrete apagado",
          description: "O lembrete foi apagado com sucesso.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao apagar lembrete",
          description: "Ocorreu um erro ao apagar o lembrete. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao apagar lembrete:", error);
      toast({
        variant: "destructive",
        title: "Erro ao apagar lembrete",
        description: "Ocorreu um erro ao apagar o lembrete. Tente novamente.",
      });
    } finally {
      setLembreteToDelete(null);
    }
  };

  const lembretesNaoEnviados = lembretes.filter((l) => !l.enviado);

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 md:h-6 md:w-6" />
            {lembretesNaoEnviados.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {lembretesNaoEnviados.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Lembretes</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setCreateDialogOpen(true);
              }}
              className="h-7 px-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Criar
            </Button>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {loading ? (
            <div className="p-4 text-center text-sm text-text-light">
              A carregar...
            </div>
          ) : lembretesNaoEnviados.length === 0 ? (
            <div className="p-4 text-center text-sm text-text-light">
              Nenhum lembrete ativo
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {lembretesNaoEnviados.map((lembrete) => (
                <div key={lembrete.id} className="p-3 border-b last:border-b-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-text-dark truncate">
                        {lembrete.titulo}
                      </p>
                      {lembrete.descricao && (
                        <p className="text-xs text-text-light mt-1 line-clamp-2">
                          {lembrete.descricao}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-text-light" />
                        <span className="text-xs text-text-light">
                          {format(new Date(lembrete.dataHora), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                        {lembrete.notificacao === "email" ? (
                          <Mail className="w-3 h-3 text-text-light" />
                        ) : (
                          <Smartphone className="w-3 h-3 text-text-light" />
                        )}
                      </div>
                      {lembrete.antecedencia > 0 && (
                        <p className="text-xs text-text-light mt-1">
                          Notificar {lembrete.antecedencia} min antes
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => handleDeleteLembrete(lembrete.id)}
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Criar Lembrete */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="px-4 py-4 md:px-0 md:py-0">
            <DialogHeader>
              <DialogTitle>Criar Lembrete</DialogTitle>
              <DialogDescription>
                Crie um lembrete para você ou outro utilizador
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="titulo">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, titulo: e.target.value }))
                }
                placeholder="Ex: Reunião importante"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, descricao: e.target.value }))
                }
                placeholder="Detalhes adicionais..."
                className="mt-1 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>
                  Data <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full mt-1 justify-start text-left font-normal",
                        !formData.dataHora && "text-text-light"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataHora ? (
                        format(formData.dataHora, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dataHora}
                      onSelect={(date) =>
                        date && setFormData((prev) => ({ ...prev, dataHora: date }))
                      }
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="hora">
                  Hora <span className="text-red-500">*</span>
                </Label>
                <div className="mt-1">
                  <TimePicker
                    value={formData.hora}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, hora: value }))
                    }
                    label="Selecionar hora"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>
                Utilizador Alvo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.targetId || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, targetId: value || undefined }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o utilizador" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Notificar por</Label>
              <Select
                value={formData.notificacao}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, notificacao: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="app">App (In-app)</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Antecedência</Label>
              <Select
                value={formData.antecedencia.toString()}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    antecedencia: parseInt(value),
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={creating}
                className="w-full md:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateLembrete}
                disabled={creating}
                className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white"
              >
                {creating ? "A guardar..." : "Guardar"}
              </Button>
            </div>
          </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="px-4 py-4 md:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja apagar este lembrete? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col md:flex-row gap-2">
            <AlertDialogCancel onClick={() => setLembreteToDelete(null)} className="w-full md:w-auto order-2 md:order-1">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteLembrete}
              className="bg-red-600 hover:bg-red-700 w-full md:w-auto order-1 md:order-2"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
