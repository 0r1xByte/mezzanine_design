import './ThemeToggle.css';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="10" cy="10" r="10" fill="none" stroke="none" />
          <path d="M10 15a5 5 0 100-10 5 5 0 000 10z" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.6 4.4l-1.4 1.4M5.8 14.2l-1.4 1.4M15.6 15.6l-1.4-1.4M5.8 5.8L4.4 4.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
          <path d="M17.3 12.7A7.3 7.3 0 018 3.1a.6.6 0 00-.8-.7A8.5 8.5 0 1017.9 13.5a.6.6 0 00-.6-.8z" />
        </svg>
      )}
    </button>
  );
}
