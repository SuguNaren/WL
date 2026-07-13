import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  props,
  ref
) {
  return (
    <input
      {...props}
      ref={ref}
      className={clsx(
        'h-12 w-full border border-stone-300 bg-stone-50 px-4 text-sm text-slate-900 outline-none transition',
        'focus:border-brand-500 focus:bg-white',
        props.className
      )}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea(props, ref) {
    return (
      <textarea
        {...props}
        ref={ref}
        className={clsx(
          'min-h-28 w-full border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition',
          'focus:border-brand-500 focus:bg-white',
          props.className
        )}
      />
    );
  }
);
