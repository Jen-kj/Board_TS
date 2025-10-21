// 1. '글작성' 버튼을 누르면 글작성 페이지로 이동
// 2. 제목, 카테고리 지정, 내용, 사진 첨부, 태그 등 일반 블로그 작성이랑 비슷하게 구성

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import type { BoardCategory } from '../../pages/HomePage'
import { uploadImage } from '../../lib/api'

export type PostDraftPayload = {
  categoryId: string
  title: string
  contentHtml: string
  plainText: string
  excerpt: string
  tags: string[]
  attachments: Array<{ id: string; name: string; url: string }>
}

interface PostComposeProps {
  categories: BoardCategory[]
  defaultCategoryId?: string
  onCancel: () => void
  onSubmit: (payload: PostDraftPayload) => Promise<void> | void
  initialDraft?: Partial<PostDraftPayload> & { contentHtml?: string }
  headline?: string
  description?: string
  submitLabel?: string
}

const INITIAL_EDITOR_HTML = '<p><br /></p>'

function PostCompose({
  categories,
  defaultCategoryId,
  onCancel,
  onSubmit,
  initialDraft,
  headline = '여행 및 버킷리스트 기록 작성',
  description = '떠나고 싶은 여행 버킷리스트나 다녀온 후기, 추천 코스를 자유롭게 공유해 주세요.',
  submitLabel = '등록',
}: PostComposeProps): JSX.Element {
  const [title, setTitle] = useState(initialDraft?.title ?? '')
  const [categoryId, setCategoryId] = useState(initialDraft?.categoryId ?? defaultCategoryId ?? '')
  const [tagsInput, setTagsInput] = useState(
    initialDraft?.tags ? initialDraft.tags.join(', ') : ''
  )
  const [attachments, setAttachments] = useState<Array<{ id: string; name: string; url: string }>>(
    initialDraft?.attachments ?? []
  )
  const [selectedColor, setSelectedColor] = useState('#333333')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const editorRef = useRef<HTMLDivElement | null>(null)
  const savedSelectionRef = useRef<Range | null>(null)

  const availableCategories = useMemo(
    () => categories.filter((category) => category.type === 'general'),
    [categories]
  )

  useEffect(() => {
    if (initialDraft?.categoryId) {
      setCategoryId(initialDraft.categoryId)
      return
    }

    if (defaultCategoryId) {
      setCategoryId(defaultCategoryId)
      return
    }

    if (!categoryId && availableCategories.length > 0) {
      setCategoryId(availableCategories[0].id)
    }
  }, [initialDraft, defaultCategoryId, availableCategories, categoryId])

  useEffect(() => {
    if (!editorRef.current) {
      return
    }
    const editor = editorRef.current
    editor.innerHTML = initialDraft?.contentHtml ?? INITIAL_EDITOR_HTML
    const selection = window.getSelection()
    if (!selection) {
      return
    }
    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
    savedSelectionRef.current = range
  }, [initialDraft])

  useEffect(() => {
    const handleSelectionChange = (): void => {
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        return
      }
      const range = selection.getRangeAt(0)
      if (!editorRef.current) {
        return
      }
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  useEffect(() => {
    if (!initialDraft) {
      return
    }

    setTitle(initialDraft.title ?? '')
    if (initialDraft.categoryId) {
      setCategoryId(initialDraft.categoryId)
    }
    setTagsInput(initialDraft.tags ? initialDraft.tags.join(', ') : '')
    setAttachments(initialDraft.attachments ?? [])

    if (editorRef.current) {
      editorRef.current.innerHTML = initialDraft.contentHtml ?? INITIAL_EDITOR_HTML
      const selection = window.getSelection()
      if (selection) {
        const range = document.createRange()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
        savedSelectionRef.current = range
      } else {
        savedSelectionRef.current = null
      }
    }
  }, [initialDraft])

  const restoreSelection = (): void => {
    const editor = editorRef.current
    if (!editor) {
      return
    }
    const selection = window.getSelection()
    if (!selection) {
      return
    }

    editor.focus()

    if (savedSelectionRef.current) {
      selection.removeAllRanges()
      selection.addRange(savedSelectionRef.current)
      return
    }

    const range = document.createRange()
    range.selectNodeContents(editor)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
    savedSelectionRef.current = range
  }

  const execCommand = (command: string, value?: string): void => {
    restoreSelection()
    document.execCommand(command, false, value)
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      savedSelectionRef.current = selection.getRangeAt(0)
    }
  }

  const insertNodeAtCaret = (node: Node): void => {
    restoreSelection()
    const editor = editorRef.current
    if (!editor) {
      return
    }
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      editor.appendChild(node)
      const range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
      const activeSelection = window.getSelection()
      if (activeSelection) {
        activeSelection.removeAllRanges()
        activeSelection.addRange(range)
      }
      savedSelectionRef.current = range
      return
    }

    const range = selection.getRangeAt(0)
    range.deleteContents()
    range.insertNode(node)
    range.setStartAfter(node)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
    savedSelectionRef.current = range
  }

  const handleInsertImage = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file || !editorRef.current) {
      event.target.value = ''
      return
    }

    setIsUploadingImage(true)
    try {
      const uploaded = await uploadImage(file)

      const imageNode = document.createElement('img')
      imageNode.src = uploaded.url
      imageNode.alt = uploaded.name ?? file.name
      imageNode.dataset.attachmentId = uploaded.id
      imageNode.className = 'my-4 max-h-80 max-w-full rounded-md object-cover'

      insertNodeAtCaret(imageNode)

      setAttachments((prev) => [
        ...prev,
        { id: uploaded.id, name: uploaded.name ?? file.name, url: uploaded.url },
      ])
    } catch (err) {
      console.error(err)
      alert('이미지를 업로드하지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsUploadingImage(false)
      event.target.value = ''
    }
  }

  const handleRemoveAttachment = (attachmentId: string): void => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === attachmentId)
      if (target) {
        const imgNode = editorRef.current?.querySelector<HTMLImageElement>(
          `img[data-attachment-id="${attachmentId}"]`
        )
        imgNode?.remove()
        if (editorRef.current && editorRef.current.innerHTML.trim() === '') {
          editorRef.current.innerHTML = INITIAL_EDITOR_HTML
        }
      }

      return prev.filter((item) => item.id !== attachmentId)
    })

    if (editorRef.current) {
      const editor = editorRef.current
      if (editor.innerHTML.trim() === '') {
        editor.innerHTML = INITIAL_EDITOR_HTML
      }
      const selection = window.getSelection()
      if (selection) {
        const range = document.createRange()
        range.selectNodeContents(editor)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
        savedSelectionRef.current = range
      }
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()

    if (isUploadingImage) {
      alert('이미지 업로드가 끝날 때까지 잠시만 기다려 주세요.')
      return
    }

    if (!title.trim()) {
      alert('제목을 입력해 주세요.')
      return
    }

    if (!categoryId) {
      alert('카테고리를 선택해 주세요.')
      return
    }

    const plainText = editorRef.current?.innerText ?? ''
    if (!plainText.trim()) {
      alert('내용을 입력해 주세요.')
      return
    }

    const tags =
      tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0) ?? []

    const contentHtml = editorRef.current?.innerHTML ?? INITIAL_EDITOR_HTML
    const excerpt =
      plainText.length > 140 ? `${plainText.slice(0, 140)}…` : plainText

    try {
      await onSubmit({
        categoryId,
        title: title.trim(),
        contentHtml,
        plainText: plainText.trim(),
        excerpt,
        tags,
        attachments: attachments.map(({ id, name, url }) => ({
          id,
          name,
          url,
        })),
      })

      setTitle('')
      if (editorRef.current) {
        editorRef.current.innerHTML = INITIAL_EDITOR_HTML
        const selection = window.getSelection()
        if (selection) {
          const range = document.createRange()
          range.selectNodeContents(editorRef.current)
          range.collapse(false)
          selection.removeAllRanges()
          selection.addRange(range)
          savedSelectionRef.current = range
        } else {
          savedSelectionRef.current = null
        }
      }
      setTagsInput('')
      setAttachments([])
    } catch (err) {
      console.error(err)
      alert('글 작성 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 text-[#1f2f5f]">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#1f2f5f]">{headline}</h1>
        <p className="mt-2 text-sm text-[#36577a]">{description}</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#36577a]" htmlFor="title">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded border border-[#bad7f2]/55 bg-white/90 px-3 py-2 text-sm focus:border-[#7ea6cb] focus:outline-none focus:ring-1 focus:ring-[#bad7f2]/60"
            placeholder="예: 올 여름에 떠나는 삿포로 로드트립"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#36577a]" htmlFor="category">
            카테고리
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="w-full rounded border border-[#bad7f2]/55 bg-white/90 px-3 py-2 text-sm focus:border-[#7ea6cb] focus:outline-none focus:ring-1 focus:ring-[#bad7f2]/60"
          >
            <option value="" disabled>
              카테고리를 선택해 주세요
            </option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#36577a]">내용</label>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 rounded border border-[#bad7f2]/55 bg-white/85 px-3 py-2">
              <button
                type="button"
                onClick={() => execCommand('bold')}
                className="rounded px-2 py-1 text-xs font-medium text-[#1f2f5f] hover:bg-[#bad7f2]/20"
              >
                굵게
              </button>
              <button
                type="button"
                onClick={() => execCommand('italic')}
                className="rounded px-2 py-1 text-xs font-medium text-[#1f2f5f] hover:bg-[#bad7f2]/15"
              >
                기울임
              </button>
              <button
                type="button"
                onClick={() => execCommand('underline')}
                className="rounded px-2 py-1 text-xs font-medium text-[#1f2f5f] hover:bg-[#bad7f2]/15"
              >
                밑줄
              </button>
              <label className="flex items-center gap-2 text-xs font-medium text-[#36577a]">
                색상
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(event) => {
                    setSelectedColor(event.target.value)
                    execCommand('foreColor', event.target.value)
                  }}
                />
              </label>
              <label
                className={`cursor-pointer rounded border border-[#bad7f2]/60 px-2 py-1 text-xs font-medium text-[#1f2f5f] transition ${
                  isUploadingImage ? 'cursor-not-allowed opacity-60' : 'hover:bg-[#bad7f2]/20'
                }`}
              >
                사진 추가
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(changeEvent) => {
                    void handleInsertImage(changeEvent)
                  }}
                  disabled={isUploadingImage}
                />
              </label>
              {isUploadingImage ? (
                <span className="text-xs text-[#36577a]">업로드 중...</span>
              ) : null}
            </div>

            <div
              ref={editorRef}
              className="min-h-[320px] rounded border border-[#bad7f2]/55 bg-white/95 px-3 py-2 text-sm focus-within:border-[#7ea6cb] focus-within:ring-1 focus-within:ring-[#bad7f2]/60 prose prose-slate"
              contentEditable
              suppressContentEditableWarning
              aria-label="여행을 꿈꾸게 된 이유, 예산/일정, 준비물, 다녀온 후기는 자유롭게 작성해 주세요."
            />
          </div>
        </div>

        {attachments.length > 0 ? (
          <div className="rounded border border-[#bad7f2]/55 bg-white/90 px-4 py-3">
            <h2 className="mb-2 text-sm font-semibold text-[#1f2f5f]">첨부된 이미지</h2>
            <ul className="space-y-2 text-sm text-[#36577a]">
              {attachments.map((attachment) => (
                <li key={attachment.id} className="flex items-center justify-between gap-3">
                  <span className="truncate">{attachment.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(attachment.id)}
                    className="rounded bg-[#bad7f2] px-2 py-1 text-xs font-medium text-[#1f2f5f] hover:bg-[#a6cdef]"
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-medium text-[#36577a]" htmlFor="tags">
            태그
          </label>
          <input
            id="tags"
            type="text"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            className="w-full rounded border border-[#bad7f2]/55 bg-white/90 px-3 py-2 text-sm focus:border-[#7ea6cb] focus:outline-none focus:ring-1 focus:ring-[#bad7f2]/60"
            placeholder="예: 일본, 온천, 겨울, 일주일 (쉼표로 구분)"
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-[#bad7f2]/55 px-4 py-2 text-sm font-medium text-[#36577a] hover:bg-[#bad7f2]/20"
          >
            취소
          </button>
          <button
            type="submit"
            className="rounded bg-[#1f2f5f] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b284f]"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PostCompose
