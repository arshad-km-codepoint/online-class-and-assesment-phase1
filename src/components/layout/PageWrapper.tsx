import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

interface PageWrapperProps {
  breadcrumbs?: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({
  breadcrumbs,
  title,
  subtitle,
  onBack,
  actions,
  children,
}) => {
  return (
    <div className="w-full flex flex-col gap-5">
      {/* Breadcrumb */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[var(--text-muted)] select-none">›</span>}
                {isLast || crumb.active ? (
                  <span className="font-semibold text-[var(--primary)]" aria-current="page">
                    {crumb.label}
                  </span>
                ) : crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-[var(--text-secondary)]">
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Page Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="mt-1 flex h-8 w-8 items-center justify-center rounded-md border-2 border-[var(--border-color)] text-[var(--primary)] transition-colors duration-200 hover:border-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_14%,var(--bg-card))] cursor-pointer"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm mt-0.5 text-[var(--text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Header Action Slot */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {actions}
          </div>
        )}
      </div>

      {/* Content Slot */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};
