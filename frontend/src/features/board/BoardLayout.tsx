import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react'

interface BoardLayoutProps {
  title: string
  categories: Array<{ id: string; name: string }>
  selectedCategoryId: string
  onSelectCategory: (categoryId: string) => void
  actionSlot?: ReactNode
  belowTabsActionSlot?: ReactNode                     // 글 작성              
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
  belowTabsActionSlot,
  children,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onResetSearch,
  isSearching = false,
  searchPlaceholder = '검색어를 입력해 주세요',
  searchDisabled = false,
}: BoardLayoutProps): JSX.Element {
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearching) {
      setIsSearchVisible(true)
    } else if (!isSearching && !searchValue) {
      setIsSearchVisible(false)
    }
  }, [isSearching, searchValue])

  useEffect(() => {
    if (isSearchVisible) {
      const timeoutId = window.setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
      return () => window.clearTimeout(timeoutId)
    }
  }, [isSearchVisible])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onSearchSubmit?.()
  }

  return (
    <div className="min-h-screen bg-[#fff1f2] text-[#be185d]">
      <div className="mx-auto max-w-6xl px-8 pb-16">
        <header className="border-b border-[#fbcfe8]/55 pb-10 pt-12">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            <div className="flex justify-start">{actionSlot}</div>
            <h1 className="text-4xl font-bold uppercase tracking-[0.4em] text-[#be185d] text-center">{title}</h1>
            <div className="flex justify-end">
              {onSearchChange && (
                <form className="flex items-center gap-2 rounded-full border border-[#fbcfe8]/60 bg-white/90 px-4 py-2 shadow-[0_12px_32px_-18px_rgba(190,24,93,0.2)]" onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-40 rounded bg-transparent px-2 text-[10px] font-medium uppercase tracking-[0.3em] text-[#be185d] outline-none placeholder:text-[#f9a8d4]"
                    disabled={searchDisabled}
                  />
                  {isSearching ? <button type="button" onClick={() => { onResetSearch?.(); setIsSearchVisible(false); }} className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#f9a8d4] transition hover:text-[#be185d]" disabled={searchDisabled}>Reset</button> : null}
                  <button type="submit" className="rounded-full bg-[#fbcfe8] px-3 py-1 text-[10px] font-semibold tracking-[0.3em] text-[#be185d] transition hover:bg-[#f9a8d4]" disabled={searchDisabled}>Search</button>
                </form>
              )}
            </div>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-5 border-t border-[#fbcfe8]/60 pt-6 text-xs font-medium uppercase tracking-[0.35em] text-[#f472b6]">
            {categories.map((category) => (
              <button key={category.id} type="button" onClick={() => onSelectCategory(category.id)} className={`pb-1 transition ${category.id === selectedCategoryId ? 'border-b-2 border-[#be185d] text-[#be185d]' : 'hover:text-[#be185d]'}`}>{category.name}</button>
            ))}
          </div>
        </header>
        {belowTabsActionSlot ? (
          <div className="mt-4 flex justify-end">
            {belowTabsActionSlot}
          </div>
        ) : null}

        <main className="pt-10">{children}</main>
      </div>
    </div>
  )
}

export default BoardLayout
