import MentionInput from "@/components/mention-input"
import FormulaInput from "@/components/formula-input"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">メンション機能付きコメント入力</h1>
        <p className="text-center text-muted-foreground">「@」を入力するとユーザー一覧が表示されます</p>
        <MentionInput />
        <FormulaInput />
      </div>
    </main>
  )
}
