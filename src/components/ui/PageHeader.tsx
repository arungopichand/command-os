import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  subtitle?: string;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, subtitle, actions, meta, className }: PageHeaderProps) {
  const supportingText = subtitle ?? description;

  return (
    <div className={cn('mb-6 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between', className)}>
      <div className="max-w-3xl">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1 className="section-title mt-3">{title}</h1>
        <p className="page-subtitle mt-3">{supportingText}</p>
        {supportingText !== description ? <p className="body-copy mt-2">{description}</p> : null}
        {meta ? <div className="mt-5 flex flex-wrap gap-3">{meta}</div> : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3 xl:justify-end">{actions}</div> : null}
    </div>
  );
}
