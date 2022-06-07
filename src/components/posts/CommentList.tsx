import { Comment, CommentsLastEvaluatedKey } from "../../types/post.type";
import styles from "./CommentList.module.scss";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GoTriangleUp, GoTriangleDown } from "react-icons/go";
import { AiOutlineDownCircle, AiOutlineUpCircle } from "react-icons/ai";
import { FiMoreHorizontal } from "react-icons/fi";
import CommentElement from "./CommentElement";
import PostServices from "../../services/PostServices";
import AddComment from "./AddComment";
import { Card } from "react-bootstrap";

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
    commentsData.data.length > 2 ? 3 : commentsData.data.length
  );
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
            const extraComments = await PostServices.getNextComments(
              lastEvaluatedKey
            );
            if (extraComments) {
              setComments((prev) => [...prev, ...extraComments.data]);
              setLastEvaluatedKey(extraComments.commentsLastEvaluatedKey);
              setRenderLength(comments.length + extraComments.data.length - 1);
            }
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

  const commentsNavigator = useMemo(
    () =>
      comments.length > 1 ? (
        <div className={styles.direct} onClick={openComments}>
          <div className={styles.direct_icon}>
            <GoTriangleDown />
          </div>
        </div>
      ) : (
        <div className={styles.blank}></div>
      ),
    [comments.length, openComments]
  );

  //더보기 누르면 comment를 더 가져오도록 설정
  //닫기를 누르면 다시 처음으로 돌아가는걸 원함
  //renderlength를 사용 -> 보여주는건 renderLength로 조절
  //max가 찍히면
  //lastkey가 있으면 데이터를 가져오고 + 더보기를 보여줌
  //lastkey가 없으면 닫는거만 보여줌

  const [addedComments, setAddedComments] = useState<Comment | null>(null);
  const commentsListHandler = useCallback(
    (comment: Comment, type: "modify" | "add") => {
      if (type === "add") {
        setAddedComments(comment);
        setRenderLength((prev) => prev + 1);
        return;
      }

      const newCommentId = `${comment.postId}/${comment.date}`;
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
  useEffect(() => {
    if (addedComments) {
      setComments((prev) => [addedComments, ...prev]);
      setAddedComments(null);
    }
  }, [addedComments]);

  //렌더
  //comment를 열지 않았을 때
  if (!showComment) {
    //Comment가 없는 경우
    if (!comments.length) {
      return null;
    }

    if (comments.length) {
      return (
        <Card.Footer className={styles.card_footer}>
          <CommentElement
            key={`${comments[0].postId}/${comments[0].date}`}
            comment={comments[0]}
            commentsListHandler={commentsListHandler}
            borderBottom={false}
          />
          {commentsNavigator}
        </Card.Footer>
      );
    }
  }

  //Comment를 연 경우
  return (
    <Card.Footer className={styles.card_footer}>
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
          />
        );
      })}
      <div className={styles.more_container}>
        {renderLength < comments.length || lastEvaluatedKey ? (
          <div className={styles.more} onClick={renderLengthHandler("more")}>
            {"더보기 "}
            <span className={styles.more_icon}>
              <AiOutlineDownCircle />
            </span>
          </div>
        ) : null}
        {renderLength > 3 ? (
          <div className={styles.more} onClick={renderLengthHandler("close")}>
            {"닫기 "}
            <span className={styles.more_icon}>
              <AiOutlineUpCircle />
            </span>
          </div>
        ) : null}
      </div>
      <div className={styles.direct} onClick={closeComments}>
        <div className={styles.direct_icon}>
          <GoTriangleUp />
        </div>
      </div>
    </Card.Footer>
  );
}
