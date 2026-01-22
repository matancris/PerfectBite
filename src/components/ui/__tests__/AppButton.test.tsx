import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { AppButton } from '../AppButton'

describe('AppButton', () => {
  it('renders with text', () => {
    render(<AppButton>Click me</AppButton>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()
    
    render(<AppButton onClick={handleClick}>Click me</AppButton>)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<AppButton disabled>Disabled</AppButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows loading state', () => {
    render(<AppButton isLoading>Loading</AppButton>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('app-button--loading')
  })

  it('applies variant classes', () => {
    render(<AppButton variant="primary">Primary</AppButton>)
    expect(screen.getByRole('button')).toHaveClass('app-button--primary')
  })

  it('applies size classes', () => {
    render(<AppButton size="lg">Large</AppButton>)
    expect(screen.getByRole('button')).toHaveClass('app-button--lg')
  })
})
