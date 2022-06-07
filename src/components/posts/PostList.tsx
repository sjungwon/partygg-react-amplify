import styles from "./PostList.module.scss";
import AddPostElement from "./AddPostElement";
import PostElement from "./PostElement";
import PostServices from "../../services/PostServices";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Post } from "../../types/post.type";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);

  const removePost = useCallback((postId: string) => {
    setPosts((prev: Post[]) =>
      prev.filter(
        (prevPost) => `${prevPost.username}/${prevPost.date}` !== postId
      )
    );
  }, []);

  useEffect(() => {
    PostServices.init();
  }, []);

  const [addPostData, setAddPostData] = useState<Post | null>(null);

  useEffect(() => {
    if (addPostData) {
      setPosts((prev: Post[]) => [addPostData, ...prev]);
      setAddPostData(null);
    }
  }, [addPostData]);

  const sendQuery = useCallback(async () => {
    console.log("query");
    const postIdList = await PostServices.getPostIdList();
    if (postIdList) {
      console.log(postIdList.lastEvaluatedKey);
      setPosts((prev: Post[]) => [...prev, ...postIdList.data]);
    }
  }, []);

  const loader = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    if (page) {
      sendQuery();
    }
  }, [page, sendQuery]);

  const handleObserver: IntersectionObserverCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setPage((prev) => prev + 1);
      }
    },
    []
  );

  useEffect(() => {
    //IntersectionObserver에 전달하는 옵션
    //root는 어떤 기준으로 타겟 요소와 기준 요소 사이의 intersection 변화를
    //탐지할지 작성
    //root는 가시성을 확인할 때 사용되는 뷰포트 요소
    //대상 객체의 조상요소로 설정, 기본 값은 브라우저 뷰포트
    //root: null -> 브라우저 뷰포트로 설정
    //rootMargin -> root가 가진 여백 -> 시계방향으로 설정
    //margin으로 기준 요소를 수축, 증가시켜서 교차성을 계산
    //threshold -> 가시성을 퍼센티지로 나타냄 -> 얼마나 보여지면 콜백을 호출할 것인지 지정
    console.log("set handler");
    const option: IntersectionObserverInit = {
      root: null,
      rootMargin: "600px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    if (loader.current) observer.observe(loader.current);
  }, [handleObserver]);

  const addPostComponent = useMemo(
    () => <AddPostElement prevData={{ setPostData: setAddPostData }} />,
    []
  );

  const postListComponent = useMemo(() => {
    if (!posts) {
      return null;
    }
    return posts.map((postId, i) => {
      return (
        <PostElement
          key={`${postId.username}/${postId.date}`}
          post={postId}
          removePost={removePost}
        />
      );
    });
  }, [posts, removePost]);

  //렌더
  //post가 있는 경우
  return (
    <>
      <div className={styles.container}>
        {addPostComponent}
        {postListComponent}
      </div>
      <div ref={loader} className={styles.loader}></div>
    </>
  );
}
