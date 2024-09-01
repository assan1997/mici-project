const ChevronRight = ({ size, color }: { size: number; color: string }) => {
  return (
    <svg
      width={size || "14"}
      height={size || "14"}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.39635 2.69042C9.19753 2.49713 8.8752 2.49713 8.67638 2.69042L4.60366 6.65002C4.50818 6.74284 4.45455 6.86873 4.45455 7C4.45455 7.13127 4.50818 7.25716 4.60366 7.34998L8.67638 11.3096C8.8752 11.5029 9.19753 11.5029 9.39635 11.3096C9.59516 11.1163 9.59516 10.8029 9.39635 10.6096L5.6836 7L9.39635 3.39039C9.59516 3.1971 9.59516 2.88371 9.39635 2.69042Z"
        fill={color}
      />
    </svg>
  );
};

export { ChevronRight };
