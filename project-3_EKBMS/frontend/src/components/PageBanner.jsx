import {
  BookOpen, LayoutDashboard, Search, Bookmark, FolderOpen, Tag,
  CheckSquare, Users, BarChart2, Eye, Edit3, PenLine
} from 'lucide-react'

const THEMES = {
  dashboard: {
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(30,64,175,0.88) 0%, rgba(49,46,129,0.82) 100%)',
    accent: '#60a5fa',
    Icon: LayoutDashboard,
    tag: 'Overview',
  },
  articles: {
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(3,105,161,0.90) 0%, rgba(30,64,175,0.85) 100%)',
    accent: '#38bdf8',
    Icon: BookOpen,
    tag: 'Knowledge',
  },
  'article-create': {
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(109,40,217,0.90) 0%, rgba(76,29,149,0.85) 100%)',
    accent: '#a78bfa',
    Icon: PenLine,
    tag: 'Authoring',
  },
  'article-edit': {
    image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(124,58,237,0.90) 0%, rgba(67,56,202,0.85) 100%)',
    accent: '#a78bfa',
    Icon: Edit3,
    tag: 'Editing',
  },
  'article-view': {
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(8,145,178,0.90) 0%, rgba(30,64,175,0.85) 100%)',
    accent: '#22d3ee',
    Icon: Eye,
    tag: 'Reading',
  },
  approvals: {
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(180,83,9,0.90) 0%, rgba(146,64,14,0.85) 100%)',
    accent: '#fbbf24',
    Icon: CheckSquare,
    tag: 'Review',
  },
  bookmarks: {
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(15,118,110,0.90) 0%, rgba(6,95,70,0.85) 100%)',
    accent: '#2dd4bf',
    Icon: Bookmark,
    tag: 'Saved',
  },
  categories: {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(194,65,12,0.90) 0%, rgba(154,52,18,0.85) 100%)',
    accent: '#fb923c',
    Icon: FolderOpen,
    tag: 'Organize',
  },
  tags: {
    image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(190,24,93,0.90) 0%, rgba(157,23,77,0.85) 100%)',
    accent: '#f472b6',
    Icon: Tag,
    tag: 'Labels',
  },
  search: {
    image: 'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(67,56,202,0.90) 0%, rgba(55,48,163,0.85) 100%)',
    accent: '#818cf8',
    Icon: Search,
    tag: 'Discover',
  },
  users: {
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(31,41,55,0.92) 0%, rgba(17,24,39,0.88) 100%)',
    accent: '#9ca3af',
    Icon: Users,
    tag: 'Team',
  },
  reports: {
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80&auto=format&fit=crop',
    overlay: 'linear-gradient(135deg, rgba(22,101,52,0.90) 0%, rgba(20,83,45,0.85) 100%)',
    accent: '#4ade80',
    Icon: BarChart2,
    tag: 'Analytics',
  },
}

export default function PageBanner({ theme = 'dashboard', title, subtitle, children }) {
  const t = THEMES[theme] || THEMES.dashboard
  const { Icon } = t

  return (
    <div className="relative overflow-hidden rounded-2xl mb-6 shadow-xl" style={{ minHeight: '140px' }}>
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-700"
        style={{ backgroundImage: `url(${t.image})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0" style={{ background: t.overlay }} />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Decorative glowing orbs */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{ background: t.accent }}
      />
      <div
        className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: t.accent }}
      />

      {/* Decorative rings */}
      <div className="absolute top-4 right-16 w-24 h-24 rounded-full border border-white/20 pointer-events-none" />
      <div className="absolute top-10 right-24 w-12 h-12 rounded-full border border-white/15 pointer-events-none" />
      <div className="absolute -bottom-6 right-8 w-36 h-36 rounded-full border border-white/10 pointer-events-none" />

      {/* Tag pill */}
      <div className="absolute top-4 right-6">
        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/30 backdrop-blur-sm"
          style={{ background: `${t.accent}30`, color: t.accent }}
        >
          {t.tag}
        </span>
      </div>

      {/* Content */}
      <div className="relative p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Icon box */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm shadow-lg border border-white/20"
            style={{ background: `${t.accent}25` }}
          >
            <Icon size={26} className="text-white drop-shadow" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-white drop-shadow-md tracking-tight leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-white/70 text-sm mt-1 font-medium max-w-xl">
                {subtitle}
              </p>
            )}
            {/* Accent underline */}
            <div
              className="mt-2 h-0.5 w-12 rounded-full opacity-80"
              style={{ background: t.accent }}
            />
          </div>
        </div>

        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
