import styles from "./scss/CommentElement.module.scss";
import { useCallback, useState } from "react";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { Comment } from "../../types/post.type";
import RemoveConfirmModal from "./RemoveConfirmModal";
import PostServices from "../../services/PostServices";
import AddComment from "./AddComment";
import SubcommentList from "./SubcommentList";
import CommentCard from "../atoms/CommentCard";
import CheckUserBlock from "../atoms/CheckUserBlock";
import DefaultButton from "../atoms/DefaultButton";
import CommentsButton from "../atoms/CommentsButton";
import ProfileBlock from "./ProfileBlock";

interface CommentElementProps {
  comment: Comment;
  commentsListHandlerWithRenderLength: (
    comment: Comment,
    type: "modify" | "add" | "remove"
  ) => void;
  borderBottom: boolean;
  parentShowComment: boolean;
  game: string;
}

export default function CommentElement({
  comment,
  commentsListHandlerWithRenderLength: commentsListHandler,
  borderBottom,
  parentShowComment,
  game,
}: CommentElementProps) {
  //삭제 확인 모달
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
  }, []);

  const handleRemoveModalOpen = useCallback(() => {
    if (comment.subcomments.length) {
      window.alert("대댓글이 있는 댓글은 제거할 수 없습니다.");
      return;
    }
    setShowRemoveModal(true);
  }, [comment]);

  const [loading, setLoading] = useState<boolean>(false);

  //모달에 전달 -> 모달에서 제거 누르면 실행
  const removeComment = useCallback(async () => {
    setLoading(true);
    const success = await PostServices.removeComments(comment);
    if (!success) {
      window.alert("댓글을 제거하는데 실패했습니다. 다시 시도해주세요.");
      handleRemoveModalClose();
      setLoading(false);
      return;
    }
    commentsListHandler(comment, "remove");
    setLoading(false);
    handleRemoveModalClose();
  }, [comment, commentsListHandler, handleRemoveModalClose]);

  const [addSubcomment, setAddSubcomment] = useState<boolean>(false);

  const addSubcommentHandler = useCallback(() => {
    setAddSubcomment((prev) => !prev);
  }, []);

  const [mode, setMode] = useState<"" | "modify">("");

  const setModeModify = useCallback(() => {
    setMode("modify");
  }, []);

  const setModeDefault = useCallback(() => {
    setMode("");
  }, []);

  if (mode === "modify") {
    return (
      <>
        <AddComment
          postId={comment.postId}
          commentsListHandlerWithRenderLength={commentsListHandler}
          prevData={{ comment, setModeDefault }}
          game={comment.game}
        />
        {comment.subcomments ? (
          <SubcommentList
            subcomments={{
              data: comment.subcomments,
              lastEvaluatedKey: comment.subcommentsLastEvaluatedKey,
            }}
            postId={comment.postId}
            commentId={`${comment.postId}/${comment.date}`}
            addSubcomment={addSubcomment}
            setAddSubcomment={setAddSubcomment}
            key={`${comment.postId}/${comment.date}`}
            game={comment.game}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <CommentCard>
        <CommentCard.Header>
          <ProfileBlock profile={comment.profile} />
        </CommentCard.Header>
        <CommentCard.Body>
          <div className={styles.comment_text}>{comment.text}</div>
          <div className={styles.comment_date}>{`${
            comment.game
          } - ${comment.date.slice(0, comment.date.length - 4)}`}</div>
        </CommentCard.Body>
        {parentShowComment ? (
          <CommentCard.Buttons>
            <CommentsButton
              size="sm"
              onClick={addSubcommentHandler}
              active={addSubcomment}
            ></CommentsButton>
            <CheckUserBlock resourceUsername={comment.username}>
              <DefaultButton
                size="sm"
                onClick={setModeModify}
                className={styles.btn_margin}
              >
                <BsPencilSquare />{" "}
                <span className={styles.comment_btn_text}>수정</span>
              </DefaultButton>
              <DefaultButton size="sm" onClick={handleRemoveModalOpen}>
                <BsTrash />{" "}
                <span className={styles.comment_btn_text}>삭제</span>
              </DefaultButton>
            </CheckUserBlock>
          </CommentCard.Buttons>
        ) : null}
        <RemoveConfirmModal
          show={showRemoveModal}
          close={handleRemoveModalClose}
          loading={loading}
          remove={removeComment}
        />
      </CommentCard>
      {comment.subcomments && parentShowComment ? (
        <SubcommentList
          subcomments={{
            data: comment.subcomments,
            lastEvaluatedKey: comment.subcommentsLastEvaluatedKey,
          }}
          postId={comment.postId}
          commentId={`${comment.postId}/${comment.date}`}
          addSubcomment={addSubcomment}
          setAddSubcomment={setAddSubcomment}
          key={`${comment.postId}/${comment.date}`}
          game={game}
        />
      ) : null}
    </>
  );
}
