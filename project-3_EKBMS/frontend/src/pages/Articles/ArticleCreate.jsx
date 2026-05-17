import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import { Save, Send } from 'lucide-react'
import PageBanner from '../../components/PageBanner'

export default function ArticleCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', content: '', category_id: '', tag_ids: [] })
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/categories/').then(r => setCategories(r.data))
    api.get('/tags/').then(r => setTags(r.data))
  }, [])

  const save = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    if (!form.content.trim() || form.content === '<p><br></p>') { toast.error('Content is required'); return }
    setLoading(true)
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        status,
      }
      const res = await api.post('/articles/', payload)
      toast.success(status === 'draft' ? 'Draft saved!' : 'Article submitted for review!')
      navigate(`/articles/${res.data.id}`)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = id => {
    setForm(f => ({
      ...f,
      tag_ids: f.tag_ids.includes(id) ? f.tag_ids.filter(t => t !== id) : [...f.tag_ids, id]
    }))
  }

  return (
    <Layout>
      <div className="max-w-4xl">
        <PageBanner theme="article-create" title="Create New Article" subtitle="Write and publish knowledge articles">
          <button onClick={() => save('draft')} disabled={loading} className="btn-banner-outline flex items-center gap-2">
            <Save size={16} /> Save Draft
          </button>
          <button onClick={() => save('pending')} disabled={loading} className="btn-banner flex items-center gap-2">
            <Send size={16} /> Submit for Review
          </button>
        </PageBanner>

        <div className="space-y-6">
          <div className="card">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  className="input text-lg"
                  placeholder="Article title…"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="Brief description of the article…"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <ReactQuill
              value={form.content}
              onChange={v => setForm({ ...form, content: v })}
              theme="snow"
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['blockquote', 'code-block'],
                  ['link'],
                  ['clean'],
                ]
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="input"
                value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={`badge cursor-pointer transition-colors ${
                      form.tag_ids.includes(t.id)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
                {tags.length === 0 && <p className="text-sm text-gray-400">No tags available</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
