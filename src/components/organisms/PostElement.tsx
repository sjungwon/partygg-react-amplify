import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, Dropdown } from "react-bootstrap";
import styles from "./scss/PostElement.module.scss";
import {
  BsHandThumbsUp,
  BsHandThumbsUpFill,
  BsHandThumbsDown,
  BsHandThumbsDownFill,
} from "react-icons/bs";
import ImageSlide from "../molecules/ImageSlide";
import { Post } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import RemoveConfirmModal from "../molecules/RemoveConfirmModal";
import LikeServices from "../../services/LikeServices";
import FileServices from "../../services/FileServices";
import { ImageKeys } from "../../types/file.type";
import PostServices from "../../services/PostServices";
import AddPostElement from "../molecules/AddPostElement";
import CommentList, { CommentsData } from "./CommentList";
import { NavLink } from "react-router-dom";
import DefaultButton from "../atoms/DefaultButton";
import CheckUserBlock from "../atoms/CheckUserBlock";
import CommentsButton from "../atoms/CommentsButton";
import ProfileBlock from "../molecules/ProfileBlock";

interface PropsType {
  post: Post;
  removePost: (value: string) => void;
}

export default function PostElement({ post, removePost }: PropsType) {
  const { username, filteredProfileArr } = useContext(UserDataContext);
  const [images, setImages] = useState<string[]>([]);
  const [postData, setPostData] = useState<Post>(post);
  const postId = useMemo<string>(() => `${post.username}/${post.date}`, [post]);
  const commentsData = useMemo<CommentsData>(
    () => ({
      data: post.comments,
      lastEvaluatedKey: post.commentsLastEvaluatedKey,
    }),
    [post.comments, post.commentsLastEvaluatedKey]
  );
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
    if (postData && postData.images.length) {
      getImageAsync(postData.images);
    }
  }, [getImageAsync, postData]);

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

  const likeClick = useCallback(async () => {
    if (!postData.date) {
      return;
    }

    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }

    //서버에서 알아서 좋아요 있으면 제거하고 싫어요 추가함
    const currentLike = postData.likes.includes(username);
    const currentDislike = postData.dislikes.includes(username);
    setPostData((prevData: Post) => {
      return {
        ...prevData,
        likes: currentLike
          ? prevData.likes.filter((user) => user !== username)
          : [...prevData.likes, username],
        dislikes: currentDislike
          ? prevData.dislikes.filter((user) => user !== username)
          : prevData.dislikes,
      };
    });
    if (currentLike) {
      LikeServices.postLikeRemove(postId).then((success) => {
        if (!success) {
          setPostData((prevData: Post) => {
            return {
              ...prevData,
              likes: [...prevData.likes, username],
            };
          });
          window.alert(
            "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      });
    } else {
      LikeServices.postLike(postId).then((success) => {
        if (!success) {
          setPostData((prevData: Post) => {
            return {
              ...prevData,
              likes: prevData.likes.filter((user) => user !== username),
              dislikes: currentDislike
                ? [...prevData.dislikes, username]
                : prevData.dislikes,
            };
          });

          window.alert(
            "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      });
    }
  }, [postData, postId, username]);

  //싫어요 클릭 함수
  const dislikeClick = useCallback(async () => {
    if (!postData.date) {
      return;
    }

    if (!username) {
      window.alert("로그인이 필요합니다.");
      return;
    }
    //서버에서 알아서 좋아요 있으면 제거하고 싫어요 추가함
    const currentLike = postData.likes.includes(username);
    const currentDislike = postData.dislikes.includes(username);
    setPostData((prevData: Post) => {
      return {
        ...prevData,
        likes: currentLike
          ? prevData.likes.filter((user) => user !== username)
          : prevData.likes,
        dislikes: currentDislike
          ? prevData.dislikes.filter((user) => user !== username)
          : [...prevData.dislikes, username],
      };
    });

    if (currentDislike) {
      LikeServices.postDislikeRemove(postId).then((success) => {
        if (!success) {
          setPostData((prevData: Post) => {
            return {
              ...prevData,
              dislikes: [...prevData.dislikes, username],
            };
          });
          window.alert(
            "싫어요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      });
    } else {
      LikeServices.postDislike(postId).then((success) => {
        if (!success) {
          setPostData((prevData: Post) => {
            return {
              ...prevData,
              likes: currentLike
                ? [...prevData.likes, username]
                : prevData.likes,
              dislikes: prevData.dislikes.filter((user) => user !== username),
            };
          });
          window.alert(
            "좋아요를 수정 중에 오류가 발생했습니다. 다시 시도해주세요."
          );
        }
      });
    }
  }, [postData, postId, username]);

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
    const success = await PostServices.removePost(postData);
    if (!success) {
      window.alert("포스트 제거에 실패했습니다. 다시 시도해주세요.");
      setRemoveLoading(false);
      handleRemoveModalClose();
    }
    if (postData.images.length) {
      await Promise.all(
        postData.images.map(async (image) => {
          return FileServices.removeImage(image);
        })
      );
    }
    removePost(postId);
    setRemoveLoading(false);
    handleRemoveModalClose();
  }, [handleRemoveModalClose, postData, postId, removePost]);

  const [mode, setMode] = useState<"" | "modify">("");
  //포스트 관리 함수 -> 수정, 제거 선택
  const select = useCallback(
    (eventKey: any) => {
      if (eventKey === "1") {
        const profile = filteredProfileArr.find(
          (profile) => profile.nickname === postData.profile.nickname
        );
        if (profile) {
          setMode("modify");
          return;
        } else {
          if (filteredProfileArr.length) {
            setMode("modify");
            return;
          }
          window.alert(
            "현재 카테고리에 포함되는 프로필이 없어 수정할 수 없습니다."
          );
          return;
        }
      }
      if (eventKey === "2") {
        handleRemoveModalOpen();
        return;
      }
    },
    [filteredProfileArr, handleRemoveModalOpen, postData.profile.nickname]
  );

  //텍스트 제한 관련 데이터
  //텍스트 이미지있으면 100자 제한, 없으면 200자 제한
  const [textMore, setTextMore] = useState<boolean>(false);
  const [showTextLength, setShowTextLength] = useState<number>(0);

  useEffect(() => {
    if (textMore) {
      setShowTextLength(postData.text.length);
    }

    if (postData.images.length) {
      const length = postData.text.length < 100 ? postData.text.length : 100;
      setShowTextLength(length);
      return;
    }

    if (postData.text.length < 200) {
      setShowTextLength(postData.text.length);
      return;
    }

    setShowTextLength(200);
  }, [postData, textMore]);

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
        prevData={{ setMode, postData, setPostData, imageURLs: images }}
      />
    );
  }

  return (
    <Card className={styles.card}>
      <Card.Header className={styles.card_header}>
        <Card.Title className={styles.card_header_game}>
          <NavLink to={`/games/${postData.game}`} className={styles.nav_link}>
            {postData.game}
          </NavLink>
        </Card.Title>
        <div className={styles.card_header_profile}>
          <ProfileBlock profile={postData.profile} size="lg">
            <Card.Subtitle className={styles.card_header_subtitle}>
              {postData.date.substring(0, postData.date.length - 4)}
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
        {images.length > 0 ? <ImageSlide images={images} /> : null}
        <Card.Text className={styles.card_body_text}>
          {postData.text.slice(0, showTextLength)}
          {(postData.images.length && postData.text.length > 100) ||
          (!postData.images.length && postData.text.length > 200) ? (
            <span className={styles.card_body_text_more} onClick={showMore}>
              {textMore ? " 접기" : " 더보기"}
              더보기...
            </span>
          ) : null}
        </Card.Text>
        <div className={styles.card_body_buttons}>
          <DefaultButton onClick={likeClick} size="lg">
            {postData.likes.includes(username) ? (
              <BsHandThumbsUpFill className={styles.btn_icon} />
            ) : (
              <BsHandThumbsUp />
            )}
            <p className={styles.btn_text}>좋아요</p>
            <p className={styles.btn_badge}>{postData.likes.length}</p>
          </DefaultButton>
          <CommentsButton
            onClick={commentHandler}
            size="lg"
            active={showComment}
          ></CommentsButton>
          <DefaultButton onClick={dislikeClick} size="lg">
            {postData.dislikes.includes(username) ? (
              <BsHandThumbsDownFill className={styles.btn_icon} />
            ) : (
              <BsHandThumbsDown />
            )}
            <p className={styles.btn_text}>싫어요</p>
            <p className={styles.btn_badge}>{postData.dislikes.length}</p>
          </DefaultButton>
        </div>
      </Card.Body>
      <Card.Footer
        className={`${styles.card_footer} ${
          post.comments.length ? "" : styles.card_footer_no_border
        }`}
      >
        <CommentList
          postId={`${post.username}/${post.date}`}
          commentsData={commentsData}
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
