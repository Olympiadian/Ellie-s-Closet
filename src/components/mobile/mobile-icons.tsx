type IconProps = {
  className?: string;
};

export function AddClothesIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function RequestFeatureIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.5 18.2H5.8a2 2 0 0 1-2-2V7.1a2 2 0 0 1 2-2h12.4a2 2 0 0 1 2 2v9.1a2 2 0 0 1-2 2h-5.1L8.5 21v-2.8Z" />
      <path d="M12 8.2v6.1M8.9 11.25h6.2" />
    </svg>
  );
}

export function DatabaseCheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="10.5" cy="5.4" rx="6.8" ry="2.7" />
      <path d="M3.7 5.4v5.1c0 1.5 3 2.7 6.8 2.7 1 0 2-.1 2.8-.3M3.7 10.5v5.1c0 1.5 3 2.7 6.8 2.7h.7" />
      <path d="m15 17.5 1.7 1.8 3.7-4.3" />
    </svg>
  );
}

export function BrowseClosetIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 7v10M12 7l2 10M17 7v10" />
    </svg>
  );
}

export function DealsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 5.5v5.8L13.2 20l6.8-6.8-8.7-8.7H5.5a1 1 0 0 0-1 1Z" />
      <circle cx="8.5" cy="8.5" r="1.2" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 9.5h17M8 13h2M14 13h2M8 16.5h2M14 16.5h2" />
    </svg>
  );
}

export function MessagesIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5h16v11H10l-6 3v-14Z" />
    </svg>
  );
}

export function SupportIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.5a2.7 2.7 0 1 1 4.1 2.3c-1 .6-1.6 1.1-1.6 2.3M12 17.5h.01" />
    </svg>
  );
}

export function BackIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m14.5 5-7 7 7 7" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.8h3l1.5-2.3h7L17 7.8h3a1.5 1.5 0 0 1 1.5 1.5v8.9a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5V9.3A1.5 1.5 0 0 1 4 7.8Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
