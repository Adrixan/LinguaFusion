import { ReactNode, useLayoutEffect, useRef } from 'react';

interface NoticeProps {
  className: string;
  role: 'status' | 'alert';
  children: ReactNode;
}

/**
 * Toast or warning shown as a manual popover, so it enters the top layer and stays visible above a
 * modal dialog that is already open (z-index cannot reach above the top layer). Like the rest of the
 * page it stays inert while a modal is open. Without Popover API support it renders as a fixed element.
 */
function Notice({ className, role, children }: NoticeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || typeof element.showPopover !== 'function') return;
    element.showPopover();
    return () => {
      if (element.matches(':popover-open')) element.hidePopover();
    };
  }, []);

  return (
    <div ref={ref} className={className} role={role} popover="manual">
      {children}
    </div>
  );
}

export default Notice;
