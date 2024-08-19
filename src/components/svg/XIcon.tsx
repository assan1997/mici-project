type IconProps = {
  color?: string;
  size?: number;
};

export const XIcon = ({ color = "currentColor", size = 20 }: IconProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M14.1666 5.83398L5.83331 14.1673M5.83331 5.83398L14.1666 14.1673"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
