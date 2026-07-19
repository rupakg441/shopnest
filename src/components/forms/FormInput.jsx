import React from 'react';

const FormInput = React.forwardRef(({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  className = '',
  ...rest
}, ref) => {
  return (
    <div className={`space-y-xs w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className={`w-full px-md py-sm rounded-lg border bg-transparent font-body-md transition-all focus:ring-0 focus:border-primary ${
          error
            ? 'border-error focus:border-error'
            : 'border-outline-variant/60 focus:border-primary'
        }`}
        {...rest}
      />
      {error && (
        <span className="text-error font-body-sm text-[12px] block mt-1">
          {error.message}
        </span>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

export default FormInput;
