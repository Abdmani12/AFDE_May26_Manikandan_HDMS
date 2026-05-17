import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import api from '../../api/axios'
import Layout from '../../components/Layout'
import toast from 'react-hot-toast'
import { Save, Send } from 'lucide-react'
import PageBanner from '../../components/PageBanner'

export default function ArticleEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', content: '', category_id: '', tag_ids: [] })
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/articles/${id}`),
      api.get('/categories/'),
      api.get('/tags/'),
    ]).then(([article, cats, tagList]) => {
      const a = article.data
      setForm({
        title: a.title,
        description: a.description || '',
        content: a.content,
        category_id: a.category_id ? String(a.category_id) : '',
        tag_ids: a.tags?.map(t => t.id) || [],
      })
      setCategories(cats.data)
      setTags(tagList.data)
    }).catch(() => toast.error('Failed to load article')).finally(() => setLoading(false))
  }, [id])

  const save = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        content: form.content,
        category_id: form.category_id ? parseInt(form.category_id) : null,
        tag_ids: form.tag_ids,
        status,
      }
      await api.put(`/articles/${id}`, payload)
      toast.success('Article updated!')
      navigate(`/articles/${id}`)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = tagId => {
    setForm(f => ({
      ...f,
      tag_ids: f.tag_ids.includes(tagId) ? f.tag_ids.filter(t => t !== tagId) : [...f.tag_ids, tagId]
    }))
  }

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-4xl">
        <PageBanner theme="article-edit" title="Edit Article" subtitle="Update and refine your article">
          <button onClick={() => save('draft')} disabled={saving} className="btn-banner-outline flex items-center gap-2">
            <Save size={16} /> Save Draft
          </button>
          <button onClick={() => save('pending')} disabled={saving} className="btn-banner flex items-center gap-2">
            <Send size={16} /> Submit for Review
          </button>
        </PageBanner>

        <div className="space-y-6">
          <div className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" className="input text-lg" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input resize-none" rows={2} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
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
              <select className="input" value={form.category_id}
                onChange={e => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="card">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => (
                  <button key={t.id} type="button" onClick={() => toggleTag(t.id)}
                    className={`badge cursor-pointer ${form.tag_ids.includes(t.id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
