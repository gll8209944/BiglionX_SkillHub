'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, ThumbsUp, Edit2, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  rating?: number | null;
  upvotes: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  parentId?: string | null;
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
  replies?: Comment[];
  _count?: {
    replies: number;
  };
}

interface SkillRatingProps {
  skillId: string;
  currentRating?: number;
  reviewCount?: number;
  onRatingSubmit?: (rating: number) => void;
}

export function SkillRating({ 
  currentRating = 0, 
  reviewCount = 0,
  onRatingSubmit 
}: Omit<SkillRatingProps, 'skillId'>) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    onRatingSubmit?.(rating);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-colors"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRatingClick(star)}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoverRating || selectedRating || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {currentRating > 0 ? (
          <>
            <span className="font-medium text-foreground">{currentRating.toFixed(1)}</span>
            <span> / 5</span>
            <span className="ml-2">({reviewCount} 条评价)</span>
          </>
        ) : (
          <span>暂无评价</span>
        )}
      </div>
    </div>
  );
}

interface CommentFormProps {
  skillId: string;
  parentId?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({ 
  skillId, 
  parentId, 
  onSubmit,
  onCancel,
  placeholder = "分享你的想法..."
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/skills/${skillId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          rating: parentId ? undefined : rating, // 只有顶级评论可以评分
          parentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      setContent('');
      setRating(undefined);
      onSubmit?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('提交评论失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!parentId && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">评分：</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-colors"
              >
                <Star
                  className={`w-5 h-5 ${
                    star <= (rating || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
      
      <Textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-25"
        disabled={isSubmitting}
      />
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button 
          type="submit" 
          size="sm" 
          disabled={!content.trim() || isSubmitting}
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? '提交中...' : '发表评论'}
        </Button>
      </div>
    </form>
  );
}

interface CommentItemProps {
  comment: Comment;
  skillId: string;
  currentUserId?: string;
  onReply?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export function CommentItem({ 
  comment, 
  skillId,
  currentUserId,
  onReply,
  onDelete,
  onUpdate
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [upvotes, setUpvotes] = useState(comment.upvotes);

  const handleUpvote = async () => {
    try {
      const response = await fetch(`/api/comments/${comment.id}/upvote`, {
        method: 'POST',
      });

      if (response.ok) {
        setUpvotes(upvotes + 1);
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  const isAuthor = currentUserId === comment.user.id;

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={comment.user.image || undefined} />
          <AvatarFallback>
            {comment.user.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {comment.user.name || '匿名用户'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: zhCN,
              })}
            </span>
            {comment.isEdited && (
              <Badge variant="secondary" className="text-xs">
                已编辑
              </Badge>
            )}
          </div>

          {(() => { const cr = comment.rating; return cr != null ? (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= cr
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          ) : null; })()}

          <div className="text-sm whitespace-pre-wrap">{comment.content}</div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={handleUpvote}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {upvotes}
            </Button>

            {!comment.parentId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setIsReplying(!isReplying)}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                回复
              </Button>
            )}

            {isAuthor && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  编辑
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-muted-foreground hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  删除
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="ml-13">
          <CommentForm
            skillId={skillId}
            parentId={comment.id}
            placeholder={`回复 ${comment.user.name || '匿名用户'}...`}
            onSubmit={() => {
              setIsReplying(false);
              onReply?.();
            }}
            onCancel={() => setIsReplying(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-13 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              skillId={skillId}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentSectionProps {
  skillId: string;
  currentUserId?: string;
}

export function CommentSection({ skillId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'most_upvoted'>('newest');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/skills/${skillId}/comments?page=${page}&sortBy=${sortBy}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [skillId, page, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">评论</h3>
        <select
          value={sortBy}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'newest' | 'oldest' | 'highest' | 'most_upvoted')}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="newest">最新</option>
          <option value="oldest">最早</option>
          <option value="highest">最高评分</option>
          <option value="most_upvoted">最多点赞</option>
        </select>
      </div>

      <CommentForm
        skillId={skillId}
        onSubmit={fetchComments}
      />

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          加载中...
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>暂无评论，成为第一个评论的人吧！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              skillId={skillId}
              currentUserId={currentUserId}
              onReply={fetchComments}
              onDelete={fetchComments}
              onUpdate={fetchComments}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            上一页
          </Button>
          <span className="flex items-center px-4 text-sm">
            第 {page} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
