'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { authFetch } from '@/lib/api'

interface ModuleRequest {
  title: string
  content: string
}

interface CourseResponse {
  title: string
  description: string
  modules?: { id: number; title: string; content: string }[]
}

export default function EditCoursePage() {
    const router = useRouter()
    const params = useParams() as { id: string }

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [modules, setModules] = useState<ModuleRequest[]>([])
    const [error, setError] = useState('')

    // Load existing course data including modules
    const fetchCourse = async () => {
        try {
            const data = await authFetch<CourseResponse>(`/courses/${params.id}`, { method: 'GET' })
            setTitle(data.title)
            setDescription(data.description)
            if (data.modules) {
                setModules(
                    data.modules.map(m => ({ title: m.title, content: m.content }))
                )
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load course')
        }
    }

    useEffect(() => {
        fetchCourse()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleAddModule = () => {
        setModules(prev => [...prev, { title: '', content: '' }])
    }

    const handleRemoveModule = (index: number) => {
        setModules(prev => prev.filter((_, i) => i !== index))
    }

    const handleModuleChange = (
        index: number,
        field: keyof ModuleRequest,
        value: string
    ) => {
        setModules(prev => {
            const newMods = [...prev]
            newMods[index] = { ...newMods[index], [field]: value }
            return newMods
        })
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        try {
            await authFetch(`/courses/${params.id}`, {
                method: 'PUT',
                body: { title, description, modules },
            })
            router.push('/courses')
        } catch (err: any) {
            setError(err.message || 'Failed to update course')
        }
    }

    return (
        <div className="mx-auto max-w-2xl mt-10 p-4 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Edit Course</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                    <label className="block mb-1">Title</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Description</label>
                    <textarea
                        className="w-full border p-2 rounded"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold">Modules</h2>
                        <button
                            type="button"
                            onClick={handleAddModule}
                            className="text-cyan-600 hover:text-cyan-800"
                        >
                            Add Module
                        </button>
                    </div>
                    {modules.map((mod, idx) => (
                        <div key={idx} className="border p-4 rounded mb-4 relative">
                            <button
                                type="button"
                                onClick={() => handleRemoveModule(idx)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                            >
                                Remove
                            </button>
                            <div className="mb-2">
                                <label className="block mb-1">Module Title</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded"
                                    value={mod.title}
                                    onChange={e => handleModuleChange(idx, 'title', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Module Content</label>
                                <textarea
                                    className="w-full border p-2 rounded"
                                    value={mod.content}
                                    onChange={e => handleModuleChange(idx, 'content', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Update Course
                </button>
            </form>
        </div>
    )
}
