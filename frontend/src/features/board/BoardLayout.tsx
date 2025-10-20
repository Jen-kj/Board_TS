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
    <div className="min-h-screen bg-[#ffdbE5] text-[#1f2f5f]">
      <div className="mx-auto max-w-6xl px-8 pb-16">
        <header className="border-b border-[#bad7f2]/55 pb-10 pt-12">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            <div />
            <h1 className="text-4xl font-bold uppercase tracking-[0.4em] text-[#1f2f5f] text-center">
              {title}
            </h1>
            <div className="flex justify-end gap-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#36577a]">
              <button
                type="button"
                className="rounded-full border border-[#bad7f2] px-5 py-2 text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
              >
                Search
              </button>
              {actionSlot ? (
                <div className="rounded-full border border-[#bad7f2]/60 bg-white/90 px-5 py-2 text-[#1f2f5f] shadow-[0_12px_32px_-18px_rgba(31,47,95,0.2)]">
                  {actionSlot}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-5 border-t border-[#bad7f2]/60 pt-6 text-xs font-medium uppercase tracking-[0.35em] text-[#36577a]">
            {categories.map((category) => {
              const isSelected = category.id === selectedCategoryId

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => onSelectCategory(category.id)}
                  className={`pb-1 transition ${
                    isSelected
                      ? 'border-b-2 border-[#1f2f5f] text-[#1f2f5f]'
                      : 'hover:text-[#1f2f5f]'
                  }`}
                >
                  {category.name}
                </button>
              )
            })}
          </div>
        </header>

        <main className="pt-16">{children}</main>
      </div>
    </div>
  )
}

export default BoardLayout
