import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface SeparatorProps extends ComponentProps<'div'> {
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
}

export function Separator(props: SeparatorProps) {
  const { className, orientation = 'horizontal', decorative = true, ...rest } = props

  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        className,
      )}
      {...rest}
    />
  )
}
