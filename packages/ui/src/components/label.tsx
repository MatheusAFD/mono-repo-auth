import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

interface LabelProps extends ComponentProps<'label'> {}

export function Label(props: LabelProps) {
  const { className, ...rest } = props

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: <explanation>
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...rest}
    />
  )
}
