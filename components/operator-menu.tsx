"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

interface OperatorMenuProps {
  onSelect: (operator: string) => void
  onClose: () => void
}

export default function OperatorMenu({ onSelect, onClose }: OperatorMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const operators = [
    { symbol: "+", label: "加算" },
    { symbol: "-", label: "減算" },
    { symbol: "*", label: "乗算" },
    { symbol: "/", label: "除算" },
    { symbol: "(", label: "左括弧" },
    { symbol: ")", label: "右括弧" },
    { symbol: "^", label: "累乗" },
  ]

  // キーボードイベントのハンドリング
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  return (
    <div ref={containerRef} className="absolute z-50 p-2 bg-white border rounded-lg shadow-lg mt-1">
      <div className="grid grid-cols-4 gap-1">
        {operators.map((op) => (
          <Button
            key={op.symbol}
            variant="outline"
            size="sm"
            onClick={() => onSelect(op.symbol)}
            title={op.label}
            className="w-8 h-8 font-mono rounded-md"
          >
            {op.symbol}
          </Button>
        ))}
      </div>
    </div>
  )
}
