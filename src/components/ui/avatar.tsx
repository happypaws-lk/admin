"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Context to share image load state between Avatar children ───────────────
type AvatarStatus = "idle" | "loading" | "loaded" | "error";

interface AvatarContextValue {
  status: AvatarStatus;
  setStatus: (s: AvatarStatus) => void;
}

const AvatarContext = React.createContext<AvatarContextValue>({
  status: "idle",
  setStatus: () => {},
});

// ─── Avatar Root ─────────────────────────────────────────────────────────────
const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  const [status, setStatus] = React.useState<AvatarStatus>("idle");
  return (
    <AvatarContext.Provider value={{ status, setStatus }}>
      <span
        ref={ref}
        className={cn(
          "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </span>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

// ─── Avatar Image ─────────────────────────────────────────────────────────────
interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, onLoad, onError, ...props }, ref) => {
    const { setStatus } = React.useContext(AvatarContext);
    const internalRef = React.useRef<HTMLImageElement>(null);

    // Merge external ref with internal ref
    const mergedRef = React.useCallback(
      (node: HTMLImageElement | null) => {
        (internalRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLImageElement | null>).current = node;
      },
      [ref]
    );

    React.useEffect(() => {
      if (!src) {
        setStatus("error");
        return;
      }
      setStatus("loading");
      // Handle browsers serving the image from cache — onLoad won't fire reliably
      const img = internalRef.current;
      if (img?.complete) {
        setStatus(img.naturalWidth > 0 ? "loaded" : "error");
      }
    }, [src, setStatus]);

    if (!src) return null;

    return (
      <img
        ref={mergedRef}
        src={src}
        alt={alt || "Avatar"}
        onLoad={(e) => {
          setStatus("loaded");
          if (onLoad) onLoad(e);
        }}
        onError={(e) => {
          setStatus("error");
          if (onError) onError(e);
        }}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
        {...props}
      />
    );
  }
);
AvatarImage.displayName = "AvatarImage";

// ─── Avatar Fallback ─────────────────────────────────────────────────────────
const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { status } = React.useContext(AvatarContext);

  if (status === "loaded") return null;

  return (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
