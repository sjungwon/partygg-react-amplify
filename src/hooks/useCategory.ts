import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function useCategory() {
  const location = useLocation();
  const [category, setCategory] = useState<string>("");
  const [searchParam, setSearchParam] = useState<string>("");

  useEffect(() => {
    const pathArr = location.pathname.split("/");
    setCategory(pathArr[1]);
    setSearchParam(pathArr.length > 2 ? pathArr[2] : "");
  }, [location]);

  return { category, searchParam };
}
