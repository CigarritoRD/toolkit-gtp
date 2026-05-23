import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import AppButton from '@/components/ui/AppButton'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  action?: ReactNode
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border bg-surface p-8 text-center"
    >
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-soft text-brand-primary">
          {icon}
        </div>
      ) : null}

      <h3 className="font-heading text-lg text-text-primary">{title}</h3>

      {description ? (
        <p className="mt-2 max-w-md text-sm text-brand-primary">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="mt-5">{action}</div>
      ) : actionLabel && onAction ? (
        <div className="mt-5">
          <AppButton onClick={onAction}>{actionLabel}</AppButton>
        </div>
      ) : null}
    </motion.div>
  )
}