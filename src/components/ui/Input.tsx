import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const baseClass =
  'w-full rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-colors duration-200 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]';

type TextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> & {
  as?: 'textarea';
  className?: string;
};

type InputFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  as: 'input';
  className?: string;
};

export type InputProps = TextareaProps | InputFieldProps;

export const Input = forwardRef<HTMLTextAreaElement | HTMLInputElement, InputProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    if (props.as === 'input') {
      const { as: _a, ...inputProps } = props;
      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          className={cn(baseClass, 'h-11', className)}
          {...inputProps}
        />
      );
    }
    const { as: _a, ...taProps } = props as TextareaProps;
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        className={cn(baseClass, 'min-h-[120px] resize-y', className)}
        {...taProps}
      />
    );
  }
);
Input.displayName = 'Input';
