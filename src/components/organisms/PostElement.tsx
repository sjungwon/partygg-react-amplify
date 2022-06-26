import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Card, Dropdown } from "react-bootstrap";
import styles from "./scss/PostElement.module.scss";
import {
  BsHandThumbsUp,
  BsHandThumbsUpFill,
  BsHandThumbsDown,
  BsHandThumbsDownFill,
} from "react-icons/bs";
import ImageSlide from "../molecules/ImageSlide";
import { UserDataContext } from "../../context/UserDataContextProvider";
import RemoveConfirmModal from "../molecules/RemoveConfirmModal";
import FileServices from "../../services/FileServices";
import { ImageKeys } from "../../types/file.type";
import PostServices from "../../services/PostServices";
import AddPostElement from "../molecules/AddPostElement";
import CommentList from "./CommentList";
import { NavLink } from "react-router-dom";
import DefaultButton from "../atoms/DefaultButton";
import CheckUserBlock from "../atoms/CheckUserBlock";
import CommentsButton from "../atoms/CommentsButton";
import ProfileBlock from "../molecules/ProfileBlock";
import { PostDataContext } from "./PostList";

interface PropsType {
  removePost: (value: string) => void;
}

export default function PostElement({ removePost }: PropsType) {
  const { username, profileArr } = useContext(UserDataContext);
  const { post, postLike, postDislike, modifyPost, comments } =
    useContext(PostDataContext);
  const [images, setImages] = useState<string[]>([]);

  const getImageAsync = useCallback(async (imageKeys: ImageKeys[]) => {
    const imageURLArr = await Promise.all(
      imageKeys.map(async (imageKey) => {
        const resize = await FileServices.getImage(imageKey, "resized");
        if (resize) {
          return resize;
        }

        return await FileServices.getImage(imageKey, "fullsize");
      })
    );

    const filteredURL = imageURLArr.map((imageURL) =>
      imageURL ? imageURL : ""
    );

    setImages(filteredURL);
  }, []);

  //이미지 가져옴 + 수정 시 새로 가져옴
  useEffect(() => {
    if (post && post.images.length) {
      getImageAsync(post.images);
    }
  }, [getImageAsync, post]);

  //댓글 보기 관련 함수
  const [showComment, setShowComment] = useState<boolean>(false);
  const [scrollHeight, setScrollHeight] = useState<number>(0);

  const commentHandler = useCallback(() => {
    setShowComment((prev) => {
      if (!prev) {
        setScrollHeight(window.scrollY);
      } else {
        setTimeout(() => {
          window.scrollTo({ top: scrollHeight, behavior: "auto" });
        });
      }
      return !prev;
    });
  }, [scrollHeight]);

  const childShowCommentHandler = useCallback(
    (show: boolean) => {
      if (show) {
        setScrollHeight(window.scrollY);
      } else {
        setTimeout(() => {
          window.scrollTo({ top: scrollHeight, behavior: "auto" });
        });
      }
      setShowComment(show);
    },
    [scrollHeight]
  );

  //싫어요 클릭 함수

  //포스트 제거, 제거 확인 모달 관련 데이터

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const handleRemoveModalClose = useCallback(() => {
    setShowRemoveModal(false);
  }, []);
  const handleRemoveModalOpen = useCallback(() => {
    setShowRemoveModal(true);
  }, []);

  const [removeLoading, setRemoveLoading] = useState<boolean>(false);
  const sendRemovePost = useCallback(async () => {
    setRemoveLoading(true);
    const success = await PostServices.removePost(post);
    if (!success) {
      window.alert("포스트 제거에 실패했습니다. 다시 시도해주세요.");
      setRemoveLoading(false);
      handleRemoveModalClose();
    }
    if (post.images.length) {
      await Promise.all(
        post.images.map(async (image) => {
          return FileServices.removeImage(image);
        })
      );
    }
    removePost(`${post.username}/${post.date}`);
    setRemoveLoading(false);
    handleRemoveModalClose();
  }, [handleRemoveModalClose, post, removePost]);

  const [mode, setMode] = useState<"" | "modify">("");
  //포스트 관리 함수 -> 수정, 제거 선택
  const select = useCallback(
    (eventKey: any) => {
      if (eventKey === "1") {
        const filteredProfileArr = profileArr.filter(
          (profile) => profile.game === post.game
        );
        if (!filteredProfileArr.length) {
          window.alert(
            "해당 포스트 카테고리에 포함되는 프로필이 없어 수정할 수 없습니다. 프로필을 추가해주세요."
          );
          return;
        }
        setMode("modify");
      }
      if (eventKey === "2") {
        handleRemoveModalOpen();
        return;
      }
    },
    [handleRemoveModalOpen, post.game, profileArr]
  );

  //텍스트 제한 관련 데이터
  //텍스트 이미지있으면 100자 제한, 없으면 200자 제한
  const [textMore, setTextMore] = useState<boolean>(false);
  const [showTextLength, setShowTextLength] = useState<number>(0);

  useEffect(() => {
    if (textMore) {
      setShowTextLength(post.text.length);
    }

    if (post.images.length) {
      const length = post.text.length < 100 ? post.text.length : 100;
      setShowTextLength(length);
      return;
    }

    if (post.text.length < 200) {
      setShowTextLength(post.text.length);
      return;
    }

    setShowTextLength(200);
  }, [post, textMore]);

  const showMore = useCallback(() => {
    setTextMore((prev) => !prev);
  }, []);

  const menuRef = useRef<HTMLButtonElement>(null);

  const menuClick = useCallback(() => {
    if (menuRef.current) {
      menuRef.current.click();
    }
  }, []);

  //렌더
  if (mode === "modify") {
    return (
      <AddPostElement
        prevData={{
          setMode,
          postData: post,
          setPostData: modifyPost,
          imageURLs: images,
        }}
      />
    );
  }

  return (
    <Card className={styles.card}>
      <Card.Header className={styles.card_header}>
        <Card.Title className={styles.card_header_game}>
          <NavLink to={`/games/${post.game}`} className={styles.nav_link}>
            {post.game}
          </NavLink>
        </Card.Title>
        <div className={styles.card_header_profile}>
          <ProfileBlock profile={post.profile} size="lg">
            <Card.Subtitle className={styles.card_header_subtitle}>
              {post.date.substring(0, post.date.length - 4)}
            </Card.Subtitle>
          </ProfileBlock>
        </div>
        <CheckUserBlock resourceUsername={post.username}>
          <div className={styles.card_header_menu}>
            <DefaultButton onClick={menuClick} size="xs">
              ...
            </DefaultButton>
            <Dropdown onSelect={select} bsPrefix={styles.header_menu_container}>
              <Dropdown.Toggle
                id="dropdown-basic"
                className={styles.header_menu_container}
                ref={menuRef}
              ></Dropdown.Toggle>
              <Dropdown.Menu className={styles.header_menu_items}>
                <Dropdown.Item eventKey="1">수정</Dropdown.Item>
                <Dropdown.Item eventKey="2">삭제</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </CheckUserBlock>
      </Card.Header>
      <Card.Body className={`${styles.card_body}`}>
        {images.length > 0 ? <ImageSlide images={images} expandable /> : null}
        <Card.Text className={styles.card_body_text}>
          {post.text.slice(0, showTextLength)}
          {(post.images.length && post.text.length > 100) ||
          (!post.images.length && post.text.length > 200) ? (
            <span className={styles.card_body_text_more} onClick={showMore}>
              {textMore ? " 접기" : " 더보기"}
              더보기...
            </span>
          ) : null}
        </Card.Text>
        <div className={styles.card_body_buttons}>
          <DefaultButton onClick={postLike} size="lg">
            {post.likes.includes(username) ? (
              <BsHandThumbsUpFill className={styles.btn_icon} />
            ) : (
              <BsHandThumbsUp />
            )}
            <p className={styles.btn_text}>좋아요</p>
            <p className={styles.btn_badge}>{post.likes.length}</p>
          </DefaultButton>
          <CommentsButton
            onClick={commentHandler}
            size="lg"
            active={showComment}
          ></CommentsButton>
          <DefaultButton onClick={postDislike} size="lg">
            {post.dislikes.includes(username) ? (
              <BsHandThumbsDownFill className={styles.btn_icon} />
            ) : (
              <BsHandThumbsDown />
            )}
            <p className={styles.btn_text}>싫어요</p>
            <p className={styles.btn_badge}>{post.dislikes.length}</p>
          </DefaultButton>
        </div>
      </Card.Body>
      <Card.Footer
        className={`${styles.card_footer} ${
          comments.length ? "" : styles.card_footer_no_border
        }`}
      >
        <CommentList
          postId={`${post.username}/${post.date}`}
          showComment={showComment}
          setShowComment={childShowCommentHandler}
        />
      </Card.Footer>
      <RemoveConfirmModal
        close={handleRemoveModalClose}
        show={showRemoveModal}
        loading={removeLoading}
        remove={sendRemovePost}
      />
    </Card>
  );
}
