"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  value?: string;           // "HH:MM"
  onChange: (value: string) => void;
  label?: string;           // texto no botão, ex: "Selecionar hora"
}

export function TimePicker({ value = "", onChange, label = "Selecionar hora" }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  const [open, setOpen] = React.useState(false);

  // Guardar hora temporária até o minuto ser escolhido
  const [tempHour, setTempHour] = React.useState("00");

  // Quando abrir o popover, garantir que a tempHour é a hora atual do value
  React.useEffect(() => {
    if (open) {
      const [h] = value.split(":");
      setTempHour(h || "00");
    }
  }, [open, value]);

  const selectMinute = (m: string) => {
    onChange(`${tempHour}:${m}`);
    setOpen(false); // só fecha após escolher o minuto
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-3">
        <div className="grid grid-cols-2 gap-4">
          {/* HORAS */}
          <div>
            <p className="font-medium mb-2">Hora</p>
            <div className="grid grid-cols-4 gap-1">
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setTempHour(h)} // agora NÃO fecha
                  className={cn(
                    "px-2 py-1 rounded-md text-sm hover:bg-orange-100",
                    tempHour === h && "bg-orange-200 font-bold"
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* MINUTOS */}
          <div>
            <p className="font-medium mb-2">Minuto</p>
            <div className="grid grid-cols-3 gap-1">
              {minutes.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => selectMinute(m)} // fecha aqui sim
                  className={cn(
                    "px-2 py-1 rounded-md text-sm hover:bg-orange-100",
                    value.endsWith(m) && "bg-orange-200 font-bold"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
