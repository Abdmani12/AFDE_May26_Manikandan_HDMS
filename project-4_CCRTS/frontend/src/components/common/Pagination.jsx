import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import '../../styles/components.css'

export default function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  // Build page numbers (show max 5 pages)
  const getPages = () => {
    const pages = []
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + 4)
    if (end - start < 4) start = Math.max(1, end - 4)
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {start}–{end} of {totalItems} results
      </span>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {getPages().map((page) => (
          <button
            key={page}
            className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="pagination-btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
