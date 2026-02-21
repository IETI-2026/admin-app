import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-indigo-600 bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 hover:shadow focus:ring-indigo-500',
  secondary:
    'border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:shadow focus:ring-slate-400',
  danger:
    'border border-rose-600 bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:shadow focus:ring-rose-500',
  ghost:
    'border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-400',
};

export function Button({
  variant = 'primary',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className ?? ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Procesando...' : children}
    </button>
  );
}
