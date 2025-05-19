"use client"

import { useState, useRef, useEffect } from "react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const sensors = [
  { id: "engine_speed", name: "エンジン回転数" },
  { id: "temperature", name: "温度" },
  { id: "pressure", name: "圧力" },
]

const operators = ["+", "-", "*", "/", "(", ")", "^"]

export default function FormulaEditor() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showSensors, setShowSensors] = useState(false)
  const [showOps, setShowOps] = useState(false)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

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
    span.className =
      "mx-1 inline-flex items-center rounded bg-blue-100 px-1 text-sm text-blue-800"
    span.setAttribute("data-sensor-id", sensor.id)
    span.contentEditable = "false"
    span.title = sensor.id
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

  return (
    <div className="relative w-full border rounded-md p-2 min-h-[80px]">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[60px] outline-none"
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
        }}
      />
      {showSensors && (
        <div
          className="absolute z-50 w-64 rounded-md border bg-white shadow-md"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder="センサー検索..." autoFocus />
            <CommandList>
              <CommandEmpty>見つかりません</CommandEmpty>
              <CommandGroup heading="センサー">
                {sensors.map((sensor) => (
                  <CommandItem
                    key={sensor.id}
                    onSelect={() => handleSelectSensor(sensor)}
                    className="cursor-pointer"
                  >
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
                  <CommandItem
                    key={op}
                    onSelect={() => handleSelectOp(op)}
                    className="cursor-pointer"
                  >
                    {op}
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
