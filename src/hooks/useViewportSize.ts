import { useEffect, useState } from "react";
import _ from "lodash";

interface ViewSizeType {
  x: number;
  y: number;
}

export default function useViewportSize(): ViewSizeType {
  const [viewSize, setViewSize] = useState<ViewSizeType>({
    x: window.innerWidth,
    y: window.innerHeight,
  });

  useEffect(() => {
    const sizeChangeHandler = _.debounce(function (
      this: Window,
      event: UIEvent
    ) {
      setViewSize({ x: this.innerWidth, y: this.innerHeight });
    },
    300);
    window.addEventListener("resize", sizeChangeHandler);
    return () => {
      window.removeEventListener("resize", sizeChangeHandler);
    };
  }, []);

  return viewSize;
}
