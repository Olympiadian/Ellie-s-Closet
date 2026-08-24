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
