import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

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
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  onResetSearch?: () => void
  isSearching?: boolean
  searchPlaceholder?: string
  searchDisabled?: boolean
}

function BoardLayout({
  title,
  categories,
  selectedCategoryId,
  onSelectCategory,
  actionSlot,
  children,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onResetSearch,
  isSearching = false,
  searchPlaceholder = '검색어를 입력해 주세요',
  searchDisabled = false,
}: BoardLayoutProps): JSX.Element {
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isSearching) {
      setIsSearchOpen(true)
    } else if (!isSearching && !searchValue) {
      setIsSearchOpen(false)
    }
  }, [isSearching, searchValue])

  useEffect(() => {
    if (isSearchOpen) {
      const timer = window.setTimeout(() => {
        searchInputRef.current?.focus()
      }, 10)
      return () => {
        window.clearTimeout(timer)
      }
    }
    return undefined
  }, [isSearchOpen])

  const handleSubmitSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSearchSubmit?.()
  }

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
              {onSearchChange ? (
                isSearchOpen ? (
                  <form
                    className="flex items-center gap-2 rounded-full border border-[#bad7f2]/60 bg-white/90 px-4 py-2 shadow-[0_12px_32px_-18px_rgba(31,47,95,0.2)]"
                    onSubmit={handleSubmitSearch}
                  >
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchValue}
                      onChange={(event) => onSearchChange(event.target.value)}
                      placeholder={searchPlaceholder}
                      className="w-40 rounded bg-transparent px-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#1f2f5f] outline-none placeholder:text-[#7ea6cb]"
                      disabled={searchDisabled}
                    />
                    {isSearching ? (
                      <button
                        type="button"
                        onClick={() => {
                          onResetSearch?.()
                          setIsSearchOpen(false)
                        }}
                        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7ea6cb] transition hover:text-[#1f2f5f]"
                        disabled={searchDisabled}
                      >
                        Reset
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7ea6cb] transition hover:text-[#1f2f5f]"
                        disabled={searchDisabled}
                      >
                        Close
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-full bg-[#bad7f2] px-3 py-1 text-[10px] font-semibold tracking-[0.3em] text-[#1f2f5f] transition hover:bg-[#a6cdef]"
                      disabled={searchDisabled}
                    >
                      Search
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="rounded-full border border-[#bad7f2] px-5 py-2 text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80 disabled:cursor-not-allowed"
                    disabled={searchDisabled}
                  >
                    Search
                  </button>
                )
              ) : null}
              {actionSlot ?? null}
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
