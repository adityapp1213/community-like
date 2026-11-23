import { useEffect, useState } from "react";

export default function usePage() {
  const [page, setPage] = useState(location.pathname);

  useEffect(() => {
    const onPop = () => setPage(location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (to) => {
    history.pushState({}, "", to);
    setPage(to);
    window.scrollTo(0, 0);
  };

  return [page, go];
}
