// app/feed/page.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { authFetch, getCurrentUser, BACKEND_HOST } from "@/lib/api"
import CommentSection from "@/app/posts/components/CommentSection"
import PostForm from "@/app/posts/components/PostForm"
import { useRouter } from "next/navigation"
import Chatbot from "./components/Chatbot";


interface User {
  id: number
  username: string
  phoneNumber?: string
  phone?: string
}

interface Comment {
  id: number
  content: string
  authorUsername: string
  createdAt: string
}

interface Post {
  id: number
  title: string
  description: string
  instructorId: number
  instructorUsername: string
  mediaUrls: string[]
  comments: Comment[]
  likeCount: number
  createdAt: string
}

export default function FeedPage() {
  const [me, setMe] = useState<User | null>(null)
  const [instructors, setInstructors] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [followedIds, setFollowedIds] = useState<number[]>([])
  const router = useRouter()
  const followBarRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    const bar = followBarRef.current;
    if (bar) bar.scrollBy({ left: -bar.offsetWidth, behavior: "smooth" });
  };
  const scrollRight = () => {
    const bar = followBarRef.current;
    if (bar) bar.scrollBy({ left: bar.offsetWidth, behavior: "smooth" });
  };

  /* -------- initial data load -------- */
  useEffect(() => {
    ;(async () => {
      try {
        const current = await getCurrentUser()
        if (!current) return
        setMe(current)

        const feedPosts = await authFetch<Post[]>("/posts/feed", { method: "GET" })
        const initFollows = Array.from(
          new Set(feedPosts.map((p) => p.instructorId))
        ).filter((id) => id !== current.id)
        setFollowedIds(initFollows)

        const allUsers = await authFetch<User[]>("/users", { method: "GET" })
        setInstructors(allUsers)

        const all = await authFetch<Post[]>("/posts/feed", { method: "GET" })
        const safe = all.map((p) => ({
          ...p,
          instructorId: Number(p.instructorId),
          mediaUrls: p.mediaUrls || [],
          comments: p.comments || [],
        }))
        setPosts(safe)
      } catch (err) {
        console.error("Error loading feed data:", err)
      }
    })()
  }, [])

  /* -------- helpers -------- */
  const toggleFollow = (userId: number) => {
    setFollowedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const visiblePosts = posts
    .filter(
      (p) =>
        (me && p.instructorId === me.id) || followedIds.includes(p.instructorId)
    )
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

  const handleLike = async (postId: number) => {
    try {
      await authFetch(`/posts/${postId}/like`, { method: "POST" })
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likeCount: p.likeCount + 1 } : p
        )
      )
    } catch (err) {
      console.error("Like failed:", err)
    }
  }

  /* -------- render -------- */
  return (
    <div className="flex max-w-5xl gap-8 py-8 mx-auto">
      {/* ------- main feed (75 %) ------- */}
      <div className="flex-1 space-y-8">
        {/* follow bar */}
        <div className="relative w-full overflow-hidden">
        {/* Left arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 p-2 -translate-y-1/2 bg-white rounded-full shadow top-1/2"
        >
          ‹
        </button>

        {/* Visible window: exactly 5 cards wide */}
        <div
          ref={followBarRef}
          className="flex space-x-4 overflow-x-hidden"
          style={{ maxWidth: "calc(5*10rem + 4*1rem)" }}
        >
          {instructors
            .filter((u) => u.id !== me?.id)
            .map((u) => (
            <div
              key={u.id}
              className="flex flex-col items-center flex-shrink-0 w-40 p-4 bg-white border rounded-lg shadow"
            >
              <div className="flex items-center justify-center w-16 h-16 text-2xl font-bold bg-gray-300 rounded-full">
                {u.username.charAt(0).toUpperCase()}
              </div>

              <p className="mt-2 text-sm font-semibold text-gray-800">
                {u.username}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {u.phoneNumber ?? u.phone ?? "—"}
              </p>

              <button
                onClick={() => toggleFollow(u.id)}
                className={
                  followedIds.includes(u.id)
                    ? "w-full mt-3 px-3 py-1 rounded bg-red-500 text-white text-xs"
                    : "w-full mt-3 px-3 py-1 rounded bg-blue-500 text-white text-xs"
                }
              >
                {followedIds.includes(u.id) ? "Unfollow" : "Follow"}
              </button>
            </div>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 p-2 -translate-y-1/2 bg-white rounded-full shadow top-1/2"
        >
          ›
        </button>
      </div>

        {/* posts */}
        {visiblePosts.map((p) => (
          <div key={p.id} className="p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold">
              {p.title} — {p.instructorUsername}
            </h2>
            <p className="mt-2">{p.description}</p>

            {p.mediaUrls.length > 0 && (
              <div className="flex mt-4 space-x-2 overflow-x-auto">
                {p.mediaUrls.map((path) => (
                  <img
                    key={path}
                    src={`${BACKEND_HOST}${path}`}
                    alt="post media"
                    className="object-cover w-32 h-32 rounded"
                  />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => handleLike(p.id)}
                className="flex items-center space-x-1"
              >
                ❤️ <span>{p.likeCount}</span>
              </button>
              <span>Comments: {p.comments.length}</span>
            </div>

            <div className="mt-6">
              <CommentSection postId={p.id} postOwnerId={p.instructorId} />
            </div>
          </div>
        ))}
      </div>

      {/* ------- post form sidebar (25 %) ------- */}
      <aside className="hidden w-1/4 lg:block">
        <PostForm
          onNewPost={(post) =>
            setPosts((prev) => [
              {
                ...post,
                instructorId: Number(post.instructorId),
                mediaUrls: post.mediaUrls || [],
                comments: post.comments || [],
                likeCount: post.likeCount || 0,
                createdAt: post.createdAt || new Date().toISOString(),
              },
              ...prev,
            ])
          }
        />
        {/* ─── Chatbot widget ─── */}
        <Chatbot />
      </aside>
    </div>
  )
}
