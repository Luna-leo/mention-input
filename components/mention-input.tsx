"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Textarea } from "@/components/ui/textarea"

// Sample user data - in a real app, this would come from your API or database
const users = [
  { id: 1, name: "エンジン 回転数", username: "engine speed" },
  { id: 2, name: "佐藤花子", username: "sato" },
  { id: 3, name: "鈴木一郎", username: "suzuki" },
  { id: 4, name: "高橋次郎", username: "takahashi" },
  { id: 5, name: "伊藤三郎", username: "ito" },
]

export default function MentionInput() {
  const [inputValue, setInputValue] = useState("")
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionStartIndex = useRef(-1)

  // Filter users based on what's typed after @
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
      user.username.toLowerCase().includes(mentionFilter.toLowerCase()),
  )

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart || 0
    setCursorPosition(cursorPos)
    setInputValue(value)

    // Check if we're in a potential mention context
    const textBeforeCursor = value.substring(0, cursorPos)
    const atSignIndex = textBeforeCursor.lastIndexOf("@")

    if (atSignIndex !== -1 && (atSignIndex === 0 || /\s/.test(textBeforeCursor[atSignIndex - 1]))) {
      // We found an @ sign that's either at the start or preceded by whitespace
      mentionStartIndex.current = atSignIndex
      setMentionFilter(textBeforeCursor.substring(atSignIndex + 1))
      setShowMentions(true)

      // Calculate dropdown position
      calculateDropdownPosition(atSignIndex)
    } else {
      setShowMentions(false)
    }
  }

  // Calculate where to position the dropdown
  const calculateDropdownPosition = (atIndex: number) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const text = textarea.value.substring(0, atIndex)

    // Create a temporary element to measure text dimensions
    const temp = document.createElement("div")
    temp.style.position = "absolute"
    temp.style.visibility = "hidden"
    temp.style.whiteSpace = "pre-wrap"
    temp.style.width = `${textarea.offsetWidth}px`
    temp.style.font = window.getComputedStyle(textarea).font
    temp.style.padding = window.getComputedStyle(textarea).padding
    temp.textContent = text

    document.body.appendChild(temp)

    // Calculate line height and position
    const lineHeight = Number.parseInt(window.getComputedStyle(textarea).lineHeight)
    const lines = temp.offsetHeight / lineHeight

    // Get the position of the textarea
    const textareaRect = textarea.getBoundingClientRect()

    // Calculate top and left positions
    const top = textareaRect.top + lines * lineHeight - textarea.scrollTop + 20
    const left = textareaRect.left + 10

    setDropdownPosition({ top, left })

    document.body.removeChild(temp)
  }

  // Handle selecting a user from the dropdown
  const handleSelectUser = (user: (typeof users)[0]) => {
    if (mentionStartIndex.current === -1) return

    const beforeMention = inputValue.substring(0, mentionStartIndex.current)
    const afterMention = inputValue.substring(cursorPosition)

    // Insert the mention
    const newValue = `${beforeMention}@${user.username} ${afterMention}`
    setInputValue(newValue)

    // Reset mention state
    setShowMentions(false)
    mentionStartIndex.current = -1

    // Focus back on textarea and set cursor position after the inserted mention
    if (textareaRef.current) {
      textareaRef.current.focus()
      const newCursorPos = mentionStartIndex.current + user.username.length + 2 // +2 for @ and space
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = newCursorPos
          textareaRef.current.selectionEnd = newCursorPos
        }
      }, 0)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMentions(false)
    }

    document.addEventListener("click", handleClickOutside)
    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-full max-w-md">
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={handleInputChange}
        placeholder="コメントを入力してください（@で人をメンションできます）"
        className="min-h-[100px] resize-none"
        onClick={(e) => e.stopPropagation()}
      />

      {showMentions && (
        <div
          className="absolute z-50 w-64 bg-white rounded-md shadow-md border"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            position: "fixed",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <CommandInput placeholder="ユーザーを検索..." autoFocus />
            <CommandList>
              <CommandEmpty>ユーザーが見つかりません</CommandEmpty>
              <CommandGroup heading="ユーザー">
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelectUser(user)}
                    className="flex items-center gap-2 p-2"
                  >
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
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
