import { Comment, CommentsLastEvaluatedKey } from "../../types/post.type";
import styles from "./scss/CommentList.module.scss";
import { useCallback, useContext, useEffect, useState } from "react";
import { GoTriangleUp, GoTriangleDown } from "react-icons/go";
import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import CommentElement from "./CommentElement";
import PostServices from "../../services/PostServices";
import AddComment from "./AddComment";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import { PostListContext } from "../../context/PostListContextProvider";

export interface CommentsData {
  data: Comment[];
  lastEvaluatedKey?: CommentsLastEvaluatedKey;
}

interface CommentElementProps {
  postId: string;
  game: string;
  showComment: boolean;
  setShowComment: (value: boolean) => void;
  comments: Comment[];
  commentsLastEvaluatedKey?: CommentsLastEvaluatedKey;
}

export default function CommentList({
  postId,
  game,
  showComment,
  setShowComment,
  comments,
  commentsLastEvaluatedKey: lastEvaluatedKey,
}: CommentElementProps) {
  const { commentsListHandler } = useContext(PostListContext);

  const [renderLength, setRenderLength] = useState<number>(
    comments.length > 2 ? 3 : comments.length
  );

  useEffect(() => {
    if (!showComment) {
      setRenderLength(comments.length > 2 ? 3 : comments.length);
    }
  }, [comments.length, showComment]);

  const [commentLoading, setCommentLoading] = useState<boolean>(false);
  const renderLengthHandler = useCallback(
    (type: "more" | "close") => {
      return async () => {
        if (type === "close") {
          setRenderLength(
            comments.length > 0 ? (comments.length > 2 ? 3 : 1) : 0
          );
          return;
        }
        if (renderLength >= comments.length) {
          if (lastEvaluatedKey) {
            setCommentLoading(true);
            const extraComments = await PostServices.getNextComments(
              lastEvaluatedKey
            );
            if (extraComments) {
              commentsListHandler(
                "more",
                postId,
                extraComments.data,
                extraComments.commentsLastEvaluatedKey
              );
              setRenderLength((prev) =>
                extraComments.data.length > 2
                  ? prev + 3
                  : prev + extraComments.data.length
              );
            }
            setCommentLoading(false);
          }
          return;
        } else {
          setRenderLength((prev) =>
            prev + 3 > comments.length ? comments.length : prev + 3
          );
        }
      };
    },
    [
      comments.length,
      commentsListHandler,
      lastEvaluatedKey,
      postId,
      renderLength,
    ]
  );

  const openComments = useCallback(() => {
    setShowComment(true);
  }, [setShowComment]);

  const closeComments = useCallback(() => {
    renderLengthHandler("close")();
    setShowComment(false);
  }, [renderLengthHandler, setShowComment]);

  //????????? ????????? comment??? ??? ??????????????? ??????
  //????????? ????????? ?????? ???????????? ??????????????? ??????
  //renderlength??? ?????? -> ??????????????? renderLength??? ??????
  //max??? ?????????
  //lastkey??? ????????? ???????????? ???????????? + ???????????? ?????????
  //lastkey??? ????????? ???????????? ?????????

  const commentsListHandlerWithRenderLength = useCallback(
    (comment: Comment, type: "modify" | "add" | "remove") => {
      commentsListHandler(type, postId, [comment]);
      if (type === "add") {
        setRenderLength((prev) => prev + 1);
        return;
      }
      if (type === "remove") {
        setRenderLength((prev) => (prev > 1 ? prev - 1 : prev));
        return;
      }
    },
    [commentsListHandler, postId]
  );

  //??????
  //comment??? ?????? ????????? ???
  if (!showComment) {
    //Comment??? ?????? ??????
    if (!comments.length) {
      return null;
    }

    if (comments.length) {
      return (
        <>
          <CommentElement
            key={`${comments[0].postId}/${comments[0].date}`}
            comment={comments[0]}
            commentsListHandlerWithRenderLength={
              commentsListHandlerWithRenderLength
            }
            borderBottom={false}
            parentShowComment={showComment}
            game={game}
          />
          {comments.length > 1 ||
          (comments.length && comments[0].subcomments.length) ? (
            <div className={styles.direct} onClick={openComments}>
              <div className={styles.direct_icon}>
                <GoTriangleDown />
              </div>
            </div>
          ) : (
            <div className={styles.blank}></div>
          )}
        </>
      );
    }
  }

  //Comment??? ??? ??????
  return (
    <>
      <AddComment
        postId={`${postId}`}
        game={game}
        commentsListHandlerWithRenderLength={
          commentsListHandlerWithRenderLength
        }
      />
      {comments.slice(0, renderLength).map((comment, i) => {
        return (
          <CommentElement
            key={`${comment.postId}/${comment.date}`}
            comment={comment}
            commentsListHandlerWithRenderLength={
              commentsListHandlerWithRenderLength
            }
            borderBottom={true}
            parentShowComment={showComment}
            game={game}
          />
        );
      })}
      <div className={styles.more_container}>
        {renderLength < comments.length || lastEvaluatedKey ? (
          <DefaultButton
            size="sm"
            onClick={renderLengthHandler("more")}
            disabled={commentLoading}
          >
            <LoadingBlock loading={commentLoading}>
              {commentLoading ? "???????????? ???..." : "????????? "}
              <AiOutlineDownCircle className={styles.more_icon} />
            </LoadingBlock>
          </DefaultButton>
        ) : null}
        {renderLength > 3 ? (
          <DefaultButton
            size="sm"
            onClick={renderLengthHandler("close")}
            disabled={commentLoading}
          >
            {"?????? "}
            <AiOutlineUpCircle className={styles.more_icon} />
          </DefaultButton>
        ) : null}
      </div>
      <div className={styles.direct} onClick={closeComments}>
        <div className={styles.direct_icon}>
          <GoTriangleUp />
        </div>
      </div>
    </>
  );
}
