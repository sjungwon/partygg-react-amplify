import { createContext, FC, useCallback, useContext, useState } from "react";
import LikeServices from "../services/LikeServices";
import {
  Comment,
  CommentsLastEvaluatedKey,
  Post,
  Subcomment,
  SubcommentsLastEvaluatedKey,
} from "../types/post.type";
import { ChildProps } from "../types/props.type";
import { UserDataContext } from "./UserDataContextProvider";

interface PostListContextData {
  posts: Post[];
  category: string;
  searchParam: string;
  initPosts: () => void;
  removePost: (postId: string) => void;
  addPost: (post: Post) => void;
  morePosts: (posts: Post[]) => void;
  modifyPost: (post: Post) => void;
  likePost: (postId: string) => void;
  dislikePost: (postId: string) => void;
  commentsListHandler: (
    type: "modify" | "add" | "remove" | "more",
    handledPostId: string,
    comments: Comment[],
    lastEvaluatedKey?: CommentsLastEvaluatedKey
  ) => void;
  subcommentsListHandler: (
    type: "modify" | "add" | "remove" | "more",
    handledPostId: string,
    handledCommentId: string,
    handledSubcomments: Subcomment[],
    lastEvaluatedKey?: SubcommentsLastEvaluatedKey
  ) => void;
}

const initialPostList: PostListContextData = {
  posts: [],
  category: "",
  searchParam: "",
  initPosts: () => {},
  removePost: () => {},
  addPost: () => {},
  morePosts: () => {},
  modifyPost: () => {},
  likePost: () => {},
  dislikePost: () => {},
  commentsListHandler: (
    type: "modify" | "add" | "remove" | "more",
    handledPostId: string,
    comments: Comment[],
    lastEvaluatedKey?: CommentsLastEvaluatedKey
  ) => {},
  subcommentsListHandler: (
    type: "modify" | "add" | "remove" | "more",
    handledPostId: string,
    handledCommentId: string,
    handledSubcomments: Subcomment[],
    lastEvaluatedKey?: SubcommentsLastEvaluatedKey
  ) => {},
};

export const PostListContext = createContext(initialPostList);

interface PostListProviderProps extends ChildProps {
  category: string;
  searchParam: string;
}

