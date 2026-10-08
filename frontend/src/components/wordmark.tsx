import Image from "next/image";

export function Wordmark() {
  return (
    <Image
      src="/brand/ntspire-logo.svg"
      alt="ntspire"
      width={500}
      height={324}
      priority
      className="h-7 w-auto"
    />
  );
}
