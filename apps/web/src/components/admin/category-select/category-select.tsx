"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Badge } from "@repo/ui/components/ui/badge";
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
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form";
import { useFormContext } from "react-hook-form";

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  slug: string;
  status: "online" | "offline";
}

interface CategorySelectProps {
  categories: Category[];
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
}

export function CategorySelect({
  categories,
  name,
  label,
  description,
  placeholder = "选择分类...",
  disabled = false,
  multiple = false,
  className,
  value,
  onChange,
}: CategorySelectProps) {
  const [open, setOpen] = React.useState(false);
  const form = useFormContext();

  // 检查是否有表单上下文
  const hasFormContext = !!form;

  // 获取当前值
  const currentValue = hasFormContext ? form.watch(name) : value;
  const [selectedIds, setSelectedIds] = React.useState<string[]>(
    multiple
      ? (Array.isArray(currentValue) ? currentValue : [])
      : (currentValue ? [currentValue] : [])
  );

  // 获取选中的分类对象
  const selectedCategories = React.useMemo(() => {
    return selectedIds.map(id => categories.find(cat => cat.id === id)).filter(Boolean) as Category[];
  }, [selectedIds, categories]);

  // 同步表单状态和内部状态（仅在表单上下文中）
  React.useEffect(() => {
    if (!hasFormContext) return;

    if (multiple) {
      const currentValues = form.getValues(name) || [];
      if (JSON.stringify(currentValues) !== JSON.stringify(selectedIds)) {
        form.setValue(name, selectedIds);
      }
    } else {
      const currentValue = form.getValues(name);
      const expectedValue = selectedIds[0] || "";
      if (currentValue !== expectedValue) {
        form.setValue(name, expectedValue);
      }
    }
  }, [selectedIds, form, name, multiple, hasFormContext]);

  // 处理选择变化
  const handleValueChange = (categoryId: string) => {
    if (multiple) {
      setSelectedIds(prev => {
        const isSelected = prev.includes(categoryId);
        if (isSelected) {
          return prev.filter(id => id !== categoryId);
        } else {
          return [...prev, categoryId];
        }
      });
    } else {
      setSelectedIds([categoryId]);
      setOpen(false);
    }

    if (hasFormContext) {
      if (multiple) {
        const currentValues = form.getValues(name) || [];
        const isSelected = currentValues.includes(categoryId);

        if (isSelected) {
          form.setValue(name, currentValues.filter((id: string) => id !== categoryId));
        } else {
          form.setValue(name, [...currentValues, categoryId]);
        }
      } else {
        form.setValue(name, categoryId);
      }
    } else {
      // 没有表单上下文时，使用 onChange 回调
      if (onChange) {
        if (multiple) {
          const currentValues = Array.isArray(value) ? value : [];
          const isSelected = currentValues.includes(categoryId);

          if (isSelected) {
            onChange(currentValues.filter((id: string) => id !== categoryId));
          } else {
            onChange([...currentValues, categoryId]);
          }
        } else {
          onChange(categoryId);
        }
      }
    }
  };

  // 移除选中的分类（多选模式）
  const handleRemoveCategory = (categoryId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== categoryId));

    if (hasFormContext) {
      const currentValues = form.getValues(name) || [];
      form.setValue(name, currentValues.filter((id: string) => id !== categoryId));
    } else if (onChange) {
      const currentValues = Array.isArray(value) ? value : [];
      onChange(currentValues.filter((id: string) => id !== categoryId));
    }
  };

  // 渲染选中的分类标签（多选模式）
  const renderSelectedCategories = () => {
    if (!multiple || selectedCategories.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {selectedCategories.map(category => (
          <Badge key={category.id} variant="secondary" className="gap-1">
            {category.name}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => handleRemoveCategory(category.id)}
            />
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("w-full justify-between", !multiple && selectedCategories.length === 0 && "text-muted-foreground")}
              disabled={disabled}
            >
              {multiple
                ? (selectedCategories.length > 0
                  ? `已选择 ${selectedCategories.length} 个分类`
                  : placeholder)
                : (selectedCategories.length > 0
                  ? selectedCategories[0]?.name
                  : placeholder)
              }
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="搜索分类..." />
              <CommandList>
                <CommandEmpty>
                  {categories.length === 0 ? "暂无可用的分类" : "未找到分类"}
                </CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={() => handleValueChange(category.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedIds.includes(category.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {category.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      {renderSelectedCategories()}
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
} 