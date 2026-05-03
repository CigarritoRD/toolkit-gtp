import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = 'bg-surface-border animate-pulse'
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }

  return (
    <motion.div
      className={[baseClasses, variantClasses[variant], className].join(' ')}
      style={{ width, height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-surface-border bg-surface p-4 space-y-3">
      <Skeleton height={160} className="w-full" />
      <Skeleton width="70%" height={20} />
      <Skeleton width="100%" height={16} />
      <Skeleton width="60%" height={16} />
      <div className="flex gap-2 pt-2">
        <Skeleton width={60} height={24} variant="text" />
        <Skeleton width={60} height={24} variant="text" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-surface-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height={16} />
        </td>
      ))}
    </tr>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Skeleton width={100} height={14} />
        <Skeleton height={40} />
      </div>
      <div className="space-y-1.5">
        <Skeleton width={100} height={14} />
        <Skeleton height={40} />
      </div>
      <div className="space-y-1.5">
        <Skeleton width={100} height={14} />
        <Skeleton height={100} />
      </div>
    </div>
  )
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-surface-border">
          <Skeleton width={40} height={40} variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" height={16} />
            <Skeleton width="70%" height={14} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AdminTableSkeleton({
  rows = 5,
}: { rows?: number }) {
  return (
    <div className="divide-y divide-surface-border">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 px-4 py-4"
        >
          <Skeleton width={44} height={44} variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" height={16} />
            <Skeleton width="60%" height={14} />
          </div>
          <Skeleton width={80} height={24} variant="text" />
          <Skeleton width={60} height={24} variant="text" />
        </div>
      ))}
    </div>
  )
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Skeleton width={100} height={12} variant="text" />
          <Skeleton width={200} height={32} />
          <Skeleton width={300} height={16} />
        </div>
        <Skeleton width={140} height={40} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-surface-border bg-surface p-4 space-y-2">
            <Skeleton width={100} height={12} variant="text" />
            <Skeleton width={60} height={28} />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-surface-border bg-surface p-4">
        <Skeleton height={40} />
      </div>

      <div className="rounded-xl border border-surface-border bg-surface overflow-hidden">
        <AdminTableSkeleton rows={6} />
      </div>
    </div>
  )
}