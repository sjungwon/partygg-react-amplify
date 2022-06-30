import { ReactNode } from "react";
import { Modal } from "react-bootstrap";
import DefaultButton from "../atoms/DefaultButton";
import LoadingBlock from "../atoms/LoadingBlock";
import styles from "./scss/RemoveConfirmModal.module.scss";

//모달 show state
//모달 닫는 close 함수 -> show를 false로 변경하는 함수
//remove -> comment, subcomment 제거하는 dispatch Thunk 함수
//className -> width 조절용 className
interface PropsType {
  show: boolean;
  close: () => void;
  loading: boolean;
  remove: () => void;
  customMessage?: ReactNode;
}

export default function RemoveConfirmModal({
  show,
  close,
  loading,
  remove,
  customMessage,
}: PropsType) {
  return (
    <Modal show={show} onHide={close} size="sm" centered>
      <Modal.Header closeButton>
        <Modal.Title className={styles.title}>삭제</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>정말 삭제하시겠습니까 ?</p>
        {customMessage ? customMessage : null}
      </Modal.Body>

      <Modal.Footer className={styles.footer}>
        <DefaultButton size="md" onClick={remove} disabled={loading}>
          <LoadingBlock loading={loading}>삭제</LoadingBlock>
        </DefaultButton>
        <DefaultButton size="md" onClick={close} disabled={loading}>
          취소
        </DefaultButton>
      </Modal.Footer>
    </Modal>
  );
}
