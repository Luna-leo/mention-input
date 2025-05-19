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
  const isDeletingRef = useRef(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter users based on what's typed after @
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
      user.username.toLowerCase().includes(mentionFilter.toLowerCase()),
  )

  // Reset selection when the dropdown opens or the filter changes
  useEffect(() => {
    if (showMentions) {
      setSelectedIndex(0)
    }
  }, [showMentions, mentionFilter])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart || 0
    setCursorPosition(cursorPos)
    setInputValue(value)

    if (isDeletingRef.current) {
      // When deleting text, avoid triggering the mention dropdown
      mentionStartIndex.current = -1
      setShowMentions(false)
      isDeletingRef.current = false
      return
    }

    // Check if we're in a potential mention context
    const textBeforeCursor = value.substring(0, cursorPos)
    const atSignIndex = textBeforeCursor.lastIndexOf("@")
    const afterAt = textBeforeCursor.substring(atSignIndex + 1)

    if (
      atSignIndex !== -1 &&
      (atSignIndex === 0 || /\s/.test(textBeforeCursor[atSignIndex - 1])) &&
      !/[\s@]/.test(afterAt)
    ) {
      // We found an @ sign that's either at the start or preceded by whitespace
      // and there are no spaces after it before the cursor
      mentionStartIndex.current = atSignIndex
      setMentionFilter(afterAt)
      setShowMentions(true)

      // Calculate dropdown position
      calculateDropdownPosition(atSignIndex)
    } else {
      mentionStartIndex.current = -1
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
    const insertion = `@${user.username} `
    const newValue = `${beforeMention}${insertion}${afterMention}`
    setInputValue(newValue)

    // Calculate new cursor position before resetting the mention index
    const newCursorPos = beforeMention.length + insertion.length

    // Reset mention state
    setShowMentions(false)
    mentionStartIndex.current = -1
    setMentionFilter("")

    // Focus back on textarea and set cursor position after the inserted mention
    if (textareaRef.current) {
      textareaRef.current.focus()
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
        onKeyDown={(e) => {
          if (showMentions) {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setSelectedIndex((selectedIndex + 1) % filteredUsers.length)
              return
            }
            if (e.key === "ArrowUp") {
              e.preventDefault()
              setSelectedIndex(
                (selectedIndex - 1 + filteredUsers.length) % filteredUsers.length,
              )
              return
            }
            if (e.key === "Enter") {
              e.preventDefault()
              const user = filteredUsers[selectedIndex]
              if (user) handleSelectUser(user)
              return
            }
            if (e.key === "Escape") {
              e.preventDefault()
              setShowMentions(false)
              return
            }
          }
          if (e.key === "Backspace" || e.key === "Delete") {
            isDeletingRef.current = true
          } else {
            isDeletingRef.current = false
          }
        }}
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
                {filteredUsers.map((user, index) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelectUser(user)}
                    className="flex items-center gap-2 p-2"
                    data-selected={index === selectedIndex}
                    onMouseEnter={() => setSelectedIndex(index)}
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
