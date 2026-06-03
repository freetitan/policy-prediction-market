'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ReputationBadge } from './reputation-badge'
import { useToast } from '@/hooks/use-toast'
import { MessageSquare, ThumbsUp, Reply, Send, User, Trash2, Edit2, X } from 'lucide-react'
import type { CommentWithDetails, Profile } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface CommentsSectionProps {
  marketId: string
  userProfile: Profile | null
}

export function CommentsSection({ marketId, userProfile }: CommentsSectionProps) {
  const [comments, setComments] = useState<CommentWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchComments()

    // 订阅实时更新
    const channel = supabase
      .channel(`comments:${marketId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `market_id=eq.${marketId}`
      }, () => {
        fetchComments()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [marketId, supabase])

  const fetchComments = async () => {
    const { data: commentsData } = await supabase
      .from('comments_with_details')
      .select('*')
      .eq('market_id', marketId)
      .order('created_at', { ascending: false })

    if (commentsData) {
      // 获取用户的点赞状态
      if (userProfile) {
        const { data: likes } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', userProfile.id)

        const likedCommentIds = new Set(likes?.map(l => l.comment_id) || [])
        
        const commentsWithLikes = commentsData.map(c => ({
          ...c,
          user_liked: likedCommentIds.has(c.id)
        }))

        // 组织评论树结构
        const commentMap = new Map<string, CommentWithDetails>()
        commentsWithLikes.forEach(comment => {
          commentMap.set(comment.id, { ...comment, replies: [] })
        })

        const rootComments: CommentWithDetails[] = []
        commentsWithLikes.forEach(comment => {
          if (comment.parent_id) {
            const parent = commentMap.get(comment.parent_id)
            if (parent) {
              parent.replies = parent.replies || []
              parent.replies.push(commentMap.get(comment.id)!)
            }
          } else {
            rootComments.push(commentMap.get(comment.id)!)
          }
        })

        setComments(rootComments)
      } else {
        setComments(commentsData as CommentWithDetails[])
      }
    }
    setLoading(false)
  }

  const handleSubmitComment = async () => {
    if (!userProfile) {
      toast({
        title: '请先登录',
        description: '登录后才能发表评论',
        variant: 'destructive'
      })
      return
    }

    if (!newComment.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert({
        market_id: marketId,
        user_id: userProfile.id,
        content: newComment.trim()
      })

    setSubmitting(false)

    if (error) {
      toast({
        title: '评论失败',
        description: error.message,
        variant: 'destructive'
      })
    } else {
      setNewComment('')
      toast({
        title: '评论成功',
        description: '你的评论已发布'
      })
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!userProfile || !replyContent.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .insert({
        market_id: marketId,
        user_id: userProfile.id,
        parent_id: parentId,
        content: replyContent.trim()
      })

    setSubmitting(false)

    if (error) {
      toast({
        title: '回复失败',
        description: error.message,
        variant: 'destructive'
      })
    } else {
      setReplyingTo(null)
      setReplyContent('')
      toast({
        title: '回复成功'
      })
    }
  }

  const handleLike = async (commentId: string, currentlyLiked: boolean) => {
    if (!userProfile) {
      toast({
        title: '请先登录',
        variant: 'destructive'
      })
      return
    }

    if (currentlyLiked) {
      // 取消点赞
      await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userProfile.id)
    } else {
      // 点赞
      await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userProfile.id
        })
    }
  }

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return

    setSubmitting(true)
    const { error } = await supabase
      .from('comments')
      .update({ content: editContent.trim() })
      .eq('id', commentId)
      .eq('user_id', userProfile?.id)

    setSubmitting(false)

    if (error) {
      toast({
        title: '编辑失败',
        description: error.message,
        variant: 'destructive'
      })
    } else {
      setEditingComment(null)
      setEditContent('')
      toast({
        title: '编辑成功'
      })
    }
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userProfile?.id)

    if (error) {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive'
      })
    } else {
      toast({
        title: '删除成功'
      })
    }
  }

  const renderComment = (comment: CommentWithDetails, depth: number = 0) => {
    const isEditing = editingComment === comment.id
    const isReplying = replyingTo === comment.id
    const isOwner = userProfile?.id === comment.user_id

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="rounded-lg border border-border bg-card p-4">
          {/* 用户信息 */}
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground">
                  {comment.user_display_name || '匿名用户'}
                </span>
                {comment.user_rank_tier && (
                  <ReputationBadge
                    rankTier={comment.user_rank_tier as any}
                    size="sm"
                  />
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { 
                    addSuffix: true,
                    locale: zhCN 
                  })}
                </span>
                {comment.is_edited && (
                  <Badge variant="outline" className="text-xs">
                    已编辑
                  </Badge>
                )}
              </div>

              {/* 评论内容 */}
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="编辑评论..."
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(comment.id)}
                      disabled={submitting || !editContent.trim()}
                    >
                      保存
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingComment(null)
                        setEditContent('')
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-foreground whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              )}

              {/* 操作按钮 */}
              <div className="mt-3 flex items-center gap-4 flex-wrap">
                <button
                  onClick={() => handleLike(comment.id, comment.user_liked || false)}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    comment.user_liked
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  disabled={!userProfile}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{comment.likes_count || 0}</span>
                </button>

                {depth < 2 && (
                  <button
                    onClick={() => {
                      if (!userProfile) {
                        toast({
                          title: '请先登录',
                          variant: 'destructive'
                        })
                        return
                      }
                      setReplyingTo(comment.id)
                    }}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    <span>回复</span>
                  </button>
                )}

                {isOwner && !isEditing && (
                  <>
                    <button
                      onClick={() => {
                        setEditingComment(comment.id)
                        setEditContent(comment.content)
                      }}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>编辑</span>
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-1 text-sm text-destructive hover:text-destructive/80 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>删除</span>
                    </button>
                  </>
                )}
              </div>

              {/* 回复输入框 */}
              {isReplying && (
                <div className="mt-3 space-y-2">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="写下你的回复..."
                    className="min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={submitting || !replyContent.trim()}
                    >
                      <Send className="mr-1 h-4 w-4" />
                      回复
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 递归渲染回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-0">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          讨论 ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 发表评论 */}
        {userProfile ? (
          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="分享你的观点和分析..."
              className="min-h-[100px]"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {newComment.length}/5000
              </span>
              <Button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
              >
                <Send className="mr-2 h-4 w-4" />
                发表评论
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              登录后即可参与讨论
            </p>
          </div>
        )}

        {/* 评论列表 */}
        <div className="space-y-0">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              加载中...
            </div>
          ) : comments.length > 0 ? (
            comments.map(comment => renderComment(comment))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                还没有评论，来发表第一条吧
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
