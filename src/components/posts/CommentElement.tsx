import styles from "./CommentElement.module.scss";
import { useCallback, useContext, useMemo, useState } from "react";
import { FaRegComment, FaComment } from "react-icons/fa";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { Comment } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import RemoveConfirmModal from "../RemoveConfirmModal";
import PostServices from "../../services/PostServices";
import AddComment from "./AddComment";
import SubcommentList from "./SubcommentList";
import ProfileBlock from "../ProfileBlock";

interface CommentElementProps {
  comment: Comment;
  commentsListHandler: (
    comment: Comment,
    type: "add" | "modify" | "remove"
  ) => void;
  borderBottom: boolean;
  parentShowComment: boolean;
}

export default function CommentElement({
  comment,
  commentsListHandler,
  borderBottom,
  parentShowComment,
}: CommentElementProps) {
  //사용자 댓글인지 소유 확인
  const { username } = useContext(UserDataContext);
  const checkUser = useMemo(
    () => comment.username === username,
    [comment, username]
  );

  //삭제 확인 모달
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
  }, []);

  const handleRemoveModalOpen = useCallback(() => {
    setShowRemoveModal(true);
  }, []);

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
      <div className={styles.comment_border}>
        <AddComment
          postId={comment.postId}
          commentsListHandler={commentsListHandler}
          prevData={{ comment, setModeDefault }}
        />
        {comment.subcomments ? (
          <SubcommentList
            subcommentsData={{
              data: comment.subcomments,
              lastEvaluatedKey: comment.subcommentsLastEvaluatedKey,
            }}
            commentId={`${comment.postId}/${comment.date}`}
            addSubcomment={addSubcomment}
            setAddSubcomment={setAddSubcomment}
          />
        ) : null}
      </div>
    );
  }

  //댓글 렌더
  return (
    <div className={borderBottom ? styles.comment_border : styles.comment}>
      <div className={styles.comment_header}>
        <ProfileBlock profile={comment.profile} />
      </div>
      <div className={styles.comment_text}>{comment.text}</div>
      <div className={styles.comment_date}>{`${
        comment.game
      } - ${comment.date.slice(0, comment.date.length - 4)}`}</div>
      {parentShowComment ? (
        <div className={styles.comment_btns}>
          <button className={styles.comment_btn} onClick={addSubcommentHandler}>
            {addSubcomment ? (
              <FaComment className={styles.comment_btn_icon} />
            ) : (
              <FaRegComment />
            )}{" "}
            <span>댓글</span>
          </button>
          {checkUser ? (
            <>
              <button className={styles.comment_btn} onClick={setModeModify}>
                <BsPencilSquare /> <span>수정</span>
              </button>
              <button
                className={styles.comment_btn}
                onClick={handleRemoveModalOpen}
              >
                <BsTrash /> <span>삭제</span>
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      {comment.subcomments && parentShowComment ? (
        <SubcommentList
          subcommentsData={{
            data: comment.subcomments,
            lastEvaluatedKey: comment.subcommentsLastEvaluatedKey,
          }}
          commentId={`${comment.postId}/${comment.date}`}
          addSubcomment={addSubcomment}
          setAddSubcomment={setAddSubcomment}
        />
      ) : null}
      <RemoveConfirmModal
        show={showRemoveModal}
        close={handleRemoveModalClose}
        loading={loading}
        remove={removeComment}
      />
    </div>
  );
}
