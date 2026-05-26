import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant = 'primary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  const classes = ['ui-button', `ui-button--${variant}`, `ui-button--${size}`, className].filter(Boolean).join(' ');
  return <button type={type} className={classes} {...props} />;
}
