import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useCategory() {
  const location = useLocation();
  const [category, setCategory] = useState<string>("");
  const [searchParam, setSearchParam] = useState<string>("");

  useEffect(() => {
    const pathArr = location.pathname.split("/");
    if (pathArr[1] === "posts") {
      setCategory(pathArr[2]);
      setSearchParam(pathArr.length > 3 ? pathArr[3] : "");
      return;
    }
    setCategory("");
    setSearchParam("");
  }, [location]);

  return { category, searchParam };
}
