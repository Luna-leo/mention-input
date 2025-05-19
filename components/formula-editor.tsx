"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Check, AlertCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import SensorComboBox from "./sensor-combobox"
import OperatorMenu from "./operator-menu"

// トークンの型定義
type TokenType = "sensor" | "operator" | "text"

interface Token {
  id: string
  type: TokenType
  value: string
  display?: string
  meta?: any
}

export default function FormulaEditor() {
  // トークン配列を状態として管理
  const [tokens, setTokens] = useState<Token[]>([])
  const [inputValue, setInputValue] = useState("")
  // カーソル位置を追跡（トークンの間の位置を表す）
  const [cursorPosition, setCursorPosition] = useState(0)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [previewValue, setPreviewValue] = useState<string | null>(null)
  const [showSensorComboBox, setShowSensorComboBox] = useState(false)
  const [showOperatorMenu, setShowOperatorMenu] = useState(false)
  // センサー検索テキストの状態を追加
  const [sensorSearchText, setSensorSearchText] = useState("")

  // フォーカス状態を追跡
  const [isFocused, setIsFocused] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const tokenRefs = useRef<(HTMLDivElement | null)[]>([])
  const cursorRefs = useRef<(HTMLDivElement | null)[]>([])

  // 最後のカーソル位置を記憶
  const lastCursorPositionRef = useRef(cursorPosition)

  // 入力フィールドにフォーカスを当てる
  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // トークンを追加
  const addToken = useCallback(
    (token: Token) => {
      // 新しいトークン配列を作成
      const newTokens = [...tokens]
      newTokens.splice(cursorPosition, 0, token)

      // トークン配列を更新
      setTokens(newTokens)
      setInputValue("")

      // カーソル位置を更新（追加したトークンの後ろに移動）
      const newPosition = cursorPosition + 1
      setCursorPosition(newPosition)
      lastCursorPositionRef.current = newPosition
    },
    [tokens, cursorPosition],
  )

  // トークンを削除
  const removeToken = useCallback(
    (index: number) => {
      const newTokens = [...tokens]
      newTokens.splice(index, 1)
      setTokens(newTokens)
      // カーソル位置を調整（削除したトークンより後ろにあった場合）
      if (cursorPosition > index) {
        const newPosition = cursorPosition - 1
        setCursorPosition(newPosition)
        lastCursorPositionRef.current = newPosition
      }
      focusInput()
    },
    [tokens, cursorPosition, focusInput],
  )

  // センサーを追加
  const addSensor = useCallback(
    (sensor: { id: string; name: string }) => {
      const sensorToken = {
        id: `sensor-${Date.now()}`,
        type: "sensor" as TokenType,
        value: sensor.id,
        display: sensor.name,
        meta: sensor,
      }

      // トークンを追加
      addToken(sensorToken)

      // メニューを閉じる
      setShowSensorComboBox(false)
      setSensorSearchText("")

      // フォーカスを当てる
      setTimeout(() => {
        focusInput()
      }, 0)
    },
    [addToken, focusInput],
  )

  // 演算子を追加
  const addOperator = useCallback(
    (operator: string) => {
      const operatorToken = {
        id: `operator-${Date.now()}`,
        type: "operator" as TokenType,
        value: operator,
        display: operator,
      }

      // トークンを追加
      addToken(operatorToken)

      // メニューを閉じる
      setShowOperatorMenu(false)

      // フォーカスを当てる
      setTimeout(() => {
        focusInput()
      }, 0)
    },
    [addToken, focusInput],
  )

  // 入力値の変更を処理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // @が含まれている場合、センサー検索を表示
    if (value.includes("@")) {
      const parts = value.split("@")
      const searchPart = parts[parts.length - 1] || ""

      setShowSensorComboBox(true)
      setShowOperatorMenu(false)
      setSensorSearchText(searchPart) // 検索テキストを設定

      // @より前の部分だけを入力値として保持
      if (parts.length > 1 && parts[0]) {
        setInputValue(parts[0])
      } else {
        setInputValue("")
      }
    }
    // #が含まれている場合、演算子メニューを表示
    else if (value.includes("#")) {
      setShowOperatorMenu(true)
      setShowSensorComboBox(false)
      setInputValue(value.replace("#", "")) // #を削除
    }
    // 通常の入力
    else {
      setInputValue(value)
    }
  }

  // キー入力を処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowSensorComboBox(false)
      setShowOperatorMenu(false)
    } else if (e.key === "Backspace" && inputValue === "") {
      // 入力が空でBackspaceが押されたら、カーソル位置の前のトークンを削除
      if (cursorPosition > 0) {
        removeToken(cursorPosition - 1)
      }
    } else if (e.key === "Enter" && inputValue.trim() !== "") {
      // Enterキーが押されたら入力をテキストトークンとして追加
      addToken({
        id: `text-${Date.now()}`,
        type: "text",
        value: inputValue.trim(),
        display: inputValue.trim(),
      })
      setInputValue("")
    } else if (e.key === "ArrowLeft") {
      // 左キーが押されたらカーソル位置を左に移動
      if (inputValue === "" && cursorPosition > 0) {
        e.preventDefault() // デフォルトの挙動をキャンセル
        const newPosition = cursorPosition - 1
        setCursorPosition(newPosition)
        lastCursorPositionRef.current = newPosition
      }
    } else if (e.key === "ArrowRight") {
      // 右キーが押されたらカーソル位置を右に移動
      if (inputValue === "" && cursorPosition < tokens.length) {
        e.preventDefault() // デフォルトの挙動をキャンセル
        const newPosition = cursorPosition + 1
        setCursorPosition(newPosition)
        lastCursorPositionRef.current = newPosition
      }
    }
  }

  // フォーカスイベントを処理
  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    // すぐにフォーカスを失ったとマークしない
    // これにより、クリックイベントが処理される時間を確保
    setTimeout(() => {
      setIsFocused(false)
    }, 100)
  }

  // フォーミュラを検証
  const validateFormula = useCallback(() => {
    try {
      // トークンを文字列に変換
      const formula = tokens
        .map((token) => {
          if (token.type === "sensor") {
            return `@${token.value}`
          } else {
            return token.value
          }
        })
        .join(" ")

      // 簡易的な検証
      // 括弧の対応チェック
      const openParens = (formula.match(/\(/g) || []).length
      const closeParens = (formula.match(/\)/g) || []).length

      if (openParens !== closeParens) {
        setIsValid(false)
        setErrorMessage("括弧の対応が取れていません")
        return
      }

      // センサーの存在チェック
      if (!formula.includes("@")) {
        setIsValid(false)
        setErrorMessage("少なくとも1つのセンサーを含める必要があります")
        return
      }

      // 演算子の前後チェック（簡易版）
      if (/[+\-*/]\s*$/.test(formula) || /^\s*[+\-*/]/.test(formula)) {
        setIsValid(false)
        setErrorMessage("演算子の前後には値が必要です")
        return
      }

      // 検証成功
      setIsValid(true)
      setErrorMessage("")

      // プレビュー値の設定（実際にはサーバーから計算結果を取得）
      setPreviewValue("ΔT = 120 ℃")

      // ASTの生成（実際の実装ではより複雑になる）
      const ast = generateAST(tokens)
      console.log("Formula:", formula)
      console.log("AST:", ast)
    } catch (error) {
      setIsValid(false)
      setErrorMessage("構文エラー: " + (error as Error).message)
    }
  }, [tokens])

  // ASTの生成（簡易版）
  const generateAST = (tokens: Token[]) => {
    // センサートークンを抽出
    const sensorTokens = tokens.filter((token) => token.type === "sensor")

    // 複数のセンサーがある場合は二項演算式として扱う
    if (sensorTokens.length >= 2) {
      return {
        type: "BinaryExpr",
        op: "-", // 実際には式から演算子を抽出
        left: {
          type: "SensorRef",
          sensorId: sensorTokens[0].value,
        },
        right: {
          type: "SensorRef",
          sensorId: sensorTokens[1].value,
        },
      }
    } else if (sensorTokens.length === 1) {
      return {
        type: "SensorRef",
        sensorId: sensorTokens[0].value,
      }
    } else {
      return { type: "Empty" }
    }
  }

  // トークンをクリックしたときの処理
  const handleTokenClick = (index: number) => {
    // クリックしたトークンの後ろにカーソルを移動
    const newPosition = index + 1
    setCursorPosition(newPosition)
    lastCursorPositionRef.current = newPosition
    focusInput()
  }

  // トークン間の領域をクリックしたときの処理
  const handleTokenGapClick = (index: number) => {
    setCursorPosition(index)
    lastCursorPositionRef.current = index
    focusInput()
  }

  // エディタ領域がクリックされたらフォーカスを当てる
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // クリックされた要素がトークンでない場合は末尾にカーソルを移動
    if ((e.target as HTMLElement).closest(".token") === null) {
      const newPosition = tokens.length
      setCursorPosition(newPosition)
      lastCursorPositionRef.current = newPosition
    }
    focusInput()
  }

  // コンポーネントがマウントされたらフォーカスを当てる
  useEffect(() => {
    focusInput()
  }, [focusInput])

  // トークン参照配列のサイズを更新
  useEffect(() => {
    tokenRefs.current = tokenRefs.current.slice(0, tokens.length)
    // カーソル参照配列も更新
    cursorRefs.current = new Array(tokens.length + 1).fill(null)
  }, [tokens])

  // カーソル位置が変わったら入力フィールドの位置を調整
  useEffect(() => {
    // 該当するカーソル位置の要素を取得
    const cursorElement = cursorRefs.current[cursorPosition]
    if (cursorElement && inputRef.current) {
      // 入力フィールドの幅を1pxに設定して実質的に非表示にする
      inputRef.current.style.width = "1px"
      inputRef.current.style.opacity = "0"

      // カーソル位置に合わせて入力フィールドを配置
      const rect = cursorElement.getBoundingClientRect()
      const editorRect = editorRef.current?.getBoundingClientRect()

      if (editorRect) {
        const relativeLeft = rect.left - editorRect.left
        inputRef.current.style.position = "absolute"
        inputRef.current.style.left = `${relativeLeft}px`
        inputRef.current.style.top = `${rect.top - editorRect.top}px`
        inputRef.current.style.height = `${rect.height}px`
      }
    }
  }, [cursorPosition, tokens, isFocused])

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "border rounded-md p-3 min-h-[100px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500",
          isValid === false && "border-red-500 ring-2 ring-red-200",
        )}
        ref={editorRef}
        onClick={handleEditorClick}
      >
        <div className="flex flex-wrap items-center gap-1 relative">
          {/* 先頭のカーソル位置 */}
          <div
            ref={(el) => (cursorRefs.current[0] = el)}
            className={cn(
              "w-0.5 h-5",
              cursorPosition === 0 && isFocused ? "bg-blue-500 animate-pulse" : "bg-transparent",
            )}
          ></div>

          {tokens.map((token, index) => (
            <React.Fragment key={token.id}>
              {/* トークン */}
              <div
                ref={(el) => (tokenRefs.current[index] = el)}
                className={cn(
                  "flex items-center px-2 py-0.5 text-sm token cursor-pointer",
                  token.type === "sensor" && "bg-blue-100 text-blue-800 border border-blue-200 rounded-full",
                  token.type === "operator" && "bg-gray-100 text-gray-800 font-mono rounded-lg",
                  token.type === "text" && "bg-transparent",
                )}
                onClick={() => handleTokenClick(index)}
              >
                {token.type === "sensor" && <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>}
                <span>{token.display}</span>
                {(token.type === "sensor" || token.type === "operator") && (
                  <button
                    type="button"
                    className="ml-1 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeToken(index)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* トークンの後ろのカーソル位置 */}
              <div
                ref={(el) => (cursorRefs.current[index + 1] = el)}
                className={cn(
                  "w-0.5 h-5",
                  cursorPosition === index + 1 && isFocused ? "bg-blue-500 animate-pulse" : "bg-transparent",
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  handleTokenGapClick(index + 1)
                }}
              ></div>

              {/* トークン間のクリック可能な領域 */}
              {index < tokens.length - 1 && (
                <div
                  className="w-2 h-5 cursor-text"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTokenGapClick(index + 1)
                  }}
                ></div>
              )}
            </React.Fragment>
          ))}

          {/* 入力フィールド（絶対位置指定） */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="outline-none bg-transparent caret-blue-500"
            style={{ position: "absolute", width: "1px", opacity: 0 }}
            placeholder=""
          />

          {/* プレースホルダー（入力フィールドが空の場合に表示） */}
          {tokens.length === 0 && inputValue === "" && (
            <div className="text-gray-400 absolute left-0 pointer-events-none">
              @でセンサーを検索、#で演算子メニューを表示
            </div>
          )}
        </div>

        {/* センサーコンボボックス */}
        {showSensorComboBox && (
          <div className="relative">
            <SensorComboBox
              searchText={sensorSearchText}
              onSelect={addSensor}
              onClose={() => setShowSensorComboBox(false)}
            />
          </div>
        )}

        {/* 演算子メニュー */}
        {showOperatorMenu && (
          <div className="relative">
            <OperatorMenu onSelect={addOperator} onClose={() => setShowOperatorMenu(false)} />
          </div>
        )}
      </div>

      {/* 検証バー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>構文</span>
          {isValid === true && (
            <span className="flex items-center text-green-600">
              <Check className="w-4 h-4 mr-1" />
            </span>
          )}
          {isValid === false && (
            <span className="flex items-center text-red-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errorMessage}
            </span>
          )}
        </div>

        {previewValue && isValid && <div className="text-gray-700">プレビュー: {previewValue}</div>}

        <Button onClick={validateFormula}>✓ 保存</Button>
      </div>
    </div>
  )
}
