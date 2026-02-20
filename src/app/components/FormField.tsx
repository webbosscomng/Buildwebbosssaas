import React from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function FormField({ 
  label, 
  error, 
  hint, 
  required, 
  className,
  id,
  ...props 
}: FormFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {label}
      </Label>
      <Input
        id={fieldId}
        className={cn(error && 'border-red-500 focus-visible:ring-red-500', className)}
        {...props}
      />
      {hint && !error && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

interface FormTextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function FormTextareaField({ 
  label, 
  error, 
  hint, 
  required, 
  className,
  id,
  ...props 
}: FormTextareaFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-');
  
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-red-500")}>
        {label}
      </Label>
      <Textarea
        id={fieldId}
        className={cn(error && 'border-red-500 focus-visible:ring-red-500', className)}
        {...props}
      />
      {hint && !error && (
        <p className="text-sm text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}