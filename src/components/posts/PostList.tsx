import styles from "./PostList.module.scss";
import AddPostElement from "./AddPostElement";
import PostElement from "./PostElement";
import PostServices from "../../services/PostServices";
import { useContext, useEffect, useState } from "react";
import { UserDataContext } from "../../context/UserDataContextProvider";
import { Post } from "../../types/post.type";
import FileServices from "../../services/FileServices";

export interface UpdatePost {
  postData: Post | null;
  success: boolean;
  type: "add" | "update" | "remove" | "";
}

export const initialUpdatePost: UpdatePost = {
  postData: null,
  success: false,
  type: "",
};

export interface UpdateLikeData {
  type:
    | "postLike"
    | "postLikeRemove"
    | "postDislike"
    | "postDislikeRemove"
    | "";
  postId: string;
}

export const initialUpdateLikeData: UpdateLikeData = {
  type: "",
  postId: "",
};

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { username } = useContext(UserDataContext);

  useEffect(() => {
    setLoading(true);
    PostServices.getPost().then((postsData) => {
      if (postsData) {
        setPosts(postsData.data);
      }
      setLoading(false);
    });
  }, []);

  const [updateLike, setUpdateLike] = useState<UpdateLikeData>(
    initialUpdateLikeData
  );

  useEffect(() => {
    if (updateLike.type && updateLike.postId) {
      setPosts((prevPosts: Post[]) => {
        const newPosts = prevPosts.map((post) => {
          const postId = `${post.username}-${post.date}`;
          if (postId === updateLike.postId) {
            switch (updateLike.type) {
              case "postLike": {
                return {
                  ...post,
                  likes: [...post.likes, username],
                  dislikes: post.dislikes.filter((user) => user !== username),
                };
              }
              case "postLikeRemove": {
                return {
                  ...post,
                  likes: post.likes.filter((user) => user !== username),
                };
              }
              case "postDislike": {
                return {
                  ...post,
                  likes: post.likes.filter((user) => user !== username),
                  dislikes: [...post.dislikes, username],
                };
              }
              case "postDislikeRemove": {
                return {
                  ...post,
                  dislikes: post.dislikes.filter((user) => user !== username),
                };
              }
              default:
                return post;
            }
          }

          return post;
        });

        return newPosts ? newPosts : prevPosts;
      });
      setUpdateLike(initialUpdateLikeData);
    }
  }, [updateLike, username]);

  const [updatePost, setUpdatePost] = useState<UpdatePost>(initialUpdatePost);

  //포스트 수정,추가 성공시
  useEffect(() => {
    if (updatePost.success && updatePost.postData) {
      console.log("success change");
      switch (updatePost.type) {
        case "update": {
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
              } else {
                prevData?.images.forEach((image) => {
                  FileServices.removeImage(image);
                });
              }
            });
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
                setUpdateLike={setUpdateLike}
              />
            );
          })
        : null}
    </div>
  );
}
