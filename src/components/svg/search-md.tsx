import { Icon } from '@/lib/types/icon';

export const SearchMdIcon = ({ color = '#4F4D55', size = 20 }: Icon) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.0862 17.5L14.4612 13.875M16.4195 9.16667C16.4195 12.8486 13.4347 15.8333 9.75285 15.8333C6.07095 15.8333 3.08618 12.8486 3.08618 9.16667C3.08618 5.48477 6.07095 2.5 9.75285 2.5C13.4347 2.5 16.4195 5.48477 16.4195 9.16667Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
