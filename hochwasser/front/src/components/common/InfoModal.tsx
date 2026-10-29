import { Modal } from '@carbon/react';

interface InfoModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function InfoModal({ open, title, onClose, children }: InfoModalProps) {
  return (
    <Modal
      open={open}
      modalHeading={title}
      passiveModal
      onRequestClose={onClose}
      aria-label={title}
    >
      <div style={{ padding: '1rem 0', lineHeight: 1.6 }}>{children}</div>
    </Modal>
  );
}
