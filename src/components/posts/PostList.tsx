import styles from "./PostList.module.scss";
import AddPostElement from "./AddPostElement";
import PostElement from "./PostElement";
import PostServices from "../../services/PostServices";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Post } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import { AiOutlineCheck, AiOutlineLoading3Quarters } from "react-icons/ai";
import UserHomeCard from "../UserHomeCard";
import ProfileCard from "../ProfileCard";
import { Profile } from "../../types/profile.type";
import ProfileServices from "../../services/ProfileServices";

interface Props {
  category: string;
  searchParam: string;
}

export default function PostList({ category, searchParam }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    PostServices.init();
    setPosts([]);
  }, [category, searchParam]);

  const removePost = useCallback((postId: string) => {
    setPosts((prev: Post[]) =>
      prev.filter(
        (prevPost) => `${prevPost.username}/${prevPost.date}` !== postId
      )
    );
  }, []);

  const [addPostData, setAddPostData] = useState<Post | null>(null);

  useEffect(() => {
    if (addPostData) {
      setPosts((prev: Post[]) => [addPostData, ...prev]);
      setAddPostData(null);
    }
  }, [addPostData]);

  const [queryLoading, setQueryLoading] = useState<boolean>(false);
  const sendQuery = useCallback(async () => {
    console.log("query");
    setQueryLoading(true);
    const postIdList = await PostServices.getPosts(
      category,
      searchParam ? searchParam : ""
    );
    if (!postIdList) {
      window.alert(
        "포스트를 가져오는데 오류가 발생했습니다. 다시 시도해주세요."
      );
      return;
    }
    if (postIdList.length) {
      setPosts((prev: Post[]) => [...prev, ...postIdList]);
    }
    setQueryLoading(false);
  }, [category, searchParam]);

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

  //IntersectionObserver에 전달하는 옵션
  //root는 어떤 기준으로 타겟 요소와 기준 요소 사이의 intersection 변화를
  //탐지할지 작성
  //root는 가시성을 확인할 때 사용되는 뷰포트 요소
  //대상 객체의 조상요소로 설정, 기본 값은 브라우저 뷰포트
  //root: null -> 브라우저 뷰포트로 설정
  //rootMargin -> root가 가진 여백 -> 시계방향으로 설정
  //margin으로 기준 요소를 수축, 증가시켜서 교차성을 계산
  //threshold -> 가시성을 비율로 나타냄 -> 얼마나 보여지면 콜백을 호출할 것인지 지정
  useEffect(() => {
    console.log("set handler");
    const option: IntersectionObserverInit = {
      root: null,
      rootMargin: "600px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(handleObserver, option);
    const savedLoader = loader.current;
    if (savedLoader) observer.observe(savedLoader);
    return () => {
      console.log("clear handler");
      if (savedLoader) observer.unobserve(savedLoader);
    };
  }, [handleObserver]);

  const [title, setTitle] = useState<string>("");
  const { username, currentProfile } = useContext(UserDataContext);
  const [searchProfile, setSearchProfile] = useState<Profile>();
  const getProfile = useCallback(async (profileId: string) => {
    const profile = await ProfileServices.getProfileById(profileId);
    if (!profile) {
      window.alert("프로필 정보를 가져오는데 오류가 발생했습니다.");
      return;
    }
    setSearchProfile(profile);
    if (profile.nickname !== "삭제된 프로필") {
      setTitle(`프로필/${profile.nickname}(${profile.username})`);
    } else {
      setTitle(`프로필/삭제된 프로필`);
    }
  }, []);

  const getTitle = useCallback((): void => {
    if (category) {
      if (category === "profiles") {
        if (currentProfile.id === searchParam) {
          setSearchProfile({ ...currentProfile });
          setTitle(`프로필/${currentProfile.nickname}`);
          return;
        } else {
          if (searchParam) {
            getProfile(searchParam);
            return;
          }
          setTitle("프로필");
          return;
        }
      } else if (category === "games") {
        setSearchProfile((prev) => (prev ? undefined : prev));
        if (searchParam) {
          setTitle(`게임/${decodeURI(searchParam)}`);
          return;
        }
        setTitle("게임");
        return;
      } else if (category === "usernames") {
        setSearchProfile((prev) => (prev ? undefined : prev));
        if (searchParam) {
          setTitle(`유저/${decodeURI(searchParam)}`);
          return;
        }
        setTitle("유저");
        return;
      } else {
        setSearchProfile((prev) => (prev ? undefined : prev));
        setTitle("카테고리");
        return;
      }
    }
    setSearchProfile((prev) => (prev ? undefined : prev));
    setTitle("전체");
    return;
  }, [category, currentProfile, getProfile, searchParam]);

  useEffect(() => {
    getTitle();
  }, [getTitle]);

  //렌더
  //post가 있는 경우
  return (
    <>
      <div className={styles.container}>
        <h3 className={styles.category}>{title}</h3>
        {category === "usernames" ? (
          <UserHomeCard username={decodeURI(searchParam)} />
        ) : null}
        {category === "profiles" ? (
          <ProfileCard searchProfile={searchProfile} />
        ) : null}
        {!category ||
        category === "games" ||
        (category === "usernames" && username === decodeURI(searchParam)) ||
        (category === "profiles" && currentProfile.id === searchParam) ? (
          <AddPostElement prevData={{ setPostData: setAddPostData }} />
        ) : null}
        {posts.map((post, i) => {
          return (
            <PostElement
              key={`${post.username}/${post.date}`}
              post={post}
              removePost={removePost}
            />
          );
        })}
        <div className={styles.final_container} ref={loader}>
          <h3 className={styles.final}>
            {queryLoading ? (
              <div className={styles.loading}>
                <AiOutlineLoading3Quarters />
              </div>
            ) : (
              <div className={styles.loading_done}>
                <AiOutlineCheck />
              </div>
            )}
          </h3>
        </div>
      </div>
    </>
  );
}