const PostListContextProvider: FC<PostListProviderProps> = ({
  children,
  category,
  searchParam,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { username } = useContext(UserDataContext);

  const initPosts = useCallback(() => {
    setPosts([]);
  }, []);

  const morePosts = useCallback((posts: Post[]) => {
    setPosts((prev: Post[]) => [...prev, ...posts]);
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((prev: Post[]) =>
      prev.filter(
        (prevPost) => `${prevPost.username}/${prevPost.date}` !== postId
      )
    );
  }, []);

  const addPost = useCallback((post: Post) => {
    setPosts((prev: Post[]) => [post, ...prev]);
  }, []);

  const modifyPost = useCallback((handlePost: Post) => {
    const handlePostId = `${handlePost.username}/${handlePost.date}`;
    setPosts((posts: Post[]) =>
      posts.map((post) => {
        const postId = `${post.username}/${post.date}`;

        if (postId !== handlePostId) {
          return post;
        }

        return handlePost;
      })
    );
  }, []);

  const likePost = useCallback(
    (likedPostId: string) => {
      setPosts((posts: Post[]) =>
        posts.map((post) => {
          const postId = `${post.username}/${post.date}`;
          if (postId !== likedPostId) {
            return post;
          }

          const currentLike = post.likes.includes(username);
          const currentDislike = post.dislikes.includes(username);
          if (currentLike) {
            LikeServices.postLikeRemove(postId).then((success) => {
              if (!success) {
                setPosts((posts: Post[]) =>
                  posts.map((post: Post) => {
                    const postId = `${post.username}/${post.date}`;

                    if (postId !== likedPostId) {
                      return post;
                    }

                    return {
                      ...post,
                      likes: [...post.likes, username],
                    };
                  })
                );
                window.alert(
                  "???????????? ?????? ?????? ????????? ??????????????????. ?????? ??????????????????."
                );
              }
            });
          } else {
            LikeServices.postLike(postId).then((success) => {
              if (!success) {
                setPosts((posts: Post[]) =>
                  posts.map((post) => {
                    const postId = `${post.username}/${post.date}`;

                    if (postId !== likedPostId) {
                      return post;
                    }

                    return {
                      ...post,
                      likes: post.likes.filter((user) => user !== username),
                      dislikes: currentDislike
                        ? [...post.dislikes, username]
                        : post.dislikes,
                    };
                  })
                );
                window.alert(
                  "???????????? ?????? ?????? ????????? ??????????????????. ?????? ??????????????????."
                );
              }
            });
          }
          return {
            ...post,
            likes: currentLike
              ? post.likes.filter((user) => user !== username)
              : [...post.likes, username],
            dislikes: currentDislike
              ? post.dislikes.filter((user) => user !== username)
              : post.dislikes,
          };
        })
      );
    },
    [username]
  );

  const dislikePost = useCallback(
    (dislikedPostId: string) => {
      setPosts((posts) =>
        posts.map((post) => {
          const postId = `${post.username}/${post.date}`;
          if (postId !== dislikedPostId) {
            return post;
          }

          const currentLike = post.likes.includes(username);
          const currentDislike = post.dislikes.includes(username);

          if (currentDislike) {
            LikeServices.postDislikeRemove(postId).then((success) => {
              if (!success) {
                setPosts((posts: Post[]) =>
                  posts.map((post: Post) => {
                    const postId = `${post.username}/${post.date}`;

                    if (postId !== dislikedPostId) {
                      return post;
                    }

                    return {
                      ...post,
                      dislikes: [...post.dislikes, username],
                    };
                  })
                );
                window.alert(
                  "???????????? ?????? ?????? ????????? ??????????????????. ?????? ??????????????????."
                );
              }
            });
          } else {
            LikeServices.postDislike(postId).then((success) => {
              if (!success) {
                setPosts((posts: Post[]) =>
                  posts.map((post) => {
                    const postId = `${post.username}/${post.date}`;

                    if (postId !== dislikedPostId) {
                      return post;
                    }

                    return {
                      ...post,
                      likes: currentLike
                        ? [...post.likes, username]
                        : post.likes,
                      dislikes: post.dislikes.filter(
                        (user) => user !== username
                      ),
                    };
                  })
                );
                window.alert(
                  "???????????? ?????? ?????? ????????? ??????????????????. ?????? ??????????????????."
                );
              }
            });
          }

          return {
            ...post,
            likes: currentLike
              ? post.likes.filter((user) => user !== username)
              : post.likes,
            dislikes: currentDislike
              ? post.dislikes.filter((user) => user !== username)
              : [...post.dislikes, username],
          };
        })
      );
    },
    [username]
  );

  const commentsListHandler = useCallback(
    (
      type: "modify" | "add" | "remove" | "more",
      handledPostId: string,
      comments: Comment[],
      lastEvaluatedKey?: CommentsLastEvaluatedKey
    ) => {
      if (!comments.length) {
        return;
      }

      setPosts((posts) =>
        posts.map((post) => {
          const postId = `${post.username}/${post.date}`;

          if (postId !== handledPostId) {
            return post;
          }

          if (type === "add") {
            return {
              ...post,
              comments: [...comments, ...post.comments],
            };
          }

          if (type === "more") {
            return {
              ...post,
              comments: [...post.comments, ...comments],
              commentsLastEvaluatedKey: lastEvaluatedKey,
            };
          }

          const handledComment = comments[0];
          const handledCommentId = `${handledComment.postId}/${handledComment.date}`;

          if (type === "remove") {
            return {
              ...post,
              comments: post.comments.filter((comment) => {
                const commentId = `${comment.postId}/${comment.date}`;
                return commentId !== handledCommentId;
              }),
            };
          }

          return {
            ...post,
            comments: post.comments.map((comment) => {
              const commentId = `${comment.postId}/${comment.date}`;
              if (commentId !== handledCommentId) {
                return comment;
              }

              return {
                ...comment,
                ...handledComment,
              };
            }),
          };
        })
      );
    },
    []
  );

  const subcommentsListHandler = useCallback(
    (
      type: "modify" | "add" | "remove" | "more",
      handledPostId: string,
      handledCommentId: string,
      handledSubcomments: Subcomment[],
      lastEvaluatedKey?: SubcommentsLastEvaluatedKey
    ) => {
      if (!handledSubcomments.length) {
        return;
      }
      setPosts((posts) =>
        posts.map((post) => {
          const postId = `${post.username}/${post.date}`;
          if (postId !== handledPostId) {
            return post;
          }

          const findedComment = post.comments.find((comment) => {
            const commentId = `${comment.postId}/${comment.date}`;
            return commentId === handledCommentId;
          });

          if (!findedComment) {
            return post;
          }

          let newComment = { ...findedComment };

          if (type === "more") {
            newComment.subcomments = [
              ...newComment.subcomments,
              ...handledSubcomments,
            ];
            newComment.subcommentsLastEvaluatedKey = lastEvaluatedKey;
          }

          const handleSubcomment = handledSubcomments[0];
          const handleSubcommentId = `${handleSubcomment.commentId}/${handleSubcomment.date}`;

          if (type === "add") {
            newComment.subcomments = [
              handleSubcomment,
              ...newComment.subcomments,
            ];
          }

          if (type === "remove") {
            newComment.subcomments = newComment.subcomments.filter(
              (subcomment) =>
                subcomment.date !== handleSubcomment.date &&
                subcomment.username !== handleSubcomment.username
            );
          }

          if (type === "modify") {
            newComment.subcomments = newComment.subcomments.map(
              (subcomment) => {
                const subcommentId = `${subcomment.commentId}/${subcomment.date}`;
                if (subcommentId !== handleSubcommentId) {
                  return subcomment;
                }

                return handleSubcomment;
              }
            );
          }

          return {
            ...post,
            comments: post.comments.map((comment) => {
              const commentId = `${comment.postId}/${comment.date}`;
              if (commentId !== handledCommentId) {
                return comment;
              }

              return newComment;
            }),
          };
        })
      );
    },
    []
  );

  return (
    <PostListContext.Provider
      value={{
        posts,
        initPosts,
        removePost,
        addPost,
        category,
        searchParam,
        morePosts,
        modifyPost,
        likePost,
        dislikePost,
        commentsListHandler,
        subcommentsListHandler,
      }}
    >
      {children}
    </PostListContext.Provider>
  );
};

export default PostListContextProvider;
