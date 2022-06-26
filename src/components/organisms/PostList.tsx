import styles from "./scss/PostList.module.scss";
import AddPostElement from "../molecules/AddPostElement";
import PostElement from "./PostElement";
import PostServices from "../../services/PostServices";
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Comment,
  CommentsLastEvaluatedKey,
  Post,
  Subcomment,
  SubcommentsLastEvaluatedKey,
} from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import { AiOutlineCheck } from "react-icons/ai";
import UserHomeCard from "./UserHomeCard";
import ProfileCard from "./ProfileCard";
import { Profile } from "../../types/profile.type";
import ProfileServices from "../../services/ProfileServices";
import LoadingBlock from "../atoms/LoadingBlock";
import { ChildProps } from "../../types/props.type";
import LikeServices from "../../services/LikeServices";

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
      console.log(addPostData);
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
            <PostDataContextProvider
              postData={post}
              key={`${post.username}/${post.date}`}
            >
              <PostElement removePost={removePost} />
            </PostDataContextProvider>
          );
        })}
        <div className={styles.final_container} ref={loader}>
          <div className={styles.final}>
            <LoadingBlock loading={queryLoading} size="md">
              {queryLoading ? null : (
                <div className={styles.loading_done}>
                  <AiOutlineCheck />
                </div>
              )}
            </LoadingBlock>
          </div>
        </div>
      </div>
    </>
  );
}

//Context
interface PostDataContextType {
  post: Post;
  setPost: (post: Post) => void;
  comments: Comment[];
  commentsListHandler: (
    comments: Comment[],
    type: "modify" | "add" | "remove" | "more"
  ) => void;
  subcommentsListHandler: (
    type: "modify" | "add" | "remove" | "more",
    handleCommentId: string,
    handleSubcomments: Subcomment[],
    lastEvaluatedKey?: SubcommentsLastEvaluatedKey
  ) => void;
  commentsLastEvaluatedKey?: CommentsLastEvaluatedKey;
  commentsLastEvaluatedKeyHandler: (
    key: CommentsLastEvaluatedKey | undefined
  ) => void;
  postLike: () => void;
  postDislike: () => void;
  modifyPost: (newPost: Post) => void;
}

const initialPostContext: PostDataContextType = {
  post: {
    date: "",
    images: [],
    likes: [],
    dislikes: [],
    comments: [],
    profileId: "",
    game: "",
    text: "",
    username: "",
    profile: {
      username: "",
      id: "",
      nickname: "",
      game: "",
      profileImage: undefined,
    },
  },
  setPost: (post: Post) => {},
  comments: [],
  commentsLastEvaluatedKey: undefined,
  commentsListHandler: (comments, type) => {},
  subcommentsListHandler: (
    type: "modify" | "add" | "remove" | "more",
    handleCommentId: string,
    handleSubcomments: Subcomment[],
    lastEvaluatedKey?: SubcommentsLastEvaluatedKey
  ) => {},
  commentsLastEvaluatedKeyHandler: (key) => {},
  postLike: () => {},
  postDislike: () => {},
  modifyPost: () => {},
};

export const PostDataContext =
  createContext<PostDataContextType>(initialPostContext);

interface PostContextType extends ChildProps {
  postData: Post;
}

