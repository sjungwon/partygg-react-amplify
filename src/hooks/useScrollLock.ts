export default function useScrollLock() {
  const scrollLock = () => {
    const body = document.getElementsByTagName("body")[0];
    body.style.overflow = "hidden";
  };
  const scrollRelease = () => {
    const body = document.getElementsByTagName("body")[0];
    body.style.overflow = "auto";
  };

  return { scrollLock, scrollRelease };
}
