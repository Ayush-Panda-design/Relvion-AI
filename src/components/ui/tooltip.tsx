'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

export function TooltipProvider({
  children,
  delayDuration = 280,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} {...props}>
      {children}
    </TooltipPrimitive.Provider>
  );
}

export const Tooltip = TooltipPrimitive.Tooltip;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden rounded-lg border px-2.5 py-1.5 text-xs shadow-lg',
          'transition-opacity duration-150 data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
          dash.elevated,
          dash.border,
          dash.text,
          className
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

type HintProps = {
  children: React.ReactElement;
  content: React.ReactNode;
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>['side'];
  sideOffset?: number;
};

/**
 * Self-contained tooltip — bundles Provider + Root in one module so Turbopack
 * chunk splits cannot break Radix context.
 */
export function Hint({ children, content, side, sideOffset }: HintProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} sideOffset={sideOffset}>
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
