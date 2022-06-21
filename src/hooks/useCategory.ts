import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useCategory() {
  const location = useLocation();
  const [category, setCategory] = useState<string>("");
  const [searchParam, setSearchParam] = useState<string>("");

  useEffect(() => {
    const pathArr = location.pathname.split("/");
    if (pathArr[1]) {
      setCategory(pathArr[1]);
      setSearchParam(pathArr.length > 2 ? pathArr[2] : "");
      return;
    }
    setCategory("");
    setSearchParam("");
  }, [location]);

  return { category, searchParam, setCategory, setSearchParam };
}