const PostDataContextProvider: FC<PostContextType> = ({
  children,
  postData,
}) => {
  const { username } = useContext(UserDataContext);
  const [post, setPost] = useState<Post>(postData);

  const modifyPost = useCallback((newPost: Post) => {
    setPost(newPost);
  }, []);

  const postLike = useCallback(() => {
    if (!post.date) {
      return;
    }
    const postId = `${post.username}/${post.date}`;
    const currentLike = post.likes.includes(username);
    const currentDislike = post.dislikes.includes(username);
    setPost((prevData: Post) => {
      return {
        ...prevData,
        likes: currentLike
          ? prevData.likes.filter((user) => user !== username)
          : [...prevData.likes, username],
        dislikes: currentDislike
          ? prevData.dislikes.filter((user) => user !== username)
          : prevData.dislikes,
      };
    });
    if (currentLike) {
      LikeServices.postLikeRemove(postId).then((success) => {
        if (!success) {
          setPost((prevData: Post) => {
            return {
              ...prevData,
              likes: [...prevData.likes, username],
            };
          });
          window.alert(
            "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      });
    } else {
      LikeServices.postLike(postId).then((success) => {
        if (!success) {
          setPost((prevData: Post) => {
            return {
              ...prevData,
              likes: prevData.likes.filter((user) => user !== username),
              dislikes: currentDislike
                ? [...prevData.dislikes, username]
                : prevData.dislikes,
            };
          });

          window.alert(
            "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      });
    }
  }, [post.date, post.dislikes, post.likes, post.username, username]);

  const postDislike = useCallback(async () => {
    if (!post.date) {
      return;
    }

    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    //서버에서 알아서 좋아요 있으면 제거하고 싫어요 추가함
    const postId = `${post.username}/${post.date}`;
    const currentLike = post.likes.includes(username);
    const currentDislike = post.dislikes.includes(username);
    setPost((prevData: Post) => {
      return {
        ...prevData,
        likes: currentLike
          ? prevData.likes.filter((user) => user !== username)
          : prevData.likes,
        dislikes: currentDislike
          ? prevData.dislikes.filter((user) => user !== username)
          : [...prevData.dislikes, username],
      };
    });

    if (currentDislike) {
      LikeServices.postDislikeRemove(postId).then((success) => {
        if (!success) {
          setPost((prevData: Post) => {
            return {
              ...prevData,
              dislikes: [...prevData.dislikes, username],
            };
          });
          window.alert(
            "싫어요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      });
    } else {
      LikeServices.postDislike(postId).then((success) => {
        if (!success) {
          setPost((prevData: Post) => {
            return {
              ...prevData,
              likes: currentLike
                ? [...prevData.likes, username]
                : prevData.likes,
              dislikes: prevData.dislikes.filter((user) => user !== username),
            };
          });
          window.alert(
            "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      });
    }
  }, [post.date, post.dislikes, post.likes, post.username, username]);

  const [comments, setComments] = useState<Comment[]>(postData.comments);
  const [commentsLastEvaluatedKey, setCommentsLastEvaluatedKey] = useState<
    CommentsLastEvaluatedKey | undefined
  >(postData.commentsLastEvaluatedKey);

  const commentsLastEvaluatedKeyHandler = (
    key: CommentsLastEvaluatedKey | undefined
  ) => {
    setCommentsLastEvaluatedKey(key);
  };

  const commentsListHandler = useCallback(
    (comments: Comment[], type: "modify" | "add" | "remove" | "more") => {
      if (type === "add") {
        setComments((prev) => [...comments, ...prev]);
        return;
      }

      if (type === "more") {
        setComments((prev) => [...prev, ...comments]);
      }

      if (!comments.length) {
        return;
      }

      const handledComment = comments[0];
      const handleCommentId = `${handledComment.postId}/${handledComment.date}`;

      if (type === "remove") {
        setComments((prev) =>
          prev.filter((prevComment) => {
            const commentId = `${prevComment.postId}/${prevComment.date}`;
            return commentId !== handleCommentId;
          })
        );
        return;
      }

      setComments((prev) =>
        prev.map((prevComment) => {
          const commentId = `${prevComment.postId}/${prevComment.date}`;
          if (commentId === handleCommentId) {
            return {
              ...prevComment,
              ...handledComment,
            };
          }

          return prevComment;
        })
      );
    },
    []
  );

  const subcommentsListHandler = useCallback(
    (
      type: "modify" | "add" | "remove" | "more",
      handleCommentId: string,
      handleSubcomments: Subcomment[],
      lastEvaluatedKey?: SubcommentsLastEvaluatedKey
    ) => {
      setComments((prev) => {
        if (!handleSubcomments.length) {
          return prev;
        }

        return prev.map((comment) => {
          const commentId = `${comment.postId}/${comment.date}`;

          if (commentId !== handleCommentId) {
            return comment;
          }

          if (type === "more") {
            return {
              ...comment,
              subcomments: [...comment.subcomments, ...handleSubcomments],
              subcommentsLastEvaluatedKey: lastEvaluatedKey,
            };
          }

          const handleSubcomment = handleSubcomments[0];

          if (type === "add") {
            return {
              ...comment,
              subcomments: [handleSubcomment, ...comment.subcomments],
            };
          }

          if (type === "remove") {
            return {
              ...comment,
              subcomments: comment.subcomments.filter(
                (prevSubcomment) =>
                  prevSubcomment.date !== handleSubcomment.date
              ),
            };
          }

          return {
            ...comment,
            subcomments: comment.subcomments.map((prevSubcomment) => {
              if (prevSubcomment.date !== handleSubcomment.date) {
                return prevSubcomment;
              }

              return handleSubcomment;
            }),
          };
        });
      });
    },
    []
  );

  return (
    <PostDataContext.Provider
      value={{
        post,
        setPost,
        comments,
        commentsLastEvaluatedKey,
        commentsLastEvaluatedKeyHandler,
        commentsListHandler,
        subcommentsListHandler,
        postLike,
        postDislike,
        modifyPost,
      }}
    >
      {children}
    </PostDataContext.Provider>
  );
};
