'use client'

import { useState } from 'react'

interface InfoTipProps {
  text: string
}

export default function InfoTip({ text }: InfoTipProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-flex">
      <button
        className="info-icon"
        onClick={() => setOpen(v => !v)}
        onBlur={() => setOpen(false)}
        aria-label="More information"
      >
        i
      </button>
      {open && (
        <div
          className="tooltip-card absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56"
          style={{ pointerEvents: 'none' }}
        >
          {text}
        </div>
      )}
    </div>
  )
}
