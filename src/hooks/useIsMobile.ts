import { useEffect, useState } from "react";
import useViewportSize from "./useViewportSize";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const viewSize = useViewportSize();

  useEffect(() => {
    if (viewSize.x < 830) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, [viewSize]);

  return isMobile;
}
