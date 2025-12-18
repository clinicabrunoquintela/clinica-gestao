"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Shield, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
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

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "RECECIONISTA";
  createdAt: string;
}

export default function AdminUsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECECIONISTA" as "ADMIN" | "RECECIONISTA",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "ADMIN") {
      fetchUsuarios();
    }
  }, [status, session, router]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/usuarios");
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: Usuario) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "RECECIONISTA",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "RECECIONISTA",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser
        ? `/api/admin/usuarios/${editingUser.id}`
        : "/api/admin/usuarios";

      const method = editingUser ? "PUT" : "POST";

      const body: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.password) {
        body.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchUsuarios();
      } else {
        const error = await response.json();
        alert(error.error || "Erro ao salvar usuário");
      }
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      alert("Erro ao salvar usuário");
    }
  };

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/admin/usuarios/${userToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsuarios();
        toast({
          variant: "success",
          title: "Utilizador apagado",
          description: "O utilizador foi apagado com sucesso.",
        });
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Erro ao apagar utilizador",
          description: error.error || "Erro ao deletar usuário",
        });
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      toast({
        variant: "destructive",
        title: "Erro ao apagar utilizador",
        description: "Ocorreu um erro ao apagar o utilizador. Tente novamente.",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-light">A carregar...</p>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6 overflow-x-hidden max-w-full w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-dark">Gestão de Funcionários</h1>
          <p className="text-text-light mt-1 md:mt-2 text-sm md:text-base">Gerencie os funcionários do sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card className="overflow-x-hidden max-w-full w-full">
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {usuarios.length} {usuarios.length === 1 ? "usuário" : "usuários"} cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usuarios.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-text-light">Nenhum usuário cadastrado.</p>
            </div>
          ) : (
            <>
              {/* Versão Mobile - Cards */}
              <div className="block md:hidden space-y-4 overflow-x-hidden max-w-full w-full">
                {usuarios.map((usuario) => (
                  <div
                    key={usuario.id}
                    className="border border-border rounded-lg p-4 bg-white hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        {usuario.role === "ADMIN" ? (
                          <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-text-light flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base text-text-dark break-words">
                            {usuario.name}
                          </h3>
                          <p className="text-sm text-text-light break-words mt-1">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-3 py-1 rounded-full ${
                            usuario.role === "ADMIN"
                              ? "bg-primary text-white"
                              : "bg-accent text-text-dark"
                          }`}
                        >
                          {usuario.role}
                        </span>
                        <span className="text-xs text-text-light">
                          {format(new Date(usuario.createdAt), "PPP", { locale: ptBR })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(usuario)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(usuario.id)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Apagar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Versão Desktop - Tabela */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-semibold">Nome</th>
                      <th className="text-left p-4 text-sm font-semibold">Email</th>
                      <th className="text-left p-4 text-sm font-semibold">Role</th>
                      <th className="text-left p-4 text-sm font-semibold">Criado em</th>
                      <th className="text-right p-4 text-sm font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr
                        key={usuario.id}
                        className="border-b border-border hover:bg-accent/30"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {usuario.role === "ADMIN" ? (
                              <Shield className="w-4 h-4 text-primary" />
                            ) : (
                              <UserIcon className="w-4 h-4 text-text-light" />
                            )}
                            <span className="font-medium">{usuario.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-text-light">{usuario.email}</td>
                        <td className="p-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${
                              usuario.role === "ADMIN"
                                ? "bg-primary text-white"
                                : "bg-accent text-text-dark"
                            }`}
                          >
                            {usuario.role}
                          </span>
                        </td>
                        <td className="p-4 text-text-light text-sm">
                          {format(new Date(usuario.createdAt), "PPP", { locale: ptBR })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDialog(usuario)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(usuario.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <div className="px-4 py-4 md:px-0 md:py-0 overflow-x-hidden max-w-full w-full">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Atualize as informações do usuário"
                  : "Preencha os dados para criar um novo usuário"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">
                Password {editingUser && "(deixe em branco para manter)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required={!editingUser}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "ADMIN" | "RECECIONISTA") =>
                  setFormData({ ...formData, role: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECECIONISTA">Rececionista</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="w-full md:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full md:w-auto bg-primary hover:bg-primary-dark">
                {editingUser ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="px-4 py-4 md:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja apagar este utilizador? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col md:flex-row gap-2">
            <AlertDialogCancel onClick={() => setUserToDelete(null)} className="w-full md:w-auto order-2 md:order-1">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 w-full md:w-auto order-1 md:order-2"
            >
              Apagar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


