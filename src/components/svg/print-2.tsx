import { FC } from "react";

export const PrintIcon2: FC<{ color: string; size: number }> = ({
  color,
  size,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse
        cx="18"
        cy="5"
        rx="3"
        ry="1.5"
        stroke={color}
        stroke-width="1.5"
      />

      <ellipse
        cx="6"
        cy="5"
        rx="3"
        ry="1.5"
        stroke={color}
        stroke-width="1.5"
      />

      <path
        d="M3 5 V18 Q3 20 5 20 H19 Q21 20 21 18 V5"
        stroke={color}
        stroke-width="1.5"
        stroke-linejoin="round"
      />

      <path
        d="M7 10 H17 M7 12 H17 M7 14 H17 M7 16 H17"
        stroke={color}
        stroke-width="1"
        stroke-linecap="round"
      />

      <rect x="7" y="8" width="3" height="2" stroke={color} stroke-width="1" />
      <rect x="14" y="8" width="3" height="2" stroke={color} stroke-width="1" />
    </svg>
  );
};
