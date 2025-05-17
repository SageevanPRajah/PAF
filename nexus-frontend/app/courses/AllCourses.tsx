'use client'

import React, { useEffect, useState } from 'react'
import { authFetch } from '@/lib/api'
import { List, X } from 'lucide-react'

export interface Module {
  id: number
  title: string
  content: string
}

export interface Course {
  id: number
  title: string
  instructorUsername: string
  modules: Module[]
}

interface AllCoursesProps {
  onViewModules: (mods: Module[]) => void
  currentUsername: string
}

export default function AllCourses({ onViewModules, currentUsername }: AllCoursesProps) {
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [subs, setSubs] = useState<Set<number>>(new Set())

  useEffect(() => {
    authFetch('/courses/all', { method: 'GET' })
      .then(data => setAllCourses(data))
      .catch(() => { /* handle error */ })
  }, [])

  const toggleSub = (id: number) => {
    const next = new Set(subs)
    next.has(id) ? next.delete(id) : next.add(id)
    setSubs(next)
  }

  // filter out your own courses
  const others = allCourses.filter(
    c => c.instructorUsername !== currentUsername
  )

  return (
    <aside className="col-span-1 space-y-4">
      <h2 className="text-xl font-semibold">All Courses</h2>
      {others.map(c => (
        <div key={c.id} className="bg-white rounded shadow p-4">
          <h3 className="font-semibold">{c.title}</h3>
          <p className="text-sm text-gray-500 mb-2">By {c.instructorUsername}</p>

          {subs.has(c.id) ? (
            <button
              onClick={() => onViewModules(c.modules)}
              className="flex items-center gap-1 text-cyan-600 hover:underline"
            >
              <List size={16}/> View Modules
            </button>
          ) : (
            <button
              onClick={() => toggleSub(c.id)}
              className="text-green-600 hover:underline"
            >
              Subscribe
            </button>
          )}
        </div>
      ))}
    </aside>
  )
}
