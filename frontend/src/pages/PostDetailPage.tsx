import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BoardLayout from '../features/board/BoardLayout'
import BoardHeaderActions from '../features/board/BoardHeaderActions'
import type { BoardCategory, PostSummary } from './HomePage'
import type { AuthenticatedUser, PostComment } from '../lib/api'
import {
  createComment,
  deleteComment,
  fetchComments,
  fetchPost,
  likeComment,
  likePost,
  unlikeComment,
  unlikePost,
  updateComment,
} from '../lib/api'

function formatCommentDate(value: string): string {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}

interface PostDetailPageProps {
  categories: BoardCategory[]
  onRequestCompose: (categoryId: string) => void
  postCache: PostSummary[]
  onRefresh?: () => Promise<boolean | void> | void
  searchValue: string
  onChangeSearch: (value: string) => void
  onSubmitSearch: () => void
  onResetSearch: () => void
  isSearching: boolean
  searchDisabled?: boolean
  onRequestEdit: (postId: string) => void
  onDeletePost: (postId: string) => Promise<void>
  currentUser: AuthenticatedUser | null
  authToken: string | null
  onRequireAuth: (path: string) => void
}

function PostDetailPage({
  categories,
  onRequestCompose,
  postCache,
  onRefresh,
  searchValue,
  onChangeSearch,
  onSubmitSearch,
  onResetSearch,
  isSearching,
  searchDisabled = false,
  onRequestEdit,
  onDeletePost,
  currentUser,
  authToken,
  onRequireAuth,
}: PostDetailPageProps): JSX.Element {
  const { postId } = useParams<{ postId: string }>()
  const [post, setPost] = useState<PostSummary | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    post?.categoryId ?? categories[0]?.id ?? ''
  )
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [comments, setComments] = useState<PostComment[]>([])
  const [commentsLoading, setCommentsLoading] = useState<boolean>(true)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  const [commentInput, setCommentInput] = useState<string>('')
  const [commentSubmitError, setCommentSubmitError] = useState<string | null>(
    null
  )
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  )
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null)
  const [replyInput, setReplyInput] = useState<string>('')
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingInput, setEditingInput] = useState<string>('')
  const [isUpdatingComment, setIsUpdatingComment] = useState<boolean>(false)
  const [commentActionError, setCommentActionError] = useState<string | null>(
    null
  )
  const [isTogglingPostLike, setIsTogglingPostLike] = useState<boolean>(false)
  const [togglingCommentLikeId, setTogglingCommentLikeId] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!postId) {
      setError('잘못된 경로예요.')
      setLoading(false)
      return
    }

    const cached = postCache.find((item) => item.id === postId)
    if (cached) {
      setPost({ ...cached, likes: cached.likes ?? [] })
      setLoading(false)
    } else {
      setLoading(true)
    }

    let isMounted = true

    fetchPost(postId)
      .then((data) => {
        if (!isMounted) {
          return
        }
        setPost({ ...data, likes: data.likes ?? [] })
        setError(null)
        onRefresh?.()
      })
      .catch((err) => {
        console.error(err)
        if (!isMounted) {
          return
        }
        setError(
          '게시글을 불러오는 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
        )
      })
      .finally(() => {
        if (!isMounted) {
          return
        }
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [postId])

  const loadComments = useCallback(async () => {
    if (!postId) {
      setComments([])
      setCommentsError('잘못된 경로예요.')
      setCommentsLoading(false)
      return
    }

    setCommentsLoading(true)
    try {
      const data = await fetchComments(postId)
      setComments(data.map((item) => ({ ...item, likes: item.likes ?? [] })))
      setCommentsError(null)
      setReplyTargetId(null)
      setReplyInput('')
      setEditingCommentId(null)
      setEditingInput('')
      setCommentActionError(null)
      setDeletingCommentId(null)
      setIsSubmittingReply(false)
      setIsUpdatingComment(false)
      setTogglingCommentLikeId(null)
    } catch (err) {
      console.error(err)
      setCommentsError('댓글을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setCommentsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  useEffect(() => {
    if (post?.categoryId) {
      setSelectedCategoryId(post.categoryId)
      return
    }
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [post?.categoryId, categories, selectedCategoryId])

  const category = useMemo(() => {
    if (!post) {
      return null
    }
    return categories.find((item) => item.id === post.categoryId) ?? null
  }, [categories, post])

  const formattedDate = useMemo(() => {
    if (!post?.createdAt) {
      return ''
    }
    try {
      return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(post.createdAt))
    } catch {
      return post.createdAt
    }
  }, [post?.createdAt])

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  )

  const canWrite = selectedCategory?.type === 'general'
  const canEditPost =
    post !== null && currentUser !== null && post.authorId === currentUser.id

  const { topLevelComments, repliesByParent } = useMemo(() => {
    const topLevel: PostComment[] = []
    const replies = new Map<string, PostComment[]>()

    const sortByCreatedAt = (a: PostComment, b: PostComment) => {
      const aTime = new Date(a.createdAt).getTime()
      const bTime = new Date(b.createdAt).getTime()
      return aTime - bTime
    }

    comments.forEach((comment) => {
      if (comment.parentId) {
        const parentReplies = replies.get(comment.parentId) ?? []
        parentReplies.push(comment)
        replies.set(comment.parentId, parentReplies)
      } else {
        topLevel.push(comment)
      }
    })

    topLevel.sort(sortByCreatedAt)
    replies.forEach((list, key) => {
      list.sort(sortByCreatedAt)
      replies.set(key, list)
    })

    return { topLevelComments: topLevel, repliesByParent: replies }
  }, [comments])

  const handleSelectCategory = (categoryId: string): void => {
    setSelectedCategoryId(categoryId)
  }

  const handleClickWrite = (): void => {
    if (!canWrite) {
      return
    }
    onRequestCompose(selectedCategoryId)
  }

  const handleClickEdit = (): void => {
    if (!post) {
      return
    }
    onRequestEdit(post.id)
  }

  const handleClickDelete = async (): Promise<void> => {
    if (!post || isDeleting) {
      return
    }

    const confirmed = window.confirm(
      '정말로 이 게시글을 삭제할까요? 되돌릴 수 없어요.'
    )
    if (!confirmed) {
      return
    }

    setIsDeleting(true)

    try {
      await onDeletePost(post.id)
    } catch (err) {
      console.error(err)
      setError('게시글 삭제 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePostLike = async (): Promise<void> => {
    if (!postId || !post) {
      return
    }

    if (!authToken) {
      onRequireAuth(`/posts/${postId}`)
      return
    }

    if (isTogglingPostLike) {
      return
    }

    const isLiked = currentUser ? post.likes.includes(currentUser.id) : false

    setCommentActionError(null)
    setIsTogglingPostLike(true)

    try {
      const updated = isLiked
        ? await unlikePost(post.id, authToken)
        : await likePost(post.id, authToken)
      setPost({ ...updated, likes: updated.likes ?? [] })
      void onRefresh?.()
    } catch (err) {
      console.error(err)
      setCommentActionError(
        '좋아요 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setIsTogglingPostLike(false)
    }
  }

  const handleSubmitComment = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault()
    if (!postId) {
      return
    }

    if (!authToken) {
      onRequireAuth(`/posts/${postId}`)
      return
    }

    const trimmed = commentInput.trim()
    if (trimmed.length === 0) {
      setCommentSubmitError('댓글 내용을 입력해 주세요.')
      return
    }

    setCommentSubmitError(null)
    setCommentActionError(null)
    setIsSubmittingComment(true)

    try {
      const created = await createComment(postId, trimmed, authToken)
      setComments((prev) => [
        ...prev,
        { ...created, likes: created.likes ?? [] },
      ])
      setCommentInput('')
    } catch (err) {
      console.error(err)
      setCommentSubmitError(
        '댓글 등록 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleStartReply = (commentId: string): void => {
    if (!postId) {
      return
    }
    if (!authToken) {
      onRequireAuth(`/posts/${postId}`)
      return
    }
    setReplyTargetId(commentId)
    setReplyInput('')
    setCommentSubmitError(null)
    setCommentActionError(null)
    setEditingCommentId(null)
    setEditingInput('')
  }

  const handleCancelReply = (): void => {
    setReplyTargetId(null)
    setReplyInput('')
  }

  const handleSubmitReply = async (
    event: FormEvent<HTMLFormElement>,
    parentCommentId: string
  ): Promise<void> => {
    event.preventDefault()
    if (!postId) {
      return
    }

    if (!authToken) {
      onRequireAuth(`/posts/${postId}`)
      return
    }

    if (replyTargetId !== parentCommentId) {
      setReplyTargetId(parentCommentId)
    }

    const trimmed = replyInput.trim()
    if (trimmed.length === 0) {
      setCommentActionError('댓글 내용을 입력해 주세요.')
      return
    }

    setCommentActionError(null)
    setIsSubmittingReply(true)

    try {
      const created = await createComment(
        postId,
        trimmed,
        authToken,
        parentCommentId
      )
      setComments((prev) => [
        ...prev,
        { ...created, likes: created.likes ?? [] },
      ])
      setReplyTargetId(null)
      setReplyInput('')
    } catch (err) {
      console.error(err)
      setCommentActionError(
        '댓글 등록 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleStartEdit = (comment: PostComment): void => {
    if (!postId) {
      return
    }

    if (!authToken) {
      onRequireAuth(`/posts/${postId}`)
      return
    }

    setEditingCommentId(comment.id)
    setEditingInput(comment.content)
    setCommentSubmitError(null)
    setCommentActionError(null)
    setReplyTargetId(null)
    setReplyInput('')
  }

  const handleCancelEdit = (): void => {
    setEditingCommentId(null)
    setEditingInput('')
  }

  const handleSubmitEdit = async (
    event: FormEvent<HTMLFormElement>,
    commentId: string
  ): Promise<void> => {
    event.preventDefault()
    if (!postId) {
      return
    }

    if (!authToken) {
      onRequireAuth(`/posts/${postId}`)
      return
    }

    const trimmed = editingInput.trim()
    if (trimmed.length === 0) {
      setCommentActionError('댓글 내용을 입력해 주세요.')
      return
    }

    setCommentActionError(null)
    setIsUpdatingComment(true)

    try {
      const updated = await updateComment(postId, commentId, trimmed, authToken)
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                content: updated.content,
                updatedAt: updated.updatedAt,
              }
            : comment
        )
      )
      setEditingCommentId(null)
      setEditingInput('')
    } catch (err) {
      console.error(err)
      setCommentActionError(
        '댓글 수정 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setIsUpdatingComment(false)
    }
  }

  const handleToggleCommentLike = async (
    comment: PostComment
  ): Promise<void> => {
    if (!postId) {
      return
    }

    if (!authToken) {
      onRequireAuth(`/posts/${postId}`)
      return
    }

    if (togglingCommentLikeId) {
      return
    }

    const isLiked = currentUser ? comment.likes.includes(currentUser.id) : false

    setCommentActionError(null)
    setTogglingCommentLikeId(comment.id)

    try {
      const updated = isLiked
        ? await unlikeComment(postId, comment.id, authToken)
        : await likeComment(postId, comment.id, authToken)
      setComments((prev) =>
        prev.map((item) =>
          item.id === comment.id
            ? { ...item, likes: updated.likes ?? [] }
            : item
        )
      )
    } catch (err) {
      console.error(err)
      setCommentActionError(
        '좋아요 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setTogglingCommentLikeId(null)
    }
  }

  const handleDeleteComment = async (commentId: string): Promise<void> => {
    if (!postId) {
      return
    }

    if (!authToken) {
      onRequireAuth(`/posts/${postId}`)
      return
    }

    if (deletingCommentId) {
      return
    }

    const confirmed = window.confirm('댓글을 삭제할까요? 되돌릴 수 없어요.')
    if (!confirmed) {
      return
    }

    setCommentSubmitError(null)
    setCommentActionError(null)
    setDeletingCommentId(commentId)

    try {
      await deleteComment(postId, commentId, authToken)
      const idsToRemove = new Set<string>([commentId])
      const stack: string[] = [commentId]

      while (stack.length > 0) {
        const current = stack.pop() as string
        const children = repliesByParent.get(current) ?? []
        for (const child of children) {
          if (!idsToRemove.has(child.id)) {
            idsToRemove.add(child.id)
            stack.push(child.id)
          }
        }
      }

      setComments((prev) =>
        prev.filter((comment) => !idsToRemove.has(comment.id))
      )

      if (togglingCommentLikeId && idsToRemove.has(togglingCommentLikeId)) {
        setTogglingCommentLikeId(null)
      }

      if (replyTargetId && idsToRemove.has(replyTargetId)) {
        setReplyTargetId(null)
        setReplyInput('')
      }

      if (editingCommentId && idsToRemove.has(editingCommentId)) {
        setEditingCommentId(null)
        setEditingInput('')
      }
    } catch (err) {
      console.error(err)
      setCommentActionError(
        '댓글 삭제 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setDeletingCommentId(null)
    }
  }

  const renderCommentItem = (comment: PostComment, depth = 0): JSX.Element => {
    const replies = repliesByParent.get(comment.id) ?? []
    const isAuthor = currentUser?.id === comment.authorId
    const isEditing = editingCommentId === comment.id
    const isDeletingThis = deletingCommentId === comment.id
    const isUpdatingThis = isUpdatingComment && editingCommentId === comment.id
    const isReplyingHere = replyTargetId === comment.id
    const createdText = formatCommentDate(comment.createdAt)
    const isEdited =
      comment.updatedAt !== undefined &&
      comment.updatedAt !== null &&
      comment.updatedAt !== comment.createdAt
    const commentLikesCount = comment.likes?.length ?? 0
    const isCommentLiked = currentUser
      ? comment.likes.includes(currentUser.id)
      : false
    const isCommentLikePending = togglingCommentLikeId === comment.id
    const containerClass =
      depth > 0
        ? 'rounded-[20px] border border-[#bad7f2]/45 bg-white/80 px-5 py-4 shadow-[0_12px_28px_-24px_rgba(31,47,95,0.18)]'
        : 'rounded-[24px] border border-[#bad7f2]/55 bg-white/85 px-6 py-5 shadow-[0_22px_40px_-36px_rgba(31,47,95,0.2)]'

    return (
      <li key={comment.id} className={containerClass}>
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.3em] text-[#4e6e8e]">
          <span className="flex items-center gap-3">
            {comment.authorAvatarUrl ? (
              <img
                src={comment.authorAvatarUrl}
                alt={`${comment.author} 프로필 이미지`}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#bad7f2]/60 text-[10px] font-semibold text-[#1f2f5f]">
                {(comment.author?.slice(0, 1) ?? '?').toUpperCase()}
              </span>
            )}
            <span>{comment.author ?? '알 수 없음'}</span>
          </span>
          <span className="flex items-center gap-2">
            <span>{createdText}</span>
            {isEdited ? (
              <span className="text-[10px] lowercase text-[#7ea6cb]">
                (수정됨)
              </span>
            ) : null}
          </span>
        </div>

        <div className="mt-4">
          {isEditing ? (
            <form
              onSubmit={(event) => {
                void handleSubmitEdit(event, comment.id)
              }}
              className="space-y-3"
            >
              <textarea
                value={editingInput}
                onChange={(event) => setEditingInput(event.target.value)}
                rows={4}
                maxLength={1000}
                disabled={isUpdatingThis}
                className="w-full rounded-[18px] border border-[#bad7f2]/60 bg-white/90 px-4 py-3 text-sm text-[#1f2f5f] outline-none transition focus:border-[#1f2f5f] disabled:cursor-not-allowed"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdatingThis}
                  className="rounded-full border border-[#bad7f2]/60 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#4e6e8e] transition hover:bg-[#bad7f2]/30 disabled:cursor-not-allowed"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingThis}
                  className={`rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] transition ${
                    isUpdatingThis
                      ? 'cursor-not-allowed border border-[#bad7f2]/60 bg-[#bad7f2]/40 text-[#7ea6cb]'
                      : 'border border-[#bad7f2] bg-[#bad7f2] text-[#1f2f5f] hover:bg-[#a6cdef]'
                  }`}
                >
                  {isUpdatingThis ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#36577a]">
              {comment.content}
            </p>
          )}
        </div>

        {!isEditing ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[10px] uppercase tracking-[0.28em] text-[#4e6e8e]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  void handleToggleCommentLike(comment)
                }}
                disabled={isCommentLikePending}
                aria-label={isCommentLiked ? '좋아요 취소' : '좋아요'}
                title={isCommentLiked ? '좋아요 취소' : '좋아요'}
                className={`flex items-center justify-center rounded-full border px-3 py-1 text-base transition ${
                  isCommentLikePending
                    ? 'cursor-not-allowed border-[#bad7f2]/60 bg-[#bad7f2]/30 text-[#7ea6cb]'
                    : isCommentLiked
                    ? 'border-[#e25555]/50 bg-[#ffe2e8] text-[#e25555]'
                    : 'border-[#bad7f2]/60 text-[#e25555] hover:bg-[#bad7f2]/30'
                }`}
              >
                ❤️
              </button>
              <span className="text-[11px] font-semibold tracking-[0.2em] text-[#36577a]">
                {commentLikesCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAuthor ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      handleStartEdit(comment)
                    }}
                    className="rounded-full border border-[#bad7f2]/60 px-3 py-1 transition hover:bg-[#bad7f2]/35"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void handleDeleteComment(comment.id)
                    }}
                    disabled={isDeletingThis}
                    className={`rounded-full border px-3 py-1 transition ${
                      isDeletingThis
                        ? 'cursor-not-allowed border-[#bad7f2]/60 bg-[#bad7f2]/30 text-[#7ea6cb]'
                        : 'border-red-200 text-red-600 hover:bg-red-100'
                    }`}
                  >
                    {isDeletingThis ? '삭제 중...' : '삭제'}
                  </button>
                </>
              ) : null}
              {isReplyingHere ? (
                <button
                  type="button"
                  onClick={handleCancelReply}
                  className="rounded-full border border-[#bad7f2]/60 px-3 py-1 transition hover:bg-[#bad7f2]/35"
                >
                  답글 취소
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleStartReply(comment.id)
                  }}
                  className="rounded-full border border-[#bad7f2]/60 px-3 py-1 transition hover:bg-[#bad7f2]/35"
                >
                  답글
                </button>
              )}
            </div>
          </div>
        ) : null}

        {isReplyingHere ? (
          <form
            onSubmit={(event) => {
              void handleSubmitReply(event, comment.id)
            }}
            className="mt-5 space-y-3 rounded-[18px] border border-[#bad7f2]/55 bg-white/90 px-4 py-4"
          >
            <textarea
              value={replyInput}
              onChange={(event) => setReplyInput(event.target.value)}
              rows={3}
              maxLength={1000}
              disabled={isSubmittingReply}
              className="w-full rounded-[16px] border border-[#bad7f2]/60 bg-white/95 px-3 py-2 text-sm text-[#1f2f5f] outline-none transition focus:border-[#1f2f5f] disabled:cursor-not-allowed"
              placeholder="답글을 남겨보세요."
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelReply}
                disabled={isSubmittingReply}
                className="rounded-full border border-[#bad7f2]/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#4e6e8e] transition hover:bg-[#bad7f2]/30 disabled:cursor-not-allowed"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmittingReply}
                className={`rounded-full px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] transition ${
                  isSubmittingReply
                    ? 'cursor-not-allowed border border-[#bad7f2]/60 bg-[#bad7f2]/40 text-[#7ea6cb]'
                    : 'border border-[#bad7f2] bg-[#bad7f2] text-[#1f2f5f] hover:bg-[#a6cdef]'
                }`}
              >
                {isSubmittingReply ? '등록 중...' : '답글 등록'}
              </button>
            </div>
          </form>
        ) : null}

        {replies.length > 0 ? (
          <ul className="mt-5 space-y-4 border-l border-[#bad7f2]/45 pl-5">
            {replies.map((reply) => renderCommentItem(reply, depth + 1))}
          </ul>
        ) : null}
      </li>
    )
  }

  // const headerActions = (
  //   <BoardHeaderActions onCompose={handleClickWrite} canCompose={canWrite} />
  // )
  // 헤더에는 프로필/메뉴만, 글작성 버튼은 카테고리 아래 슬롯으로 이동
  const headerActions = <BoardHeaderActions canCompose={canWrite} />

  // 카테고리 아래-줄(우측)에 들어갈 '글 작성' 버튼
  const composeBelowTabs = (
    <button
      type="button"
      onClick={handleClickWrite}
      disabled={!canWrite}
      className={
        'rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ' +
        (!canWrite
          ? 'cursor-not-allowed border-[#bad7f2]/40 text-[#bad7f2]/60 bg-white/70'
          : 'border-[#bad7f2] text-[#1f2f5f] shadow-[0_12px_32px_-18px_rgba(31,47,95,0.2)] hover:bg-[#bad7f2] hover:text-white')
      }
    >
      글 작성
    </button>
  )

  const renderBody = (): JSX.Element => {
    if (loading) {
      return (
        <div className="rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-8 py-6 text-center text-sm font-medium tracking-[0.35em] text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          게시글을 불러오는 중이에요...
        </div>
      )
    }

    if (error || !post) {
      return (
        <div className="space-y-4 rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-10 py-8 text-center text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
          <p>{error ?? '게시글을 찾을 수 없어요.'}</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
          >
            목록으로 돌아가기
          </Link>
        </div>
      )
    }

    const postLikesCount = post.likes?.length ?? 0
    const postLikedByUser = currentUser
      ? post.likes.includes(currentUser.id)
      : false
    return (
      <div className="space-y-8">
        <article className="rounded-[32px] border border-[#bad7f2]/60 bg-white/90 p-10 shadow-[0_24px_60px_-40px_rgba(31,47,95,0.22)]">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
            >
              목록으로
            </Link>
            {canEditPost ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClickEdit}
                  className="rounded-full border border-[#bad7f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2]/60 hover:text-[#1f2f5f]"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void handleClickDelete()
                  }}
                  disabled={isDeleting}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
                    isDeleting
                      ? 'cursor-not-allowed border-[#bad7f2]/60 bg-[#bad7f2]/30 text-[#7ea6cb]'
                      : 'border-red-200 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            ) : null}
          </div>
          <div className="mt-6 text-xs font-semibold uppercase tracking-[0.35em] text-[#36577a]">
            {category?.name ?? '기타'}
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#1f2f5f]">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap gap-6 text-xs uppercase tracking-[0.35em] text-[#4e6e8e]">
            <span className="flex items-center gap-3">
              {post.authorAvatarUrl ? (
                <img
                  src={post.authorAvatarUrl}
                  alt={`${post.author} 프로필 이미지`}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bad7f2]/60 text-[11px] font-semibold text-[#1f2f5f]">
                  {(post.author?.slice(0, 1) ?? '?').toUpperCase()}
                </span>
              )}
              <span>{post.author ?? '알 수 없음'}</span>
            </span>
            {formattedDate ? <span>{formattedDate}</span> : null}
          </div>

          {post.tags && post.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-[#1f2f5f]">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-[#bad7f2]/55 bg-[#bad7f2]/30 px-3 py-1"
                >
                  #{tag}
                </li>
              ))}
            </ul>
          ) : null}

          {/* <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void handleTogglePostLike()
              }}
              disabled={isTogglingPostLike}
              aria-label={postLikedByUser ? '좋아요 취소' : '좋아요'}
              title={postLikedByUser ? '좋아요 취소' : '좋아요'}
              className={`flex items-center justify-center rounded-full border px-4 py-2 text-lg transition ${
                isTogglingPostLike
                  ? 'cursor-not-allowed border-[#bad7f2]/60 bg-[#bad7f2]/30 text-[#7ea6cb]'
                  : postLikedByUser
                      ? 'border-[#e25555]/50 bg-[#ffe2e8] text-[#e25555]'
                      : 'border-[#bad7f2]/60 text-[#e25555] hover:bg-[#bad7f2]/30'
              }`}
            >
              ❤️
            </button>
            <span className="text-sm font-semibold text-[#36577a]">{postLikesCount}</span>
          </div>

          <div
            className="prose prose-slate mt-10 max-w-none text-[#36577a]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          /> */}
          <div
            className="prose prose-slate mt-10 max-w-none text-[#36577a]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-10 border-t border-[#bad7f2]/40 pt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void handleTogglePostLike()
              }}
              disabled={isTogglingPostLike}
              aria-label={postLikedByUser ? '좋아요 취소' : '좋아요'}
              title={postLikedByUser ? '좋아요 취소' : '좋아요'}
              className={`flex items-center justify-center rounded-full border px-4 py-2 text-lg transition ${
                isTogglingPostLike
                  ? 'cursor-not-allowed border-[#bad7f2]/60 bg-[#bad7f2]/30 text-[#7ea6cb]'
                  : postLikedByUser
                  ? 'border-[#e25555]/50 bg-[#ffe2e8] text-[#e25555]'
                  : 'border-[#bad7f2]/60 text-[#e25555] hover:bg-[#bad7f2]/30'
              }`}
            >
              ❤️
            </button>
            <span className="text-sm font-semibold text-[#36577a]">
              {postLikesCount}
            </span>
          </div>
        </article>

        <section className="rounded-[32px] border border-[#bad7f2]/60 bg-white/90 p-8 shadow-[0_24px_60px_-40px_rgba(31,47,95,0.18)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold uppercase tracking-[0.35em] text-[#1f2f5f]">
              댓글
              <span className="ml-2 text-sm font-normal text-[#4e6e8e] tracking-[0.2em]">
                ({comments.length})
              </span>
            </h2>
            <button
              type="button"
              onClick={() => {
                setCommentActionError(null)
                void loadComments()
              }}
              className="rounded-full border border-[#bad7f2]/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#36577a] transition hover:bg-[#bad7f2]/40"
              disabled={commentsLoading}
            >
              {commentsLoading ? '로딩 중' : '새로고침'}
            </button>
          </div>

          {commentActionError ? (
            <p className="mt-4 rounded-[18px] border border-red-200 bg-red-100/60 px-4 py-3 text-sm text-red-700">
              {commentActionError}
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            {commentsLoading ? (
              <div className="rounded-[24px] border border-[#bad7f2]/55 bg-white/85 px-6 py-4 text-center text-sm text-[#36577a]">
                댓글을 불러오는 중이에요...
              </div>
            ) : commentsError ? (
              <div className="space-y-3 rounded-[24px] border border-red-200 bg-red-100/60 px-6 py-4 text-sm text-red-700">
                <p>{commentsError}</p>
                <button
                  type="button"
                  onClick={() => {
                    void loadComments()
                  }}
                  className="inline-flex items-center justify-center rounded-full border border-red-300 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-red-600 transition hover:bg-red-200/70"
                >
                  다시 시도
                </button>
              </div>
            ) : topLevelComments.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#bad7f2]/55 bg-white/70 px-6 py-8 text-center text-sm text-[#36577a]">
                아직 댓글이 없어요. 첫 댓글을 남겨보세요.
              </div>
            ) : (
              <ul className="space-y-5">
                {topLevelComments.map((comment) => renderCommentItem(comment))}
              </ul>
            )}
          </div>

          <div className="mt-8 border-t border-[#bad7f2]/50 pt-6">
            {authToken ? (
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#36577a]">
                  댓글 작성하기
                  <textarea
                    value={commentInput}
                    onChange={(event) => {
                      setCommentInput(event.target.value)
                      if (commentSubmitError) {
                        setCommentSubmitError(null)
                      }
                    }}
                    rows={4}
                    className="mt-3 w-full rounded-[18px] border border-[#bad7f2]/60 bg-white/90 px-4 py-3 text-sm text-[#1f2f5f] outline-none transition focus:border-[#1f2f5f]"
                    placeholder="따뜻한 응원이나 후기를 남겨주세요."
                    maxLength={1000}
                  />
                </label>
                {commentSubmitError ? (
                  <p className="text-sm text-red-600">{commentSubmitError}</p>
                ) : null}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] transition ${
                      isSubmittingComment
                        ? 'cursor-not-allowed border border-[#bad7f2]/60 bg-[#bad7f2]/40 text-[#7ea6cb]'
                        : 'border border-[#bad7f2] bg-[#bad7f2] text-[#1f2f5f] hover:bg-[#a6cdef]'
                    }`}
                  >
                    {isSubmittingComment ? '등록 중...' : '댓글 등록'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-[24px] border border-dashed border-[#bad7f2]/55 bg-white/70 px-6 py-5 text-sm text-[#36577a]">
                <p>로그인 후 댓글을 작성할 수 있어요.</p>
                <button
                  type="button"
                  onClick={() => {
                    onRequireAuth(`/posts/${post.id}`)
                  }}
                  className="rounded-full border border-[#bad7f2] px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
                >
                  로그인하러 가기
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }

  if (loading) {
    return (
      <BoardLayout
        title="RoamLog"
        categories={categories.map(({ id, name }) => ({ id, name }))}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        searchValue={searchValue}
        onSearchChange={onChangeSearch}
        onSearchSubmit={onSubmitSearch}
        onResetSearch={onResetSearch}
        isSearching={isSearching}
        searchPlaceholder="제목, 내용, 태그 검색"
        searchDisabled={searchDisabled}
        actionSlot={headerActions}
        belowTabsActionSlot={composeBelowTabs}
      >
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-8 py-6 text-center text-sm font-medium tracking-[0.35em] text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
            게시글을 불러오는 중이에요...
          </div>
        </div>
      </BoardLayout>
    )
  }

  if (error || !post) {
    return (
      <BoardLayout
        title="RoamLog"
        categories={categories.map(({ id, name }) => ({ id, name }))}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleSelectCategory}
        searchValue={searchValue}
        onSearchChange={onChangeSearch}
        onSearchSubmit={onSubmitSearch}
        onResetSearch={onResetSearch}
        isSearching={isSearching}
        searchPlaceholder="제목, 내용, 태그 검색"
        searchDisabled={searchDisabled}
        actionSlot={headerActions}
        belowTabsActionSlot={composeBelowTabs}
      >
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="space-y-4 rounded-[32px] border border-[#bad7f2]/55 bg-white/85 px-10 py-8 text-center text-[#36577a] shadow-[0_26px_60px_-38px_rgba(31,47,95,0.18)]">
            <p>{error ?? '게시글을 찾을 수 없어요.'}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-[#bad7f2] px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#1f2f5f] transition hover:bg-[#bad7f2] hover:text-[#1f2f5f]/80"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </BoardLayout>
    )
  }

  return (
    <BoardLayout
      title="RoamLog"
      categories={categories.map(({ id, name }) => ({ id, name }))}
      selectedCategoryId={selectedCategoryId}
      onSelectCategory={handleSelectCategory}
      searchValue={searchValue}
      onSearchChange={onChangeSearch}
      onSearchSubmit={onSubmitSearch}
      onResetSearch={onResetSearch}
      isSearching={isSearching}
      searchPlaceholder="제목, 내용, 태그 검색"
      searchDisabled={searchDisabled}
      actionSlot={headerActions}
    >
      <div className="mx-auto max-w-4xl space-y-8">{renderBody()}</div>
    </BoardLayout>
  )
}

export default PostDetailPage
