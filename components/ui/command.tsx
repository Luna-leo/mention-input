"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={"flex h-full w-full flex-col overflow-hidden rounded-md bg-white " + className}
    {...props}
  />
))
Command.displayName = CommandPrimitive.displayName

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className = "", ...props }, ref) => (
  <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={"flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 " + className}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={"max-h-60 overflow-y-auto overflow-x-hidden " + className}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={"overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium text-gray-500 " + className}
    {...props}
  />
))
CommandGroup.displayName = CommandPrimitive.Group.displayName

export const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className = "", ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={"relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-200" + (className ? ` ${className}` : "")}
    {...props}
  />
))
CommandItem.displayName = CommandPrimitive.Item.displayName
