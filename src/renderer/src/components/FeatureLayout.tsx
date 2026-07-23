import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface FeatureLayoutProps {
  title: string;
  description?: React.ReactNode;
  headerActions?: React.ReactNode;
  onBack?: () => void;
  maxWidth?: '5xl' | '6xl' | '7xl';
  children: React.ReactNode;
}

export function FeatureLayout({ title, description, headerActions, onBack, maxWidth = '5xl', children }: FeatureLayoutProps) {
  const maxWidthClass = {
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
  }[maxWidth];

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="flex-1 overflow-y-auto py-8 px-6 animate-in fade-in duration-500">
        <div className={`w-full ${maxWidthClass} mx-auto space-y-6`}>
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="flex items-start space-x-4">
              {onBack && (
                <Button 
                  variant="ghost" 
                  className="text-slate-500 hover:text-slate-900 mt-1"
                  onClick={onBack}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Kembali
                </Button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
                {description && (
                  <div className="text-sm text-slate-500 mt-1">{description}</div>
                )}
              </div>
            </div>
            
            {headerActions && (
              <div className="shrink-0 pt-1">
                {headerActions}
              </div>
            )}
          </div>

          {/* Main Content */}
          {children}
          
        </div>
      </div>
    </div>
  );
}
