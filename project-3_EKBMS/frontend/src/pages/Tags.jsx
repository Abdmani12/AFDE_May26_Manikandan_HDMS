import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Trash2, Tag as TagIcon, Hash } from 'lucide-react'
import PageBanner from '../components/PageBanner'

/* Deterministic color from tag name */
const TAG_PALETTES = [
  { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  { bg: 'bg-purple-50', border: 'border-purple-200',  text: 'text-purple-700', dot: 'bg-purple-400' },
  { bg: 'bg-teal-50',   border: 'border-teal-200',    text: 'text-teal-700',   dot: 'bg-teal-400' },
  { bg: 'bg-rose-50',   border: 'border-rose-200',    text: 'text-rose-700',   dot: 'bg-rose-400' },
  { bg: 'bg-amber-50',  border: 'border-amber-200',   text: 'text-amber-700',  dot: 'bg-amber-400' },
  { bg: 'bg-indigo-50', border: 'border-indigo-200',  text: 'text-indigo-700', dot: 'bg-indigo-400' },
  { bg: 'bg-green-50',  border: 'border-green-200',   text: 'text-green-700',  dot: 'bg-green-400' },
  { bg: 'bg-pink-50',   border: 'border-pink-200',    text: 'text-pink-700',   dot: 'bg-pink-400' },
  { bg: 'bg-cyan-50',   border: 'border-cyan-200',    text: 'text-cyan-700',   dot: 'bg-cyan-400' },
  { bg: 'bg-orange-50', border: 'border-orange-200',  text: 'text-orange-700', dot: 'bg-orange-400' },
]

function palette(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return TAG_PALETTES[Math.abs(hash) % TAG_PALETTES.length]
}

export default function Tags() {
  const { isAdmin, isAuthor } = useAuth()
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const fetchTags = () => api.get('/tags/').then(r => setTags(r.data)).finally(() => setLoading(false))
  useEffect(() => { fetchTags() }, [])

  const handleCreate = async e => {
    e.preventDefault()
    if (!newTag.trim()) return
    try {
      await api.post('/tags/', { name: newTag.trim() })
      toast.success('Tag created')
      setNewTag('')
      fetchTags()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  const handleDelete = async id => {
    if (!confirm('Delete this tag?')) return
    setDeleting(id)
    try {
      await api.delete(`/tags/${id}`)
      toast.success('Tag deleted')
      fetchTags()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <Layout>
      <PageBanner theme="tags" title="Tags" subtitle={`${tags.length} tag${tags.length !== 1 ? 's' : ''} in use`} />

      {/* Add tag form */}
      {isAuthor && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Create new tag</p>
          <form onSubmit={handleCreate} className="flex gap-3">
            <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus-within:bg-white focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 transition-all">
              <Hash size={15} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                className="flex-1 outline-none text-sm bg-transparent text-gray-800 placeholder-gray-400"
                placeholder="Tag name (e.g. security, devops, api…)"
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={!newTag.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow transition-all disabled:opacity-40 hover:shadow-md hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #be185d, #9d174d)' }}>
              <Plus size={15} /> Add Tag
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <div className="animate-spin w-9 h-9 border-4 border-pink-500 border-t-transparent rounded-full" />
          <p className="text-sm text-gray-400 font-medium">Loading tags…</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto mb-4">
            <TagIcon size={28} className="text-pink-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-1">No tags yet</h3>
          <p className="text-gray-400 text-sm">Tags help readers discover related articles</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            All Tags — {tags.length} total
          </p>
          <div className="flex flex-wrap gap-2.5">
            {tags.map(tag => {
              const p = palette(tag.name)
              return (
                <div key={tag.id}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${p.bg} ${p.border} hover:shadow-sm transition-all`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot} flex-shrink-0`} />
                  <Link
                    to={`/search?tag_id=${tag.id}`}
                    className={`text-sm font-semibold ${p.text} hover:opacity-80 transition-opacity`}>
                    {tag.name}
                  </Link>
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(tag.id)}
                      disabled={deleting === tag.id}
                      className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-100 ${p.text}`}>
                      <Trash2 size={10} className="text-red-400" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Layout>
  )
}
