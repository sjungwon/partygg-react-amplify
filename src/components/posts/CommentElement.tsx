import styles from "./CommentElement.module.scss";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FaRegComment, FaComment } from "react-icons/fa";
import { BsTrash, BsPencilSquare } from "react-icons/bs";
import { Comment } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import RemoveConfirmModal from "./RemoveConfirmModal";

interface CommentElementProps {
  comment: Comment;
  commentsListHandler: (comment: Comment, type: "add" | "modify") => void;
  borderBottom: boolean;
}

export default function CommentElement({
  comment,
  commentsListHandler,
  borderBottom,
}: CommentElementProps) {
  //사용자 댓글인지 소유 확인
  const { username } = useContext(UserDataContext);
  const checkUser = useMemo(
    () => comment.username === username,
    [comment, username]
  );

  // //대댓글 추가하려는지 확인
  // const addSubCommentMode = useMemo(
  //   () =>
  //     formControl.mode === "add" &&
  //     formControl.type === "subComment" &&
  //     formControl.postId === postId &&
  //     formControl.commentId === comment.id,
  //   [
  //     comment.id,
  //     formControl.commentId,
  //     formControl.mode,
  //     formControl.postId,
  //     formControl.type,
  //     postId,
  //   ]
  // );

  // //댓글 수정하려는 상태인지 확인
  // const modifyMode = useMemo(
  //   () =>
  //     formControl.mode === "modify" &&
  //     formControl.type === "comment" &&
  //     formControl.postId === postId &&
  //     formControl.commentId === comment.id,
  //   [
  //     comment.id,
  //     formControl.commentId,
  //     formControl.mode,
  //     formControl.postId,
  //     formControl.type,
  //     postId,
  //   ]
  // );

  // const addSubComment = useCallback(() => {
  //   console.log("hi");
  //   if (addSubCommentMode) {
  //     setFormControl({
  //       type: "",
  //       mode: "",
  //       postId: -1,
  //     });
  //   } else {
  //     setFormControl({
  //       type: "subComment",
  //       mode: "add",
  //       postId: postId,
  //       commentId: comment.id,
  //     });
  //   }
  // }, [addSubCommentMode, setFormControl, postId, comment.id]);

  // const modify = useCallback(() => {
  //   setFormControl({
  //     type: "comment",
  //     mode: "modify",
  //     postId: postId,
  //     commentId: comment.id,
  //   });
  // }, [comment.id, postId, setFormControl]);

  //삭제 확인 모달
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
  }, []);
  const handleRemoveModalOpen = useCallback(() => {
    setShowRemoveModal(true);
  }, []);

  // //모달에 전달 -> 모달에서 제거 누르면 실행
  // const removeComment = useCallback(() => {
  //   dispatch(removeCommentThunk({ postId, commentId: comment.id }));
  // }, [dispatch, comment, postId]);

  // //댓글 렌더 갯수 설정
  // const { renderLength, renderMore, renderBase, renderAll, renderAfterAdd } =
  //   useRenderLength({
  //     baseLength: 1,
  //     maxLength: comment.subComments.length,
  //   });

  // //대댓글 추가 상태이면 대댓글 모두 보여줌
  // useEffect(() => {
  //   if (addSubCommentMode) {
  //     renderAll();
  //   }
  // }, [addSubCommentMode, renderAll]);

  // //렌더 설정 -> 아직 보여줄 댓글이 남아있으면 렌더 더함 -> 없으면 기본으로 돌아감
  // const renderControl = useCallback(() => {
  //   if (comment.subComments.length > renderLength) {
  //     renderMore();
  //   } else {
  //     renderBase();
  //   }
  // }, [comment.subComments.length, renderLength, renderMore, renderBase]);

  // //댓글 수정 상태이면 하단 렌더
  // if (modifyMode) {
  //   return (
  //     <div className={styles.comment}>
  //       <AddComment
  //         renderAfterAdd={renderAfterAdd}
  //         formControl={formControl}
  //         setFormControl={setFormControl}
  //         prevData={comment}
  //       />
  //       {showComment && comment.subComments ? (
  //         <SubCommentList
  //           subComments={comment.subComments}
  //           renderLength={renderLength}
  //           renderControl={renderControl}
  //           postId={postId}
  //           commentId={comment.id}
  //           formControl={formControl}
  //           setFormControl={setFormControl}
  //         />
  //       ) : null}
  //     </div>
  //   );
  // }

  //댓글 렌더
  return (
    <div className={borderBottom ? styles.comment_border : styles.comment}>
      <div className={styles.comment_nickname}>
        {comment.profile.nickname}
        <span
          className={styles.comment_username}
        >{` (${comment.username})`}</span>
      </div>
      <div className={styles.comment_text}>{comment.text}</div>
      <div className={styles.comment_date}>{`${
        comment.game
      } - ${comment.date.slice(0, comment.date.length - 4)}`}</div>
      <div className={styles.comment_btns}>
        {/* <button className={styles.comment_btn} onClick={addSubComment}>
            {addSubCommentMode ? (
              <FaComment className={styles.comment_btn_icon} />
            ) : (
              <FaRegComment />
            )}{" "}
            <span>댓글</span>
          </button> */}
        {/* {checkUser ? (
          <>
            <button className={styles.comment_btn} onClick={modify}>
              <BsPencilSquare /> <span>수정</span>
            </button>
            <button
              className={styles.comment_btn}
              onClick={handleRemoveModalOpen}
            >
              <BsTrash /> <span>제거</span>
            </button>
          </>
        ) : null} */}
      </div>
      {/* {comment.subcomments ? (
        <SubCommentList
          subComments={comment.subcomments}
          renderLength={renderLength}
          renderControl={renderControl}
          postId={postId}
          commentId={comment.id}
          formControl={formControl}
          setFormControl={setFormControl}
        />
      ) : null} */}
      {/* {addSubCommentMode ? (
        <AddComment
          renderAfterAdd={renderAfterAdd}
          formControl={formControl}
          setFormControl={setFormControl}
        />
      ) : null} */}
      {/* <RemoveConfirmModal
        show={showRemoveModal}
        close={handleRemoveModalClose}
        remove={removeComment}
        className={styles.comment_remove_modal}
      /> */}
    </div>
  );
}
