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
    <div className="min-h-screen bg-[#f6f1e7] text-neutral-900">
      <div className="mx-auto max-w-6xl px-8 pb-16">
        <header className="border-b border-neutral-300/60">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-12">
            <div />
            <h1 className="text-4xl font-bold uppercase tracking-[0.4em] text-neutral-700 text-center">
              {title}
            </h1>
            <div className="flex justify-end gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500">
              <button
                type="button"
                className="rounded-full border border-neutral-400 px-5 py-2 transition hover:border-neutral-600 hover:text-neutral-700"
              >
                Search
              </button>
              {actionSlot ? (
                <div className="rounded-full bg-neutral-900 px-5 py-2 text-white shadow">
                  {actionSlot}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 border-t border-neutral-300/60 py-5 text-xs font-medium uppercase tracking-[0.35em] text-neutral-500">
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSelectCategory(category.id)}
                  className={`pb-1 transition ${
                    isSelected ? 'border-b-2 border-neutral-800 text-neutral-800' : 'hover:text-neutral-700'
                  }`}
                >
                  {category.name}
                </button>
              )
            })}
          </div>
        </header>

        <main className="pt-12">{children}</main>
      </div>
    </div>
  )
}

export default BoardLayout
