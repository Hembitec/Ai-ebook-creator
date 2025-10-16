// This file might be deprecated in favor of components/ui/button.tsx
// Providing a basic implementation to fix build errors.
import React from 'react';

const Button = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button {...props}>{children}</button>;
};

export default Button;
