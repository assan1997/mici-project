import { FC } from "react";

export const PrintIcon: FC<{ color: string }> = ({ color }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="black"
        stroke-width="1"
      />

      <rect
        x="5"
        y="4"
        width="8"
        height="2"
        stroke="black"
        stroke-width="0.8"
        fill="none"
      />

      <circle cx="14" cy="5" r="0.3" fill="black" />
      <circle cx="15.5" cy="5" r="0.3" fill="black" />
      <circle cx="17" cy="5" r="0.3" fill="black" />
      <circle cx="18.5" cy="5" r="0.3" fill="black" />
      <circle cx="20" cy="5" r="0.3" fill="black" />

      <ellipse cx="7" cy="15" rx="1.5" ry="1" stroke="black" stroke-width="1" />
      <ellipse
        cx="17"
        cy="15"
        rx="1.5"
        ry="1"
        stroke="black"
        stroke-width="1"
      />

      <path
        d="M5 6 V17 Q5 19 7 19 H17 Q19 19 19 17 V6"
        stroke="black"
        stroke-width="1"
        stroke-linejoin="round"
      />

      <line x1="5" y1="18" x2="19" y2="18" stroke="black" stroke-width="1" />
    </svg>
  );
};
