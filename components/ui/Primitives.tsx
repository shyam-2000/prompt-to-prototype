import React from 'react';
import { X } from 'lucide-react';

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
      outline: "border border-gray-700 bg-transparent hover:bg-gray-800 text-gray-100",
      ghost: "hover:bg-gray-800 text-gray-100",
      destructive: "bg-red-900/50 text-red-200 hover:bg-red-900/70 border border-red-900",
    };
    const sizes = {
      sm: "h-8 px-3 text-xs",
      default: "h-10 px-4 py-2",
      lg: "h-12 px-8 text-lg",
      icon: "h-10 w-10 p-2 flex items-center justify-center",
    };
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

// --- Input ---
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`flex h-10 w-full rounded-md border border-gray-800 bg-gray-950 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    );
  }
);

// --- Dialog (Modal) ---
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex flex-row items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-100 transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
            {children}
        </div>
      </div>
    </div>
  );
};

// --- Badge ---
// Updated children type to be optional to fix TS errors in consumers
export const Badge = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center rounded-full border border-gray-700 px-2.5 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${className}`}>
    {children}
  </span>
);