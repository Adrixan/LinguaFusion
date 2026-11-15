import { ReactNode, useEffect, useLayoutEffect, useRef } from 'react';

interface ModalProps {
  ariaLabel: string;
  /** When omitted the dialog cannot be dismissed with Escape or by clicking the backdrop. */
  onClose?: () => void;
  className?: string;
  children: ReactNode;
}

/** True when the pointer lies outside the dialog box (its padding counts as inside). */
function isOutside(event: PointerEvent, dialog: HTMLDialogElement): boolean {
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
}

/**
 * Native modal dialog: `showModal()` provides the top layer, `::backdrop`, page inertness, focus
 * containment, Escape and back-gesture dismissal and focus return; `closedby="any"` adds light dismiss.
 * The parent owns visibility: the dialog opens on mount, every user dismissal calls `onClose`, and
 * unmounting closes it so the browser returns focus to the element that was focused before it opened.
 */
function Modal({ ariaLabel, onClose, className = '', children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Layout effect: its cleanup runs while the dialog is still in the document, so close() can return focus.
  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();

    const handleCancel = (event: Event) => {
      if (!onCloseRef.current) event.preventDefault();
    };
    const handleClose = () => {
      if (onCloseRef.current) onCloseRef.current();
      else dialog.showModal(); // A forced close request (repeated Escape) closed a non-dismissible dialog.
    };
    dialog.addEventListener('cancel', handleCancel);
    dialog.addEventListener('close', handleClose);

    // Light-dismiss fallback where `closedby` is missing (Safari): press and release both outside the box,
    // so a text-selection drag that ends on the backdrop does not dismiss.
    const needsFallback = !('closedBy' in HTMLDialogElement.prototype);
    let pressedOutside = false;
    const handlePointerDown = (event: PointerEvent) => { pressedOutside = isOutside(event, dialog); };
    const handlePointerUp = (event: PointerEvent) => {
      if (pressedOutside && onCloseRef.current && isOutside(event, dialog)) dialog.close();
      pressedOutside = false;
    };
    if (needsFallback) {
      dialog.addEventListener('pointerdown', handlePointerDown);
      dialog.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      dialog.removeEventListener('cancel', handleCancel);
      dialog.removeEventListener('close', handleClose);
      if (needsFallback) {
        dialog.removeEventListener('pointerdown', handlePointerDown);
        dialog.removeEventListener('pointerup', handlePointerUp);
      }
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${className}`.trim()}
      aria-label={ariaLabel}
      closedby={onClose ? 'any' : 'none'}
    >
      {children}
    </dialog>
  );
}

export default Modal;
