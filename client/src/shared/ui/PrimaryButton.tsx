import type { ReactNode } from 'react'
import Button, { type ButtonProps } from './Button'

export interface PrimaryButtonProps extends Omit<ButtonProps, 'variant'> {
  children: ReactNode
}

/**
 * @deprecated Use canonical `Button` from `@/shared/ui` with `variant="primary"`.
 * This wrapper exists to ensure backward compatibility and zero legacy divergence.
 */
export default function PrimaryButton({
  children,
  ...props
}: PrimaryButtonProps): ReactNode {
  return (
    <Button variant="primary" {...props}>
      {children}
    </Button>
  )
}
