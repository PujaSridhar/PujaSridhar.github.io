import { EMAIL_HREF, RESUME_URL } from '../constants/terminal.js';

export function SocialIcons({ darkMode, onToggleTheme, onToggleView, terminalMode }) {
  return (
    <div id="contact-icons">
      <button type="button" id="theme-toggle-button" className="icon-button" title="Toggle Theme" onClick={onToggleTheme}>
        <svg
          id="sun-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: darkMode ? 'none' : 'block' }}
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          id="moon-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: darkMode ? 'block' : 'none' }}
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <a href={EMAIL_HREF} title="Email">
        <svg viewBox="0 0 24 24">
          <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5l-8-5h16zm0 12H4V8l8 5l8-5v10z" />
        </svg>
      </a>

      <a href="https://www.linkedin.com/in/pujasridhar/" title="LinkedIn">
        <svg viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75 .79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      </a>

      <a href="https://github.com/pujasridhar" title="GitHub">
        <svg viewBox="0 0 25 25">
          <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.94.36.31.68.92.68 1.85v2.72c0 .27.18.58.69.48A10 10 0 0 0 22 12A10 10 0 0 0 12 2Z" />
        </svg>
      </a>

      <a href={RESUME_URL} title="Resume">
        <svg viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
        </svg>
      </a>

      <button
        type="button"
        id="gui-toggle-button"
        className="icon-button"
        title={terminalMode ? 'Switch to Standard View' : 'Switch to Terminal View'}
        onClick={onToggleView}
      >
        <svg
          id="gui-icon-standard"
          className="icon-button -ml-1.5"
          style={{ display: terminalMode ? 'block' : 'none' }}
          viewBox="0 0 240 330"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <g stroke="currentColor" strokeWidth="20" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="12" y="12" width="216" height="306" rx="20" ry="20" />
            <circle cx="120" cy="125" r="72" />
            <circle cx="120" cy="105" r="22" />
            <clipPath id="clip-upper" clipPathUnits="userSpaceOnUse">
              <rect x="0" y="0" width="240" height="175" />
            </clipPath>
            <g clipPath="url(#clip-upper)">
              <circle cx="120" cy="182" r="49" />
            </g>
            <line x1="50" y1="235" x2="106" y2="235" />
            <line x1="134" y1="235" x2="190" y2="235" />
            <line x1="96" y1="270" x2="184" y2="270" />
          </g>
        </svg>

        <svg
          id="gui-icon-terminal"
          style={{ display: terminalMode ? 'none' : 'block' }}
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </button>
    </div>
  );
}
