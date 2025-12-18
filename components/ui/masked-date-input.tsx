"use client";

import React, { useRef, useEffect } from "react";

interface MaskedDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MaskedDateInput({
  value,
  onChange,
  placeholder = "__/__/____",
  className,
}: MaskedDateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const formatValue = (v: string): string => {
    // Remove tudo que não é número
    let digits = v.replace(/\D/g, "");
    // Limita a 8 dígitos
    digits = digits.substring(0, 8);

    // Formata com underscores para partes não preenchidas
    const day = digits.substring(0, 2).padEnd(2, "_");
    const month = digits.substring(2, 4).padEnd(2, "_");
    const year = digits.substring(4, 8).padEnd(4, "_");

    return `${day}/${month}/${year}`;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    // Remove tudo que não é número, incluindo underscores e barras
    let digits = inputValue.replace(/[^0-9]/g, "");
    digits = digits.substring(0, 8);

    // Se não houver dígitos, retorna o placeholder
    if (digits.length === 0) {
      onChange("__/__/____");
      return;
    }

    const masked = formatValue(digits);
    onChange(masked);

    // Ajusta a posição do cursor após a formatação
    setTimeout(() => {
      if (inputRef.current) {
        let newPos = cursorPos;
        
        // Se o cursor estava em uma posição de barra, ajusta
        if (cursorPos === 3 || cursorPos === 6) {
          newPos = cursorPos - 1;
        } else if (cursorPos > masked.length) {
          newPos = masked.length;
        }
        
        // Se o cursor está em uma posição de barra após formatação, move para frente
        if (newPos === 2 && digits.length >= 2) {
          newPos = 3;
        } else if (newPos === 5 && digits.length >= 4) {
          newPos = 6;
        }
        
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPos = input.selectionStart || 0;
    const value = input.value;

    // Se pressionar Backspace em uma posição de barra, move o cursor para trás
    if (e.key === "Backspace") {
      if (cursorPos === 3 || cursorPos === 6) {
        e.preventDefault();
        const newPos = cursorPos - 1;
        setTimeout(() => {
          input.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }

    // Se pressionar Delete em uma posição de barra, move o cursor para frente
    if (e.key === "Delete") {
      if (cursorPos === 2 || cursorPos === 5) {
        e.preventDefault();
        const newPos = cursorPos + 1;
        setTimeout(() => {
          input.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }

    // Bloqueia teclas que não são números ou teclas de navegação
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    if (!allowedKeys.includes(e.key) && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cursorPos = input.selectionStart || 0;

    // Se clicar em uma posição de barra, move o cursor para a posição anterior
    if (cursorPos === 3 || cursorPos === 6) {
      setTimeout(() => {
        input.setSelectionRange(cursorPos - 1, cursorPos - 1);
      }, 0);
    }
  };

  // Ajusta a posição do cursor após mudanças no valor
  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      const cursorPos = input.selectionStart || 0;
      const value = input.value;

      // Se o cursor está em uma posição de barra, move para a posição anterior
      if (cursorPos === 3 || cursorPos === 6) {
        setTimeout(() => {
          input.setSelectionRange(cursorPos - 1, cursorPos - 1);
        }, 0);
      }
    }
  }, [value]);

  // Determina o valor a exibir
  const displayValue = value === "__/__/____" || !value ? placeholder : value;
  const isPlaceholder = value === "__/__/____" || !value;

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={10}
      value={displayValue}
      onChange={handleInput}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      placeholder={placeholder}
      className={className}
      style={{
        color: isPlaceholder ? "#9ca3af" : "inherit",
      }}
    />
  );
}

