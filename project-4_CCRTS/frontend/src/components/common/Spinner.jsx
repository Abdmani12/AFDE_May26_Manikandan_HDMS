import React from 'react'
import '../../styles/components.css'

export default function Spinner({ size = 'default', white = false, inline = false }) {
  const containerClass = [
    'spinner-container',
    size === 'small' ? 'small' : '',
    inline ? 'inline' : '',
  ].filter(Boolean).join(' ')

  const spinnerClass = [
    'spinner',
    size === 'small' ? 'small' : '',
    white ? 'white' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClass}>
      <div className={spinnerClass} />
    </div>
  )
}
