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

const items = [
  { value: "engine_speed", label: "エンジン回転数" },
  { value: "temperature", label: "温度" },
  { value: "pressure", label: "圧力" },
]

export default function FormulaInput() {
  const [formula, setFormula] = useState("")
  const [prevFormula, setPrevFormula] = useState("")
  const [showOps, setShowOps] = useState(false)
  const [showItems, setShowItems] = useState(false)
  const [cursorPos, setCursorPos] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSelect = (op: string) => {
    const before = formula.slice(0, cursorPos)
    const after = formula.slice(cursorPos)
    const newValue = `${before}${op}${after}`
    setFormula(newValue)
    setPrevFormula(newValue)
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

  const handleSelectItem = (val: string) => {
    const before = formula.slice(0, cursorPos)
    const after = formula.slice(cursorPos)
    const newValue = `${before}${val}${after}`
    setFormula(newValue)
    setPrevFormula(newValue)
    setShowItems(false)

    const newCursor = before.length + val.length
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
        onChange={(e) => {
          const newValue = e.target.value
          const newCursor = e.currentTarget.selectionStart || 0

          if (newValue.length - prevFormula.length === 1) {
            const inserted = newValue[newCursor - 1]
            if (inserted === "#" || inserted === "@") {
              const before = newValue.slice(0, newCursor - 1)
              const after = newValue.slice(newCursor)
              const cleaned = `${before}${after}`
              setFormula(cleaned)
              setPrevFormula(cleaned)
              setCursorPos(newCursor - 1)
              if (inserted === "#") {
                setShowOps(true)
                setShowItems(false)
              } else {
                setShowItems(true)
                setShowOps(false)
              }
              return
            }
          }

          setFormula(newValue)
          setPrevFormula(newValue)
          setCursorPos(newCursor)
        }}
        onKeyDown={(e) => {
          if (e.key === "#") {
            e.preventDefault()
            setCursorPos(e.currentTarget.selectionStart || 0)
            setShowOps(true)
            setShowItems(false)
          } else if (e.key === "@") {
            e.preventDefault()
            setCursorPos(e.currentTarget.selectionStart || 0)
            setShowItems(true)
            setShowOps(false)
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
      {showItems && (
        <div className="absolute z-50 mt-1 w-64 rounded-md border bg-white shadow-md">
          <Command>
            <CommandList>
              <CommandGroup heading="項目">
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    onSelect={() => handleSelectItem(item.value)}
                    className="cursor-pointer"
                  >
                    {item.label}
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
