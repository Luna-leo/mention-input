"use client"

import { useState, useRef, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

const sensors = [
  { id: "engine_speed", name: "エンジン回転数", color: "bg-red-200", path: "sensors.engine_speed" },
  { id: "temperature", name: "温度", color: "bg-green-200", path: "sensors.temperature" },
  { id: "pressure", name: "圧力", color: "bg-blue-200", path: "sensors.pressure" },
]

const operators = ["+", "-", "*", "/", "(", ")", "^"]

export default function FormulaEditor() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showSensors, setShowSensors] = useState(false)
  const [showOps, setShowOps] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleClick = () => {
      setShowSensors(false)
      setShowOps(false)
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const insertNodeAtCaret = (node: Node) => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    range.deleteContents()
    range.insertNode(node)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
  }

  const insertText = (text: string) => {
    document.execCommand("insertText", false, text)
  }

  const handleSelectSensor = (sensor: (typeof sensors)[0]) => {
    const span = document.createElement("span")
    span.textContent = sensor.name
    span.className = `mx-1 inline-flex items-center rounded px-1 text-sm text-black ${sensor.color}`
    span.setAttribute("data-sensor-id", sensor.id)
    span.title = sensor.path
    span.contentEditable = "false"
    insertNodeAtCaret(span)
    const space = document.createTextNode(" ")
    insertNodeAtCaret(space)
    setShowSensors(false)
  }

  const handleSelectOp = (op: string) => {
    insertText(op)
    setShowOps(false)
  }

  const openDropdown = (type: "sensor" | "op") => {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    setDropdownPos({ top: rect.bottom + window.scrollY, left: rect.left })
    if (type === "sensor") {
      setShowSensors(true)
      setShowOps(false)
    } else {
      setShowOps(true)
      setShowSensors(false)
    }
  }

  const validate = () => {
    if (!editorRef.current) return
    const text = editorRef.current.innerText.trim()
    if (!text) {
      setError("式が空です")
      return
    }
    let balance = 0
    for (const ch of text) {
      if (ch === "(") balance++
      if (ch === ")") balance--
      if (balance < 0) break
    }
    if (balance !== 0) {
      setError("括弧が一致しません")
      return
    }
    setError(null)
    alert(JSON.stringify({ formula: text }))
  }

  return (
    <div className="space-y-2">
      <div className={`relative w-full rounded-md border p-2 min-h-[80px] ${error ? "border-red-500" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "@") {
            e.preventDefault()
            openDropdown("sensor")
          }
          if (e.key === "#") {
            e.preventDefault()
            openDropdown("op")
          }
          if (e.key === "Escape") {
            setShowOps(false)
            setShowSensors(false)
          }
          if (e.key === "Enter" && !showOps && !showSensors) {
            e.preventDefault()
            validate()
          }
        }}
      >
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[60px] outline-none"
        />
        {showSensors && (
          <div
            className="absolute z-50 w-64 rounded-md border bg-white shadow-md"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command>
              <CommandInput placeholder="センサー検索..." autoFocus value={query} onValueChange={setQuery} />
              <CommandList>
                <CommandEmpty>見つかりません</CommandEmpty>
                <CommandGroup heading="センサー">
                  {sensors.filter((s) => s.name.includes(query)).slice(0, 20).map((sensor) => (
                    <CommandItem key={sensor.id} onSelect={() => handleSelectSensor(sensor)} className="cursor-pointer">
                      {sensor.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
        {showOps && (
          <div
            className="absolute z-50 w-32 rounded-md border bg-white shadow-md"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <Command>
              <CommandList>
                <CommandGroup heading="演算子">
                  {operators.map((op) => (
                    <CommandItem key={op} onSelect={() => handleSelectOp(op)} className="cursor-pointer">
                      {op}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <button className="rounded bg-blue-500 px-3 py-1 text-white" onClick={validate}>✔︎ 保存</button>
    </div>
  )
}
