"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ComboboxProps {
  options: { value: string; label: string; extra?: string }[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  groupLabel?: string
  className?: string
  popoverClassName?: string
  renderOption?: (option: { value: string; label: string; extra?: string }) => React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialOpen?: boolean
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "選択してください",
  searchPlaceholder = "検索...",
  emptyText = "結果が見つかりません",
  groupLabel = "オプション",
  className,
  popoverClassName,
  renderOption,
  open: controlledOpen,
  onOpenChange,
  initialOpen = false,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(initialOpen)
  const [searchValue, setSearchValue] = React.useState("")

  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : open
  const setIsOpen = isControlled ? onOpenChange! : setOpen

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options

    const searchLower = searchValue.toLowerCase()

    return options.filter(
      (option) =>
        option.label.includes(searchValue) ||
        option.label.toLowerCase().includes(searchLower) ||
        option.value.includes(searchValue) ||
        option.value.toLowerCase().includes(searchLower) ||
        (option.extra && (option.extra.includes(searchValue) || option.extra.toLowerCase().includes(searchLower))),
    )
  }, [options, searchValue])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {value ? options.find((option) => option.value === value)?.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("p-0", popoverClassName)}>
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup heading={groupLabel}>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange?.(currentValue)
                    setIsOpen(false)
                    setSearchValue("")
                  }}
                >
                  {renderOption ? (
                    renderOption(option)
                  ) : (
                    <>
                      <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                      {option.label}
                    </>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
