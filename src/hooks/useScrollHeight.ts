import _ from "lodash";
import { useEffect, useState } from "react";

export default function useScrollHeight() {
  const [scrollHeight, setScrollHeight] = useState<number>(0);

  useEffect(() => {
    const scrollHeightHandler = _.throttle(function (
      this: Window,
      event: Event
    ) {
      setScrollHeight(this.scrollY);
    });
    window.addEventListener("scroll", scrollHeightHandler);
    return () => {
      window.removeEventListener("scroll", scrollHeightHandler);
    };
  }, []);

  return scrollHeight;
}
