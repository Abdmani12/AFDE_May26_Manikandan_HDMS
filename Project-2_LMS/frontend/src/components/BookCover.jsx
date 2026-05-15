import { useState, useEffect } from 'react'

// Module-level cache — persists for the whole session
const cache = new Map()

async function getCoverUrl(isbn, title, author) {
  const key = isbn || title
  if (cache.has(key)) return cache.get(key)

  const cleanIsbn = isbn?.replace(/[-\s]/g, '') ?? ''

  // 1 — Google Books by ISBN (most reliable for classic/popular books)
  if (cleanIsbn) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}&maxResults=1&fields=items(volumeInfo/imageLinks)`
      )
      const data = await res.json()
      const thumb = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail
      if (thumb) {
        const url = thumb.replace('http://', 'https://').replace('zoom=1', 'zoom=0')
        cache.set(key, url)
        return url
      }
    } catch {}
  }

  // 2 — Google Books by title + author (catches anything ISBN misses)
  if (title) {
    try {
      const q = encodeURIComponent(`${title} ${author ?? ''}`.trim())
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`
      )
      const data = await res.json()
      const thumb = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail
      if (thumb) {
        const url = thumb.replace('http://', 'https://').replace('zoom=1', 'zoom=0')
        cache.set(key, url)
        return url
      }
    } catch {}
  }

  // 3 — Open Library by ISBN (final fallback, direct image URL)
  if (cleanIsbn) {
    const url = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-L.jpg`
    cache.set(key, url)
    return url
  }

  cache.set(key, null)
  return null
}

export default function BookCover({ isbn, title, author, gradient, emoji }) {
  const [src, setSrc]       = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setSrc(null)
    setLoaded(false)
    setFailed(false)
    let cancelled = false
    getCoverUrl(isbn, title, author).then(url => {
      if (!cancelled) setSrc(url ?? null)
    })
    return () => { cancelled = true }
  }, [isbn, title])

  return (
    <div className="book-cover" style={{ background: gradient }}>
      {/* Emoji — always rendered, fades out once real cover loads */}
      <span
        className="book-cover-emoji"
        style={{ opacity: loaded && !failed ? 0 : 1 }}
      >
        {emoji}
      </span>

      {/* Shimmer while waiting for the image */}
      {src && !loaded && !failed && <div className="book-cover-shimmer" />}

      {/* Real cover */}
      {src && !failed && (
        <img
          key={src}
          src={src}
          alt={title}
          className="book-cover-img"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
