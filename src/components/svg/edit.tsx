import { FC } from "react";

export const EditIcon: FC<{ color: string }> = ({ color }) => {
  return (
    <svg
      clipRule="evenodd"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit="1"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      id="fi_16025454"
      width="20"
      height="20"
    >
      <g fill="none">
        <path id="Edit" d="m0 0h32v32h-32z"></path>
        <g stroke={color} strokeWidth="2">
          <path d="m24 18c0 9.953-.058 10-10 10s-10-.03-10-10 .019-10 10-10"></path>
          <path d="m13 16v3h3l12-12-3-3z"></path>
          <path d="m22.5 7.5 2 2"></path>
        </g>
      </g>
    </svg>
  );
};
