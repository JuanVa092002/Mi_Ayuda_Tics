import type { ReactNode } from 'react'
import Button, { type ButtonProps } from './Button'

export interface SecondaryButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode
}

/**
 * @deprecated Use canonical `Button` from `@/shared/ui` with `variant="secondary"`.
 * This wrapper exists to ensure backward compatibility and zero legacy divergence.
 */
export default function SecondaryButton({
  children,
  ...props
}: SecondaryButtonProps): ReactNode {
  return (
    <Button variant="secondary" {...props}>
      {children}
    </Button>
  )
}
