import { Button, Modal } from "react-bootstrap";

//모달 show state
//모달 닫는 close 함수 -> show를 false로 변경하는 함수
//remove -> comment, subcomment 제거하는 dispatch Thunk 함수
//className -> width 조절용 className
interface PropsType {
  show: boolean;
  close: () => void;
  remove: () => void;
  className?: string;
}

export default function RemoveConfirmModal({
  show,
  close,
  remove,
  className,
}: PropsType) {
  return (
    <Modal
      show={show}
      onHide={close}
      size="sm"
      centered
      dialogClassName={className}
    >
      <Modal.Header closeButton>
        <Modal.Title>삭제</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>정말 삭제하시겠습니까 ?</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="primary" size={"sm"} onClick={remove}>
          삭제
        </Button>
        <Button variant="secondary" size={"sm"} onClick={close}>
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
