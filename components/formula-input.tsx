"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

export default function FormulaInput() {
  const [formula, setFormula] = useState("")
  return (
    <Input
      value={formula}
      onChange={(e) => setFormula(e.target.value)}
      placeholder="数式を入力してください"
      className="mt-4"
    />
  )
}
