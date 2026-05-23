import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

type SectionCardProps = {
  children: ReactNode
  className?: string
  onClick?: () => void | Promise<void>
}

export default function SectionCard({
  children,
  className = '',
  onClick,
}: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={[
        'rounded-xl border border-surface-border bg-surface shadow-[var(--shadow-soft)]',
        className,
      ].join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  )
}