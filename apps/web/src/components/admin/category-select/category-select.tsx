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
import { useCategoryState, Category } from "@/hooks/use-category-state";



interface CategorySelectProps {
  categories: Category[];
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  className?: string;
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
}: CategorySelectProps) {
  const [open, setOpen] = React.useState(false);
  const form = useFormContext();

  // 获取当前值
  const currentValue = form.watch(name);
  const initialSelectedIds = multiple
    ? (Array.isArray(currentValue) ? currentValue : [])
    : (currentValue ? [currentValue] : []);

  // 使用状态管理hook
  const {
    selectedIds,
    selectedCategories,
    cascadeOptions,
    handleSelect,
    removeCategory,
    findCategoryById,
  } = useCategoryState({
    categories,
    initialSelectedIds,
    multiple,
  });

  // 处理选择变化
  const handleValueChange = (categoryId: string) => {
    handleSelect(categoryId);

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
      setOpen(false);
    }
  };

  // 移除选中的分类（多选模式）
  const handleRemoveCategory = (categoryId: string) => {
    removeCategory(categoryId);
    const currentValues = form.getValues(name) || [];
    form.setValue(name, currentValues.filter((id: string) => id !== categoryId));
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
                <CommandEmpty>未找到分类</CommandEmpty>
                {cascadeOptions.map((option) => (
                  <CommandGroup key={option.id} heading={option.name}>
                    <CommandItem
                      value={option.id}
                      onSelect={() => handleValueChange(option.id)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedIds.includes(option.id) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.name}
                    </CommandItem>
                    {option.children?.map((child) => (
                      <CommandItem
                        key={child.id}
                        value={child.id}
                        onSelect={() => handleValueChange(child.id)}
                        className="ml-4"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedIds.includes(child.id) ? "opacity-100" : "opacity-0"
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
      </FormControl>
      {renderSelectedCategories()}
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
} 