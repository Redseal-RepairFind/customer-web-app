"use client";

type ToggleBtnProps = {
  toggle: boolean;
  onClick: () => void;
  emergency?: boolean;
};

export default function ToggleBtn({
  toggle,
  onClick,
  emergency,
}: ToggleBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative h-5 min-w-8 rounded-4xl flex items-center ${
        !toggle ? "bg-light-100" : emergency ? "bg-red-500" : " bg-dark"
      } transition-colors duration-300 ease-in-out cursor-pointer`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-300 ease-in-out ${
          !toggle ? "translate-x-0" : "translate-x-3.5"
        }`}
      />
    </button>
  );
}
