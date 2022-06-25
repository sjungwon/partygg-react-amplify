import { Comment, CommentsLastEvaluatedKey } from "../../types/post.type";
import styles from "./scss/CommentList.module.scss";
import { useCallback, useEffect, useState } from "react";
import { GoTriangleUp, GoTriangleDown } from "react-icons/go";
import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import CommentElement from "./CommentElement";
import PostServices from "../../services/PostServices";
import AddComment from "../molecules/AddComment";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";

export interface CommentsData {
  data: Comment[];
  lastEvaluatedKey?: CommentsLastEvaluatedKey;
}

interface CommentElementProps {
  postId: string;
  commentsData: CommentsData;
  showComment: boolean;
  setShowComment: (value: boolean) => void;
}

export default function CommentList({
  postId,
  commentsData,
  showComment,
  setShowComment,
}: CommentElementProps) {
  const [comments, setComments] = useState<Comment[]>(commentsData.data);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState<
    CommentsLastEvaluatedKey | undefined
  >(commentsData.lastEvaluatedKey);

  const [renderLength, setRenderLength] = useState<number>(
    comments.length > 2 ? 3 : comments.length
  );

  useEffect(() => {
    if (!showComment) {
      setRenderLength(comments.length > 2 ? 3 : comments.length);
    }
  }, [comments.length, commentsData.data.length, showComment]);

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
              setComments((prev) => [...prev, ...extraComments.data]);
              setLastEvaluatedKey(extraComments.commentsLastEvaluatedKey);
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
    [comments.length, lastEvaluatedKey, renderLength]
  );

  const openComments = useCallback(() => {
    setShowComment(true);
  }, [setShowComment]);

  const closeComments = useCallback(() => {
    renderLengthHandler("close")();
    setShowComment(false);
  }, [renderLengthHandler, setShowComment]);

  //더보기 누르면 comment를 더 가져오도록 설정
  //닫기를 누르면 다시 처음으로 돌아가는걸 원함
  //renderlength를 사용 -> 보여주는건 renderLength로 조절
  //max가 찍히면
  //lastkey가 있으면 데이터를 가져오고 + 더보기를 보여줌
  //lastkey가 없으면 닫는거만 보여줌

  const commentsListHandler = useCallback(
    (comment: Comment, type: "modify" | "add" | "remove") => {
      if (type === "add") {
        setComments((prev) => [comment, ...prev]);
        setRenderLength((prev) => prev + 1);
        return;
      }

      const newCommentId = `${comment.postId}/${comment.date}`;

      if (type === "remove") {
        setComments((prev) =>
          prev.filter((prevComment) => {
            const commentId = `${prevComment.postId}/${prevComment.date}`;
            return commentId !== newCommentId;
          })
        );
        setRenderLength((prev) => (prev > 1 ? prev - 1 : prev));
        return;
      }

      setComments((prev) =>
        prev.map((prevComment) => {
          const commentId = `${prevComment.postId}/${prevComment.date}`;
          if (commentId === newCommentId) {
            return comment;
          }

          return prevComment;
        })
      );
    },
    []
  );

  //렌더
  //comment를 열지 않았을 때
  if (!showComment) {
    //Comment가 없는 경우
    if (!comments.length) {
      return null;
    }

    if (comments.length) {
      return (
        <>
          <CommentElement
            key={`${comments[0].postId}/${comments[0].date}`}
            comment={comments[0]}
            commentsListHandler={commentsListHandler}
            borderBottom={false}
            parentShowComment={showComment}
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

  //Comment를 연 경우
  return (
    <>
      <AddComment
        postId={`${postId}`}
        commentsListHandler={commentsListHandler}
      />
      {comments.slice(0, renderLength).map((comment, i) => {
        return (
          <CommentElement
            key={`${comment.postId}/${comment.date}`}
            comment={comment}
            commentsListHandler={commentsListHandler}
            borderBottom={true}
            parentShowComment={showComment}
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
              {commentLoading ? "가져오는 중..." : "더보기 "}
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
            {"닫기 "}
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