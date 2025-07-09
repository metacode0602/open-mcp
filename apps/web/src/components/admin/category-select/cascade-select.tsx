"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/ui/popover";

export interface CascadeOption {
  id: string;
  name: string;
  description?: string;
  children?: CascadeOption[];
}

interface CascadeSelectProps {
  options: CascadeOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CascadeSelect({
  options,
  value,
  onValueChange,
  placeholder = "选择分类...",
  disabled = false,
  className,
}: CascadeSelectProps) {
  const [open, setOpen] = React.useState(false);

  // 根据value找到对应的选项
  const findOption = (options: CascadeOption[], targetId: string): CascadeOption | null => {
    for (const option of options) {
      if (option.id === targetId) {
        return option;
      }
      if (option.children) {
        const found = findOption(option.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedOption = value ? findOption(options, value) : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="搜索分类..." />
          <CommandList>
            <CommandEmpty>未找到分类</CommandEmpty>
            {options.map((option) => (
              <CommandGroup key={option.id} heading={option.name}>
                <CommandItem
                  value={option.id}
                  onSelect={() => {
                    onValueChange(option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </CommandItem>
                {option.children?.map((child) => (
                  <CommandItem
                    key={child.id}
                    value={child.id}
                    onSelect={() => {
                      onValueChange(child.id);
                      setOpen(false);
                    }}
                    className="ml-4"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === child.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {child.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 