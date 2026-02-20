import React from 'react';
import { AlertCircle, Inbox, Search, FileQuestion } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-muted-foreground">
        {icon || <Inbox className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Something went wrong', 
  description = 'An error occurred while loading this content.',
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-destructive">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
}

export function NotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-muted-foreground">
        <FileQuestion className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Page not found</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        The page you're looking for doesn't exist or has been removed.
      </p>
    </div>
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 text-muted-foreground">
        <Search className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No results found</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        We couldn't find anything matching "{query}". Try a different search term.
      </p>
    </div>
  );
}