"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import InputMask from "react-input-mask";
import { CalendarIcon, ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [simplified, setSimplified] = useState(false);
  const [dataNascimento, setDataNascimento] = useState<string>("");
  const [calendarValue, setCalendarValue] = useState<Date | undefined>(undefined);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  
  const [dataCertificado, setDataCertificado] = useState<string>("");
  const [dataCertificadoDate, setDataCertificadoDate] = useState<Date | undefined>(undefined);
  const [dataCertificadoMonth, setDataCertificadoMonth] = useState<Date>(new Date());
  
  const [dataCertificadoTestagem, setDataCertificadoTestagem] = useState<string>("");
  const [dataCertificadoTestagemDate, setDataCertificadoTestagemDate] = useState<Date | undefined>(undefined);
  const [dataCertificadoTestagemMonth, setDataCertificadoTestagemMonth] = useState<Date>(new Date());
  
  const [dataCertificadoRecuperacao, setDataCertificadoRecuperacao] = useState<string>("");
  const [dataCertificadoRecuperacaoDate, setDataCertificadoRecuperacaoDate] = useState<Date | undefined>(undefined);
  const [dataCertificadoRecuperacaoMonth, setDataCertificadoRecuperacaoMonth] = useState<Date>(new Date());

  const [formData, setFormData] = useState({
    // Identificação
    nomeCompleto: "",
    numeroBI: "",
    numeroBeneficiario: "",
    nif: "",
    sistemaSubsistema: undefined as string | undefined,
    numeroEntidade: "",
    medicoAssistente: "",
    niss: "",
    // Dados Pessoais
    genero: undefined as string | undefined,
    estadoCivil: undefined as string | undefined,
    profissao: "",
    // Morada
    morada: "",
    localidade: "",
    codigoPostal: "",
    // Contactos
    telefone: "",
    outroTelefone: "",
    outroTelefoneDeQuem: "",
    telemovel: "",
    email: "",
    telemovelEstrangeiro: "",
    // COVID-19
    vacinacao: undefined as string | undefined,
    certificado: undefined as string | undefined,
    jaFoiPortador: undefined as string | undefined,
    // Observações
    observacoes: "",
    alertas: "",
  });

  // Função para formatar telemóvel português (XXX XXX XXX)
  const formatTelemovel = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    
    // Limita a 9 dígitos
    const limited = numbers.slice(0, 9);
    
    // Aplica formatação: XXX XXX XXX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Aplicar formatação especial para telemóvel
    if (name === "telemovel") {
      const formatted = formatTelemovel(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para converter dd/mm/yyyy em Date
  function parseDMY(value: string): Date | undefined {
    const parts = value.split("/");
    if (parts.length !== 3) return undefined;
    const dd = Number(parts[0]);
    const mm = Number(parts[1]);
    const yyyy = Number(parts[2]);
    if (!dd || !mm || !yyyy) return undefined;

    const d = new Date(yyyy, mm - 1, dd);
    if (isNaN(d.getTime())) return undefined;
    if (d.getDate() !== dd || d.getMonth() !== mm - 1 || d.getFullYear() !== yyyy) return undefined;

    return d;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nomeCompleto: formData.nomeCompleto,
          numeroBI: formData.numeroBI || null,
          nif: formData.nif || null,
          genero: formData.genero || null,
          dataNascimento: dataNascimento && dataNascimento !== "__/__/____" 
            ? (() => {
                const parsed = parseDMY(dataNascimento);
                return parsed ? parsed.toISOString() : null;
              })()
            : null,
          estadoCivil: formData.estadoCivil || null,
          profissao: formData.profissao || null,
          morada: formData.morada || null,
          localidade: formData.localidade || null,
          codigoPostal: formData.codigoPostal || null,
          telemovel: formData.telemovel ? formData.telemovel.replace(/\s/g, "") : null,
          email: formData.email || null,
          observacoes: formData.observacoes || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar utente");
      }

      const cliente = await response.json();

      // Redirecionar para a página de listagem com parâmetro de sucesso
      router.push("/clientes?created=true");
    } catch (error) {
      alert("Erro ao criar utente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full overflow-visible">
      <div className="space-y-6 transition-all duration-200 ease-in-out">
        <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-text-dark">Novo Utente</h1>
            <p className="text-text-light mt-2">Preencha os dados do utente</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="simplified" className="text-sm font-medium text-neutral-700 cursor-pointer">
            Ficha Simplificada
          </Label>
          <button
            type="button"
            role="switch"
            aria-checked={simplified}
            onClick={() => setSimplified(!simplified)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2",
              simplified ? "bg-[#F97316]" : "bg-neutral-300"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                simplified ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {simplified ? (
          /* Ficha Simplificada */
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl text-primary">Ficha Simplificada</CardTitle>
              <CardDescription>
                Preencha apenas os campos essenciais
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nomeCompleto-simplified" className="text-base font-semibold">
                    Nome Completo
                  </Label>
                  <Input
                    id="nomeCompleto-simplified"
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    placeholder="Digite o nome completo"
                    className="mt-2 h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="genero-simplified">Género/Sexo</Label>
                  <Select
                    value={formData.genero}
                    onValueChange={(value) => handleSelectChange("genero", value)}
                  >
                    <SelectTrigger className="mt-2 h-10">
                      <SelectValue placeholder="Selecione o género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                      <SelectItem value="Prefiro não dizer">Prefiro não dizer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Label>Data de Nascimento</Label>
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative w-full">
                          <InputMask
                            mask="99/99/9999"
                            value={dataNascimento}
                            maskPlaceholder="_"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                              const v = e.target.value;
                              setDataNascimento(v);

                              const parsed = parseDMY(v);
                              if (parsed) {
                                setCalendarValue(parsed);
                                setCalendarMonth(parsed);
                              }
                            }}
                          >
                            {(inputProps: any) => (
                              <input
                                {...inputProps}
                                placeholder="__/__/____"
                                inputMode="numeric"
                                className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 pr-10 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all"
                              />
                            )}
                          </InputMask>
                          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent
                        align="start"
                        sideOffset={6}
                        className="p-0 shadow-lg border rounded-xl min-w-[320px] bg-white"
                      >
                        <div className="p-2">
                          <Calendar
                            selected={calendarValue}
                            month={calendarMonth}
                            onMonthChange={setCalendarMonth}
                            onSelect={(date: Date | undefined) => {
                              if (!date) return;

                              setCalendarValue(date);

                              const dd = String(date.getDate()).padStart(2, "0");
                              const mm = String(date.getMonth() + 1).padStart(2, "0");
                              const yyyy = date.getFullYear();

                              setDataNascimento(`${dd}/${mm}/${yyyy}`);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="profissao-simplified">Profissão</Label>
                  <Input
                    id="profissao-simplified"
                    name="profissao"
                    value={formData.profissao}
                    onChange={handleChange}
                    placeholder="Ex: Engenheiro, Médico, etc."
                    className="mt-2 h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="email-simplified">E-mail</Label>
                  <Input
                    id="email-simplified"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="cliente@example.com"
                    className="mt-2 h-10"
                  />
                </div>

                <div>
                  <Label htmlFor="telemovel-simplified">Telemóvel</Label>
                  <Input
                    id="telemovel-simplified"
                    name="telemovel"
                    type="text"
                    inputMode="numeric"
                    value={formData.telemovel}
                    onChange={handleChange}
                    placeholder="912 345 678"
                    maxLength={11}
                    className="mt-2 h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 1. Identificação */}
            <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl text-primary">Identificação</CardTitle>
            <CardDescription>
              Informações de identificação do utente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="nomeCompleto" className="text-base font-semibold">
                  Nome Completo
                </Label>
                <Input
                  id="nomeCompleto"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleChange}
                  placeholder="Digite o nome completo"
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="numeroBI">Nº de BI / Cartão Cidadão</Label>
                <Input
                  id="numeroBI"
                  name="numeroBI"
                  value={formData.numeroBI}
                  onChange={handleChange}
                  placeholder="Ex: 123456789"
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="numeroBeneficiario">Nº de Beneficiário</Label>
                <Input
                  id="numeroBeneficiario"
                  name="numeroBeneficiario"
                  value={formData.numeroBeneficiario}
                  onChange={handleChange}
                  placeholder="Número de beneficiário"
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  name="nif"
                  value={formData.nif}
                  onChange={handleChange}
                  placeholder="Ex: 123456789"
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="sistemaSubsistema">Sistema / Subsistema</Label>
                <Select
                  value={formData.sistemaSubsistema || ""}
                  onValueChange={(value) => handleSelectChange("sistemaSubsistema", value || undefined)}
                >
                  <SelectTrigger className="mt-2 h-10">
                    <SelectValue placeholder="Selecione o sistema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SNS">SNS</SelectItem>
                    <SelectItem value="ADSE">ADSE</SelectItem>
                    <SelectItem value="Médis">Médis</SelectItem>
                    <SelectItem value="Multicare">Multicare</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="numeroEntidade">Nº da Entidade / Subsistema</Label>
                <Input
                  id="numeroEntidade"
                  name="numeroEntidade"
                  value={formData.numeroEntidade}
                  onChange={handleChange}
                  placeholder="Número da entidade"
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="medicoAssistente">Médico Assistente</Label>
                <Input
                  id="medicoAssistente"
                  name="medicoAssistente"
                  value={formData.medicoAssistente}
                  onChange={handleChange}
                  placeholder="Nome do médico assistente"
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="niss">NISS</Label>
                <Input
                  id="niss"
                  name="niss"
                  value={formData.niss}
                  onChange={handleChange}
                  placeholder="Número de identificação da segurança social"
                  className="mt-2 h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Dados Pessoais */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl text-primary">Dados Pessoais</CardTitle>
            <CardDescription>
              Informações pessoais do utente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="genero">Género/Sexo</Label>
                <Select
                  value={formData.genero || ""}
                  onValueChange={(value) => handleSelectChange("genero", value || undefined)}
                >
                  <SelectTrigger className="mt-2 h-10">
                    <SelectValue placeholder="Selecione o género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                    <SelectItem value="Prefiro não dizer">Prefiro não dizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estadoCivil">Estado Civil</Label>
                <Select
                  value={formData.estadoCivil || ""}
                  onValueChange={(value) => handleSelectChange("estadoCivil", value || undefined)}
                >
                  <SelectTrigger className="mt-2 h-10">
                    <SelectValue placeholder="Selecione o estado civil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Solteiro">Solteiro</SelectItem>
                    <SelectItem value="Casado">Casado</SelectItem>
                    <SelectItem value="Divorciado">Divorciado</SelectItem>
                    <SelectItem value="Viúvo">Viúvo</SelectItem>
                    <SelectItem value="União de Facto">União de Facto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Label>Data de Nascimento</Label>
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative w-full">
                        <InputMask
                          mask="99/99/9999"
                          value={dataNascimento}
                          maskPlaceholder="_"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const v = e.target.value;
                            setDataNascimento(v);

                            const parsed = parseDMY(v);
                            if (parsed) {
                              setCalendarValue(parsed);
                              setCalendarMonth(parsed);
                            }
                          }}
                        >
                          {(inputProps: any) => (
                            <input
                              {...inputProps}
                              placeholder="__/__/____"
                              inputMode="numeric"
                              className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 pr-10 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all"
                            />
                          )}
                        </InputMask>
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={6}
                      className="p-0 shadow-lg border rounded-xl min-w-[320px] bg-white"
                    >
                      <div className="p-2">
                        <Calendar
                          selected={calendarValue}
                          month={calendarMonth}
                          onMonthChange={setCalendarMonth}
                          onSelect={(date: Date | undefined) => {
                            if (!date) return;

                            setCalendarValue(date);

                            const dd = String(date.getDate()).padStart(2, "0");
                            const mm = String(date.getMonth() + 1).padStart(2, "0");
                            const yyyy = date.getFullYear();

                            setDataNascimento(`${dd}/${mm}/${yyyy}`);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="profissao">Profissão</Label>
                <Input
                  id="profissao"
                  name="profissao"
                  value={formData.profissao}
                  onChange={handleChange}
                  placeholder="Ex: Engenheiro, Médico, etc."
                  className="mt-2 h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Morada */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl text-primary">Morada</CardTitle>
            <CardDescription>
              Informações de morada do utente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="morada">Morada</Label>
                <Input
                  id="morada"
                  name="morada"
                  value={formData.morada}
                  onChange={handleChange}
                  placeholder="Rua, número, andar, etc."
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="localidade">Localidade</Label>
                <Input
                  id="localidade"
                  name="localidade"
                  value={formData.localidade}
                  onChange={handleChange}
                  placeholder="Ex: Lisboa, Porto, etc."
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="codigoPostal">Código Postal</Label>
                <Input
                  id="codigoPostal"
                  name="codigoPostal"
                  value={formData.codigoPostal}
                  onChange={handleChange}
                  placeholder="Ex: 1000-001"
                  className="mt-2 h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Contactos */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl text-primary">Contactos</CardTitle>
            <CardDescription>
              Informações de contacto do utente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="+351 21 123 4567"
                  className="mt-2 h-10"
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-2">
                <div>
                  <Label htmlFor="outroTelefone">Outro Telefone</Label>
                  <Input
                    id="outroTelefone"
                    name="outroTelefone"
                    type="tel"
                    value={formData.outroTelefone}
                    onChange={handleChange}
                    placeholder="+351 21 123 4567"
                    className="mt-2 h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="outroTelefoneDeQuem">De quem?</Label>
                  <Input
                    id="outroTelefoneDeQuem"
                    name="outroTelefoneDeQuem"
                    value={formData.outroTelefoneDeQuem}
                    onChange={handleChange}
                    placeholder="Ex: Mãe"
                    className="mt-2 h-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telemovel">Telemóvel</Label>
                <Input
                  id="telemovel"
                  name="telemovel"
                  type="text"
                  inputMode="numeric"
                  value={formData.telemovel}
                  onChange={handleChange}
                  placeholder="912 345 678"
                  maxLength={11}
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cliente@example.com"
                  className="mt-2 h-10"
                />
              </div>

              <div>
                <Label htmlFor="telemovelEstrangeiro">Telemóvel Estrangeiro</Label>
                <Input
                  id="telemovelEstrangeiro"
                  name="telemovelEstrangeiro"
                  type="tel"
                  value={formData.telemovelEstrangeiro}
                  onChange={handleChange}
                  placeholder="Número internacional"
                  className="mt-2 h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. COVID-19 */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl text-primary">COVID-19</CardTitle>
            <CardDescription>
              Informações relacionadas com COVID-19
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vacinacao">Vacinação</Label>
                <Select
                  value={formData.vacinacao || ""}
                  onValueChange={(value) => handleSelectChange("vacinacao", value || undefined)}
                >
                  <SelectTrigger className="mt-2 h-10">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completa">Completa</SelectItem>
                    <SelectItem value="Parcial">Parcial</SelectItem>
                    <SelectItem value="Não vacinado">Não vacinado</SelectItem>
                    <SelectItem value="Não informado">Não informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="certificado">Certificado</Label>
                <Select
                  value={formData.certificado || ""}
                  onValueChange={(value) => handleSelectChange("certificado", value || undefined)}
                >
                  <SelectTrigger className="mt-2 h-10">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vacinação">Vacinação</SelectItem>
                    <SelectItem value="Testagem">Testagem</SelectItem>
                    <SelectItem value="Recuperação">Recuperação</SelectItem>
                    <SelectItem value="Não possui">Não possui</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Label>Data Certificado</Label>
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative w-full">
                        <InputMask
                          mask="99/99/9999"
                          value={dataCertificado}
                          maskPlaceholder="_"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const v = e.target.value;
                            setDataCertificado(v);

                            const parsed = parseDMY(v);
                            if (parsed) {
                              setDataCertificadoDate(parsed);
                              setDataCertificadoMonth(parsed);
                            }
                          }}
                        >
                          {(inputProps: any) => (
                            <input
                              {...inputProps}
                              placeholder="__/__/____"
                              inputMode="numeric"
                              className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 pr-10 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all"
                            />
                          )}
                        </InputMask>
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={6}
                      className="p-0 shadow-lg border rounded-xl min-w-[320px] bg-white"
                    >
                      <div className="p-2">
                        <Calendar
                          selected={dataCertificadoDate}
                          month={dataCertificadoMonth}
                          onMonthChange={setDataCertificadoMonth}
                          onSelect={(date: Date | undefined) => {
                            if (!date) return;

                            setDataCertificadoDate(date);

                            const dd = String(date.getDate()).padStart(2, "0");
                            const mm = String(date.getMonth() + 1).padStart(2, "0");
                            const yyyy = date.getFullYear();

                            setDataCertificado(`${dd}/${mm}/${yyyy}`);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="relative">
                <Label>Certificado Testagem (Data)</Label>
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative w-full">
                        <InputMask
                          mask="99/99/9999"
                          value={dataCertificadoTestagem}
                          maskPlaceholder="_"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const v = e.target.value;
                            setDataCertificadoTestagem(v);

                            const parsed = parseDMY(v);
                            if (parsed) {
                              setDataCertificadoTestagemDate(parsed);
                              setDataCertificadoTestagemMonth(parsed);
                            }
                          }}
                        >
                          {(inputProps: any) => (
                            <input
                              {...inputProps}
                              placeholder="__/__/____"
                              inputMode="numeric"
                              className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 pr-10 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all"
                            />
                          )}
                        </InputMask>
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={6}
                      className="p-0 shadow-lg border rounded-xl min-w-[320px] bg-white"
                    >
                      <div className="p-2">
                        <Calendar
                          selected={dataCertificadoTestagemDate}
                          month={dataCertificadoTestagemMonth}
                          onMonthChange={setDataCertificadoTestagemMonth}
                          onSelect={(date: Date | undefined) => {
                            if (!date) return;

                            setDataCertificadoTestagemDate(date);

                            const dd = String(date.getDate()).padStart(2, "0");
                            const mm = String(date.getMonth() + 1).padStart(2, "0");
                            const yyyy = date.getFullYear();

                            setDataCertificadoTestagem(`${dd}/${mm}/${yyyy}`);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="relative">
                <Label>Certificado Recuperação (Data)</Label>
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative w-full">
                        <InputMask
                          mask="99/99/9999"
                          value={dataCertificadoRecuperacao}
                          maskPlaceholder="_"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const v = e.target.value;
                            setDataCertificadoRecuperacao(v);

                            const parsed = parseDMY(v);
                            if (parsed) {
                              setDataCertificadoRecuperacaoDate(parsed);
                              setDataCertificadoRecuperacaoMonth(parsed);
                            }
                          }}
                        >
                          {(inputProps: any) => (
                            <input
                              {...inputProps}
                              placeholder="__/__/____"
                              inputMode="numeric"
                              className="w-full h-10 rounded-md border border-neutral-300 bg-white px-3 pr-10 text-sm focus:ring-2 focus:ring-orange-300 focus:border-orange-400 outline-none transition-all"
                            />
                          )}
                        </InputMask>
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      sideOffset={6}
                      className="p-0 shadow-lg border rounded-xl min-w-[320px] bg-white"
                    >
                      <div className="p-2">
                        <Calendar
                          selected={dataCertificadoRecuperacaoDate}
                          month={dataCertificadoRecuperacaoMonth}
                          onMonthChange={setDataCertificadoRecuperacaoMonth}
                          onSelect={(date: Date | undefined) => {
                            if (!date) return;

                            setDataCertificadoRecuperacaoDate(date);

                            const dd = String(date.getDate()).padStart(2, "0");
                            const mm = String(date.getMonth() + 1).padStart(2, "0");
                            const yyyy = date.getFullYear();

                            setDataCertificadoRecuperacao(`${dd}/${mm}/${yyyy}`);
                          }}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="jaFoiPortador">Já foi portador do vírus?</Label>
                <Select
                  value={formData.jaFoiPortador || ""}
                  onValueChange={(value) => handleSelectChange("jaFoiPortador", value || undefined)}
                >
                  <SelectTrigger className="mt-2 h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                    <SelectItem value="Não informado">Não informado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Observações */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="text-xl text-primary">Observações</CardTitle>
            <CardDescription>
              Informações adicionais sobre o utente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  placeholder="Notas adicionais sobre o utente..."
                  className="mt-2 min-h-[120px]"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="alertas" className="flex items-center gap-2 font-medium text-gray-800">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Alertas sobre o utente
                </Label>
                <Textarea
                  id="alertas"
                  name="alertas"
                  value={formData.alertas}
                  onChange={handleChange}
                  placeholder="Alertas importantes sobre o utente..."
                  className="mt-2 min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
          </>
        )}

        {/* Botões */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="bg-primary hover:bg-primary-dark text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "A guardar..." : "Guardar Utente"}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
