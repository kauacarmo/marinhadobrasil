import Image from "next/image"

export function Brasao({ className }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 ${className ?? "size-11"}`} aria-hidden="true">
      <Image
        src="/logo-cpsp.svg"
        alt=""
        fill
        sizes="64px"
        className="object-contain"
        priority
      />
    </span>
  )
}
