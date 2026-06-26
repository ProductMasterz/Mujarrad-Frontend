import { SystemBuilder } from '@/components/system-builder/SystemBuilder';
import { SystemBuilderAuthGate } from '@/features/system-design/components/SystemBuilderAuthGate';

export const metadata = {
  title: 'System Design — Mujarrad',
};

export default function SystemBuilderPage() {
  return (
    <SystemBuilderAuthGate>
      <SystemBuilder />
    </SystemBuilderAuthGate>
  );
}
