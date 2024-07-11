import { KeyTextField } from "@prismicio/client";

export const renderLetters = (name: KeyTextField, key: string) => {
  if (!name) return;
  return name.split("").map((letter, index) => (
    <span
      key={index}
      className={`name-animation name-animation-${key} inline-block opacity-0`}
    >
      {letter}
    </span>
  ));
};
