'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authFetch, clearTokens } from '@/lib/api'
import { PlusCircle, LogOut, Edit, Trash2, List, X } from 'lucide-react'
import UserProfile from './components/user-profile'

export interface Module {
  id: number
  title: string
  content: string
}

interface Course {
  id: number
  title: string
  description: string
  instructorId: number
  instructorUsername: string
  modules: Module[]
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState('')
  const [username, setUsername] = useState('RoboticsTeacher')
  const [selectedModules, setSelectedModules] = useState<Module[] | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null)

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const data = await authFetch('/courses', { method: 'GET' })
      setCourses(data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses')
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const openModal = (modules: Module[]) => setSelectedModules(modules)
  const closeModal = () => setSelectedModules(null)

  const openDeleteDialog = (id: number) => setDeletingCourseId(id)
  const closeDeleteDialog = () => setDeletingCourseId(null)

  const confirmDelete = async () => {
    if (deletingCourseId === null) return
    try {
      await authFetch(`/courses/${deletingCourseId}`, { method: 'DELETE' })
      setCourses(prev => prev.filter(c => c.id !== deletingCourseId))
    } catch {
      alert('Failed to delete course')
    } finally {
      closeDeleteDialog()
    }
  }

  const handleLogout = () => {
    clearTokens()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Courses</h2>
          <button
            onClick={() => router.push('/courses/create')}
            className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors"
          >
            <PlusCircle size={18} />
            <span>Create New Course</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No courses found. Create your first course to get started!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div
                key={course.id}
                className="relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{course.title}</h3>
                <p className="text-gray-600 mb-4">{course.description}</p>

                {/* View Modules */}
                {course.modules.length > 0 && (
                  <button
                    onClick={() => openModal(course.modules)}
                    className="flex items-center gap-1 text-cyan-600 hover:text-cyan-800 mb-4"
                  >
                    <List size={16} />
                    <span>View Modules</span>
                  </button>
                )}

                {/* Actions */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => router.push(`/courses/${course.id}/edit`)}
                    className="flex items-center gap-1 text-cyan-600 hover:text-cyan-800"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteDialog(course.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modules Modal */}
        {selectedModules && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20 flex items-center justify-center">
            <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg p-6 relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">Modules</h2>
              <div className="space-y-4">
                {selectedModules.map(mod => (
                  <div key={mod.id} className="border-b pb-4">
                    <h3 className="text-lg font-semibold mb-2">{mod.title}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{mod.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingCourseId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center">
            <div className="bg-white w-full max-w-md rounded-lg p-6 relative">
              <button
                onClick={closeDeleteDialog}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
              <p className="mb-6">Are you sure you want to delete this course?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeDeleteDialog}
                  className="px-4 py-2 rounded border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
