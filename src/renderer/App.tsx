import { useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { DesktopShell } from './layouts/DesktopShell';
import { QuickAssistantPage } from './pages/QuickAssistantPage';

export function App() {
  const bootstrap = useAppStore((s) => s.bootstrap);
  const initialized = useAppStore((s) => s.initialized);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const isQuickWindow =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('window') === 'quick';

  if (!initialized) {
    return (
      <div className="h-screen w-screen bg-[var(--ms-bg)] text-[var(--ms-text-muted)] grid place-items-center text-[13px]">
        Initializing Muse for Windows · 1MS Studio…
      </div>
    );
  }

  if (isQuickWindow) {
    return <QuickAssistantPage standalone />;
  }

  return <DesktopShell />;
}
