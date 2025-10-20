import type { ReactNode } from 'react'

interface Category {
  id: string
  name: string
}

interface BoardLayoutProps {
  title: string
  categories: Category[]
  selectedCategoryId: string
  onSelectCategory: (categoryId: string) => void
  actionSlot?: ReactNode
  children: ReactNode
}

function BoardLayout({
  title,
  categories,
  selectedCategoryId,
  onSelectCategory,
  actionSlot,
  children,
}: BoardLayoutProps): JSX.Element {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-center">{title}</h1>
        {actionSlot ? <div className="mt-4 flex justify-end">{actionSlot}</div> : null}
      </header>

      <div className="flex gap-8">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-2">
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId

              return (
                <button
                  key={category.id}
                  type="button"
                  className={`rounded px-4 py-2 text-left ${
                    isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                  onClick={() => onSelectCategory(category.id)}
                >
                  {category.name}
                </button>
              )
            })}
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export default BoardLayout
