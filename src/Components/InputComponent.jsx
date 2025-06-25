import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info, User, Mail, FileText } from 'lucide-react';

const InputComponent = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  icon: Icon,
  hint,
  error,
  success,
  required = false,
  disabled = false,
  rows = 3,
  accept,
  fullWidth = true,
  className = '',
  maxLength,
  onBlur,
  onFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const inputClasses = `
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${Icon ? 'pl-10' : 'pl-4'} 
    pr-4 py-3 
    border rounded-lg
    transition-all duration-200
    ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'}
    ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 
      success ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : 
      'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}
    ${isFocused ? 'ring-2 ring-opacity-50' : ''}
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    shadow-sm
  `;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 mb-1 flex items-center"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            rows={rows}
            className={inputClasses}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            maxLength={maxLength}
            aria-describedby={hint ? `${name}-hint` : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        ) : (
          <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={inputClasses}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            accept={accept}
            maxLength={maxLength}
            aria-describedby={hint ? `${name}-hint` : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        )}
        
        {hint && !error && !success && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-help">
            <Info size={16} />
          </div>
        )}
        
        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
            <AlertCircle size={16} />
          </div>
        )}
        
        {success && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
            <CheckCircle size={16} />
          </div>
        )}
      </div>
      
      {hint && !error && (
        <p 
          id={`${name}-hint`} 
          className="mt-1 text-sm text-gray-500"
        >
          {hint}
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {success && (
        <p className="mt-1 text-sm text-green-600">
          {success}
        </p>
      )}
      
      {maxLength && value && (
        <div className="mt-1 text-xs text-gray-400 text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default InputComponent