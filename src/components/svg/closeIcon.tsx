import React from "react";

type IconProps = {
  color?: string;
  size?: number;
};

export const CloseIcon = ({ color = "currentColor", size = 20 }: IconProps) => {
  return (
    <svg
      id="fi_2961937"
      height="14"
      viewBox="0 0 64 64"
      width="14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m4.59 59.41a2 2 0 0 0 2.83 0l24.58-24.58 24.59 24.58a2 2 0 0 0 2.83-2.83l-24.59-24.58 24.58-24.59a2 2 0 0 0 -2.83-2.83l-24.58 24.59-24.59-24.58a2 2 0 0 0 -2.82 2.82l24.58 24.59-24.58 24.59a2 2 0 0 0 0 2.82z"></path>
    </svg>
  );
};
