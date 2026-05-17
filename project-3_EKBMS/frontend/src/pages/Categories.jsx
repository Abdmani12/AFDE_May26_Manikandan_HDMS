import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, FolderOpen, ChevronRight, X, Check, ArrowRight } from 'lucide-react'
import PageBanner from '../components/PageBanner'

/* ── Keyword → relevant Unsplash image map ── */
const KEYWORD_THEMES = [
  // HR / People / Recruitment
  { keys: ['hr', 'human resource', 'people', 'recruit', 'personnel', 'employee', 'talent', 'workforce', 'staff', 'hiring'],
    img: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(194,65,12,0.78)' },

  // IT / Technology / Software / Computer / Digital
  { keys: ['it', 'tech', 'software', 'computer', 'digital', 'developer', 'coding', 'code', 'programming', 'devops', 'cloud', 'cyber', 'network'],
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(30,64,175,0.82)' },

  // IT Support / Help Desk / Service Desk
  { keys: ['support', 'help desk', 'helpdesk', 'service desk', 'troubleshoot', 'ticket', 'incident'],
    img: 'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(3,105,161,0.80)' },

  // Training / Learning / Education / Onboarding
  { keys: ['training', 'learning', 'education', 'onboard', 'workshop', 'course', 'tutorial', 'skill', 'develop', 'material'],
    img: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(15,118,110,0.82)' },

  // Finance / Accounting / Budget / Payroll
  { keys: ['finance', 'financial', 'account', 'budget', 'payroll', 'tax', 'audit', 'invoice', 'expense', 'revenue', 'economic', 'fiscal'],
    img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(22,101,52,0.80)' },

  // Operations / Process / Workflow / SOP / Procedure
  { keys: ['operation', 'ops', 'process', 'workflow', 'procedure', 'sop', 'logistics', 'supply', 'manufacturing', 'production'],
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(22,101,52,0.82)' },

  // Infrastructure / Network / Server / Data Center
  { keys: ['infrastructure', 'server', 'data center', 'datacenter', 'hardware', 'network', 'cable', 'rack', 'hosting', 'cloud infra'],
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(190,24,93,0.80)' },

  // Security / Compliance / Legal / Policy
  { keys: ['security', 'compliance', 'legal', 'policy', 'regulation', 'gdpr', 'privacy', 'risk', 'audit', 'governance', 'law'],
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(109,40,217,0.82)' },

  // Marketing / Sales / CRM / Customer
  { keys: ['marketing', 'sales', 'crm', 'customer', 'brand', 'campaign', 'social media', 'advertising', 'lead', 'growth'],
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(180,83,9,0.80)' },

  // Product / Design / UX / UI
  { keys: ['product', 'design', 'ux', 'ui', 'user experience', 'interface', 'prototype', 'wireframe', 'creative'],
    img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(67,56,202,0.82)' },

  // Management / Leadership / Strategy / Planning
  { keys: ['management', 'leadership', 'strategy', 'planning', 'executive', 'director', 'admin', 'administration'],
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(31,41,55,0.85)' },

  // Data / Analytics / Reports / BI
  { keys: ['data', 'analytic', 'report', 'bi', 'business intelligence', 'dashboard', 'metric', 'kpi', 'insight', 'statistics'],
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(3,105,161,0.82)' },

  // Knowledge / Documentation / Wiki / Guide
  { keys: ['knowledge', 'documentation', 'wiki', 'guide', 'manual', 'handbook', 'reference', 'article', 'library'],
    img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(109,40,217,0.80)' },

  // Health / Safety / Wellness
  { keys: ['health', 'safety', 'wellness', 'medical', 'wellbeing', 'ergonomic', 'first aid'],
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(15,118,110,0.82)' },

  // Engineering / R&D / Innovation / Science
  { keys: ['engineer', 'r&d', 'research', 'innovation', 'science', 'lab', 'technical', 'mechanical', 'electrical'],
    img: 'https://images.unsplash.com/photo-1581092921461-39b4afe1f756?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(67,56,202,0.80)' },
]

/* Fallback palette for unmatched categories */
const FALLBACK_THEMES = [
  { img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(30,64,175,0.80)' },
  { img: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(67,56,202,0.82)' },
  { img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(180,83,9,0.80)' },
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=75&auto=format&fit=crop', overlay: 'rgba(194,65,12,0.78)' },
]

function getTheme(name = '', fallbackIndex = 0) {
  const lower = name.toLowerCase()
  for (const theme of KEYWORD_THEMES) {
    if (theme.keys.some(k => lower.includes(k))) return theme
  }
  return FALLBACK_THEMES[fallbackIndex % FALLBACK_THEMES.length]
}

/* ── Inline form ── */
function CategoryForm({ initial, onSave, onCancel, categories }) {
  const [form, setForm] = useState(initial || { name: '', description: '', parent_id: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      await onSave({ ...form, parent_id: form.parent_id ? parseInt(form.parent_id) : null })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input type="text" className="input" placeholder="Category name *" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input type="text" className="input" placeholder="Description (optional)" value={form.description || ''}
          onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>
      <select className="input" value={form.parent_id || ''}
        onChange={e => setForm({ ...form, parent_id: e.target.value })}>
        <option value="">No parent (top-level)</option>
        {categories.filter(c => c.id !== initial?.id).map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors disabled:opacity-50">
          <Check size={14} /> {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  )
}

/* ── Category photo-card ── */
function CategoryCard({ cat, index, children: subcats, isAdmin, onEdit, onDelete, editing, onSave, onCancelEdit, allCategories }) {
  const theme = getTheme(cat.name, index)
  const [hovered, setHovered] = useState(false)

  return (
    <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      {editing?.id === cat.id ? (
        <div className="p-4 bg-white border border-gray-200 rounded-2xl">
          <CategoryForm initial={editing} categories={allCategories} onSave={onSave} onCancel={onCancelEdit} />
        </div>
      ) : (
        <>
          {/* Photo hero */}
          <div
            className="relative h-40 bg-cover bg-center cursor-pointer overflow-hidden"
            style={{ backgroundImage: `url(${theme.img})` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Color overlay */}
            <div className="absolute inset-0 transition-opacity duration-300"
              style={{ background: theme.overlay, opacity: hovered ? 0.65 : 0.82 }} />
            {/* Noise texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")", backgroundSize: '150px 150px' }} />
            {/* Decorative ring */}
            <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full border border-white/20 pointer-events-none" />
            <div className="absolute top-3 right-3 w-12 h-12 rounded-full border border-white/15 pointer-events-none" />

            {/* Category info overlay */}
            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center">
                  <FolderOpen size={18} className="text-white" />
                </div>
                {isAdmin && (
                  <div className="flex gap-1.5">
                    <button onClick={() => onEdit(cat)}
                      className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors">
                      <Edit2 size={12} className="text-white" />
                    </button>
                    <button onClick={() => onDelete(cat.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/25 hover:bg-red-500/50 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-colors">
                      <Trash2 size={12} className="text-white" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <Link to={`/articles?category_id=${cat.id}`}
                  className="text-lg font-bold text-white hover:text-white/80 transition-colors leading-tight block">
                  {cat.name}
                </Link>
                {cat.description && (
                  <p className="text-white/65 text-xs mt-0.5 line-clamp-2">{cat.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Subcategories */}
          {subcats.length > 0 && (
            <div className="bg-white border-t border-gray-100 divide-y divide-gray-50">
              {subcats.map((child, ci) => (
                editing?.id === child.id ? (
                  <div key={child.id} className="p-3">
                    <CategoryForm initial={editing} categories={allCategories} onSave={onSave} onCancel={onCancelEdit} />
                  </div>
                ) : (
                  <div key={child.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: getTheme(child.name, index + ci + 1).overlay.replace('0.78', '0.12').replace('0.80', '0.12').replace('0.82', '0.12').replace('0.85', '0.12') }}>
                        <ChevronRight size={11} className="text-gray-500" />
                      </div>
                      <Link to={`/articles?category_id=${child.id}`}
                        className="text-sm font-medium text-gray-700 group-hover:text-primary-600 truncate transition-colors">
                        {child.name}
                      </Link>
                      {child.description && (
                        <span className="text-xs text-gray-400 truncate hidden sm:block">— {child.description}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isAdmin && (
                        <>
                          <button onClick={() => onEdit(child)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-blue-50 flex items-center justify-center transition-all">
                            <Edit2 size={12} className="text-blue-500" />
                          </button>
                          <button onClick={() => onDelete(child.id)}
                            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-red-50 flex items-center justify-center transition-all">
                            <Trash2 size={12} className="text-red-500" />
                          </button>
                        </>
                      )}
                      <Link to={`/articles?category_id=${child.id}`}
                        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md hover:bg-gray-100 flex items-center justify-center transition-all">
                        <ArrowRight size={12} className="text-gray-500" />
                      </Link>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Browse footer */}
          <Link to={`/articles?category_id=${cat.id}`}
            className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100 group">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Browse articles</span>
            <ArrowRight size={14} className="text-gray-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </>
      )}
    </div>
  )
}

/* ── Page ── */
export default function Categories() {
  const { isAdmin } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const fetchCategories = async () => {
    const res = await api.get('/categories/')
    setCategories(res.data)
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const handleCreate = async (data) => {
    try {
      await api.post('/categories/', data)
      toast.success('Category created')
      setShowForm(false)
      fetchCategories()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  const handleUpdate = async (data) => {
    try {
      await api.put(`/categories/${editing.id}`, data)
      toast.success('Category updated')
      setEditing(null)
      fetchCategories()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Articles will become uncategorized.')) return
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted')
      fetchCategories()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  const roots = categories.filter(c => !c.parent_id)
  const childrenOf = id => categories.filter(c => c.parent_id === id)

  return (
    <Layout>
      <PageBanner theme="categories" title="Categories" subtitle="Browse and organize your knowledge base by topic">
        {isAdmin && !showForm && (
          <button onClick={() => setShowForm(true)} className="btn-banner flex items-center gap-2">
            <Plus size={16} /> New Category
          </button>
        )}
      </PageBanner>

      {showForm && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">New Category</h2>
          <CategoryForm categories={categories} onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        </div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-16">
          <FolderOpen size={52} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No categories yet.</p>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={15} /> Create first category
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {roots.map((cat, idx) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              index={idx}
              children={childrenOf(cat.id)}
              isAdmin={isAdmin}
              onEdit={setEditing}
              onDelete={handleDelete}
              editing={editing}
              onSave={handleUpdate}
              onCancelEdit={() => setEditing(null)}
              allCategories={categories}
            />
          ))}
        </div>
      )}
    </Layout>
  )
}
