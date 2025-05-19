import FormulaEditor from "@/components/formula-editor"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold">フォーミュラエディタ</h1>
        <p className="text-gray-600">
          センサーデータと演算子を組み合わせて計算式を作成します。
          <br />
          <code className="bg-gray-100 px-1 py-0.5 rounded">@</code> でセンサー検索、
          <code className="bg-gray-100 px-1 py-0.5 rounded">#</code> で演算子メニューを表示
        </p>
        <FormulaEditor />
      </div>
    </main>
  )
}
