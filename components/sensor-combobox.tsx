"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"
import { mockSensors } from "@/lib/mock-data"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface SensorComboBoxProps {
  searchText: string
  onSelect: (sensor: { id: string; name: string }) => void
  onClose: () => void
}

export default function SensorComboBox({ searchText: initialSearchText, onSelect, onClose }: SensorComboBoxProps) {
  const [searchText, setSearchText] = useState(initialSearchText)
  const [sensors, setSensors] = useState(mockSensors)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isComposing, setIsComposing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 初期検索テキストが変更されたときに検索値を更新
  useEffect(() => {
    setSearchText(initialSearchText)
  }, [initialSearchText])

  // コンポーネントがマウントされたら入力フィールドにフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // 検索テキストに基づいてセンサーをフィルタリング
  useEffect(() => {
    // IME入力中は検索しない
    if (isComposing) return

    // 検索テキストが空の場合は全件表示
    if (!searchText.trim()) {
      setSensors(mockSensors.slice(0, 20))
      setSelectedIndex(0)
      return
    }

    // 検索テキストを小文字に変換（アルファベットの場合のみ影響）
    const searchLower = searchText.toLowerCase()

    // センサー名、ID、パスに検索テキストが含まれるものをフィルタリング
    const filtered = mockSensors.filter(
      (sensor) =>
        sensor.name.includes(searchText) ||
        sensor.name.toLowerCase().includes(searchLower) ||
        sensor.id.includes(searchText) ||
        sensor.id.toLowerCase().includes(searchLower) ||
        sensor.path.includes(searchText) ||
        sensor.path.toLowerCase().includes(searchLower),
    )

    setSensors(filtered.slice(0, 20)) // 最大20件表示
    setSelectedIndex(0)

    // デバッグ用（開発時のみ）
    console.log(`検索テキスト: "${searchText}", 結果: ${filtered.length}件`)
  }, [searchText, isComposing])

  // キーボードイベントのハンドリング
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // IME入力中はキーイベントを処理しない
      if (isComposing) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, sensors.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (sensors[selectedIndex]) {
          onSelect(sensors[selectedIndex])
        }
      } else if (e.key === "Escape") {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [sensors, selectedIndex, onSelect, onClose, isComposing])

  // 入力値の変更を処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  // IME入力開始イベントを処理
  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  // IME入力終了イベントを処理
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false)
    // IME確定後の値で検索
    setSearchText(e.currentTarget.value)
  }

  return (
    <div className="absolute z-50 w-64 bg-white border rounded-lg shadow-lg mt-1">
      <Command>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={handleInputChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="センサーを検索..."
            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none border-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
        <CommandList className="max-h-[300px] overflow-y-auto">
          <CommandEmpty>センサーが見つかりません</CommandEmpty>
          <CommandGroup heading="センサー">
            {sensors.map((sensor, index) => (
              <CommandItem
                key={sensor.id}
                onSelect={() => onSelect(sensor)}
                className={cn(index === selectedIndex && "bg-blue-50")}
              >
                <div className="flex flex-col w-full">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                    <span className="font-medium">{sensor.name}</span>
                    <span className="ml-auto text-xs text-gray-500">{sensor.id}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-4">{sensor.path}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
