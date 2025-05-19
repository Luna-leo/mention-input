"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const operators = [
  { symbol: "+", label: "足し算 (+)" },
  { symbol: "-", label: "引き算 (-)" },
  { symbol: "*", label: "掛け算 (*)" },
  { symbol: "/", label: "割り算 (/)" },
]

export default function FormulaInput() {
  const [formula, setFormula] = useState("")
  const [showOps, setShowOps] = useState(false)
  const [cursorPos, setCursorPos] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (op: string) => {
    const before = formula.slice(0, cursorPos)
    const after = formula.slice(cursorPos)
    const newValue = `${before}${op}${after}`
    setFormula(newValue)
    setShowOps(false)

    const newCursor = before.length + op.length
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.selectionStart = newCursor
        inputRef.current.selectionEnd = newCursor
      }
    }, 0)
  }

  return (
    <div className="relative mt-4">
      <Input
        ref={inputRef}
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "#") {
            e.preventDefault()
            setCursorPos(e.currentTarget.selectionStart || 0)
            setShowOps(true)
          }
        }}
        placeholder="数式を入力してください"
      />
      {showOps && (
        <div className="absolute z-50 mt-1 w-64 rounded-md border bg-white shadow-md">
          <Command>
            <CommandList>
              <CommandGroup heading="演算子">
                {operators.map((op) => (
                  <CommandItem
                    key={op.symbol}
                    onSelect={() => handleSelect(op.symbol)}
                    className="cursor-pointer"
                  >
                    {op.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
