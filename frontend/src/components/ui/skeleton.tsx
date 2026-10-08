import { Skeleton as HeroUISkeleton, type SkeletonVariants } from "@heroui/react/skeleton"
import { cn } from "cn"

interface SkeletonProps extends React.ComponentProps<"div"> {
  animationType?: SkeletonVariants["animationType"]
}

function Skeleton({ animationType = "pulse", className, ...props }: SkeletonProps) {
  return (
    <HeroUISkeleton
      animationType={animationType}
      data-slot="skeleton"
      className={cn("rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
