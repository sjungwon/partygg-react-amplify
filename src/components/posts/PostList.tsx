import styles from "./PostList.module.scss";
import AddPostElement from "./AddPostElement";
import PostElement from "./PostElement";
import PostServices from "../../services/PostServices";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Post } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import LikeServices from "../../services/LikeServices";

export interface UpdatePost {
  postData: Post | null;
  success: boolean;
  type:
    | "add"
    | "update"
    | "remove"
    | "postLike"
    | "postLikeRemove"
    | "postDislike"
    | "postDislikeRemove"
    | "";
}

export const initialUpdatePost: UpdatePost = {
  postData: null,
  success: false,
  type: "",
};

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    PostServices.getPost().then((postsData) => {
      if (postsData) {
        setPosts(postsData.data);
      }
      setLoading(false);
    });
  }, []);

  const [updatePost, setUpdatePost] = useState<UpdatePost>(initialUpdatePost);

  //포스트 수정,추가 성공시
  useEffect(() => {
    if (updatePost.success && updatePost.postData) {
      console.log("success change");
      const failFunc = (prevData: Post, failMessage: string) => {
        if (prevData) {
          setPosts((prevPost: Post[]) => {
            const newPost = prevPost.map((post) => {
              if (
                post.username === prevData?.username &&
                post.date === prevData?.date
              ) {
                return prevData;
              }
              return post;
            });
            return newPost ? newPost : prevPost;
          });
        }
        window.alert(failMessage);
      };
      switch (updatePost.type) {
        case "update": {
          const updatePostId = `${updatePost.postData?.username}-${updatePost.postData?.date}`;
          let prevData: Post | undefined = posts.find(
            (post) => `${post.username}-${post.date}` === updatePostId
          );

          setPosts((prevPost: Post[]) => {
            const newPost = prevPost.map((post) => {
              if (
                post.username === updatePost.postData?.username &&
                post.date === updatePost.postData?.date
              ) {
                return updatePost.postData;
              }
              return post;
            });
            if (newPost !== undefined) {
              return newPost;
            } else {
              return prevPost;
            }
          });

          if (prevData) {
            console.log(prevData);
            PostServices.updatePost(updatePost.postData).then((success) => {
              console.log(success);
              if (!success && prevData) {
                failFunc(
                  prevData,
                  "포스트를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
                );
              }
            });
          }
          break;
        }
        case "add": {
          setPosts((prevPost: Post[]) => [
            updatePost.postData as Post,
            ...prevPost,
          ]);
          break;
        }
        case "remove": {
          const removePostId = `${updatePost.postData?.username}-${updatePost.postData?.date}`;
          let prevDataIndex: number = posts.findIndex(
            (post) => `${post.username}-${post.date}` === removePostId
          );
          let prevData: Post | undefined = posts.find(
            (post) => `${post.username}-${post.date}` === removePostId
          );
          setPosts((prevPost: Post[]) =>
            prevPost.filter((post) => {
              const postId = `${post.username}-${post.date}`;
              return removePostId !== postId;
            })
          );
          if (prevData) {
            console.log(prevData);
            PostServices.removePost(prevData).then((success) => {
              console.log(success);
              if (!success && prevData) {
                setPosts((prevPosts: Post[]) => {
                  const front = prevPosts.slice(0, prevDataIndex);
                  const back = prevPosts.slice(prevDataIndex, prevPosts.length);
                  return [...front, prevData, ...back] as Post[];
                });
                window.alert(
                  "포스트를 제거 중에 오류가 발생했습니다. 다시 시도해주세요."
                );
              }
            });
          }
          break;
        }
        case "postLike":
        case "postLikeRemove":
        case "postDislike":
        case "postDislikeRemove": {
          let prevData: Post | undefined = posts.find(
            (post) =>
              post.username === updatePost.postData?.username &&
              post.date === updatePost.postData?.date
          );
          const updatePostId = `${updatePost.postData?.username}-${updatePost.postData?.date}`;
          setPosts((prevPost: Post[]) => {
            const newPost = prevPost.map((post) => {
              if (
                post.username === updatePost.postData?.username &&
                post.date === updatePost.postData?.date
              ) {
                return updatePost.postData;
              }
              return post;
            });
            return newPost ? newPost : prevPost;
          });
          switch (updatePost.type) {
            case "postLike": {
              LikeServices.postLike(updatePostId).then((success) => {
                if (!success && prevData) {
                  failFunc(
                    prevData,
                    "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
                  );
                }
              });
              break;
            }
            case "postLikeRemove": {
              LikeServices.postLikeRemove(updatePostId).then((success) => {
                if (!success && prevData) {
                  failFunc(
                    prevData,
                    "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
                  );
                }
              });
              break;
            }
            case "postDislike": {
              LikeServices.postDislike(updatePostId).then((success) => {
                if (!success && prevData) {
                  failFunc(
                    prevData,
                    "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
                  );
                }
              });
              break;
            }
            case "postDislikeRemove": {
              LikeServices.postDislikeRemove(updatePostId).then((success) => {
                if (!success && prevData) {
                  failFunc(
                    prevData,
                    "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
                  );
                }
              });
              break;
            }
            default:
              break;
          }
          break;
        }
        default:
          break;
      }

      setUpdatePost(initialUpdatePost);
    }
  }, [posts, updatePost.postData, updatePost.success, updatePost.type]);

  //loading 중인 경우 = post를 가져오는 중 -> 서버 없을 때 setTimeout으로 구현해놨음
  if (loading) {
    return <div className={styles.container}>loading</div>;
  }

  //post가 있는 경우
  return (
    <div className={styles.container}>
      <AddPostElement
        updatePost={initialUpdatePost}
        setUpdatePost={setUpdatePost}
      />
      {posts
        ? posts.map((elem) => {
            const postId = `${elem.username}-${elem.date}`;

            if (
              updatePost.type === "update" &&
              updatePost.postData &&
              postId ===
                `${updatePost.postData.username}-${updatePost.postData.date}`
            ) {
              return (
                <AddPostElement
                  key={postId}
                  updatePost={updatePost}
                  setUpdatePost={setUpdatePost}
                />
              );
            }
            return (
              <PostElement
                key={postId}
                data={elem}
                setUpdatePost={setUpdatePost}
              />
            );
          })
        : null}
    </div>
  );
}
