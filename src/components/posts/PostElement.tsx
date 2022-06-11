import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, Dropdown } from "react-bootstrap";
import styles from "./PostElement.module.scss";
import {
  BsHandThumbsUp,
  BsHandThumbsUpFill,
  BsHandThumbsDown,
  BsHandThumbsDownFill,
} from "react-icons/bs";
import { FaRegComment, FaComment } from "react-icons/fa";
import ImageSlide from "../ImageSlide";
import { Post } from "../../types/post.type";
import { UserDataContext } from "../../context/UserDataContextProvider";
import RemoveConfirmModal from "./RemoveConfirmModal";
import LikeServices from "../../services/LikeServices";
import FileServices from "../../services/FileServices";
import { ImageKeys } from "../../types/file.type";
import PostServices from "../../services/PostServices";
import AddPostElement from "./AddPostElement";
import CommentList, { CommentsData } from "./CommentList";

interface PropsType {
  post: Post;
  removePost: (value: string) => void;
}

export default function PostElement({ post, removePost }: PropsType) {
  const { username, profileArr } = useContext(UserDataContext);
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
  const commentHandler = useCallback(() => {
    setShowComment((prev) => !prev);
  }, []);

  //댓글 쪽에서 열고 닫을 때 스크롤 조절하기 위해
  //하위 컴포넌트인 댓글 컴포넌트로 전달할 Ref 생성
  const headerRef = useRef<HTMLDivElement>(null);

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
        if (
          profileArr.find(
            (profile) => profile.nickname === postData.profile.nickname
          )
        ) {
          setMode("modify");
        } else {
          window.alert(
            "해당 포스트의 프로필이 현재 존재하지 않아 수정할 수 없습니다."
          );
        }
      }
      if (eventKey === "2") {
        handleRemoveModalOpen();
      }
    },
    [handleRemoveModalOpen, postData.profile.nickname, profileArr]
  );

  console.log(showComment);

  //텍스트 제한 관련 데이터
  //텍스트 이미지있으면 100자 제한, 없으면 200자 제한
  const [textMore, setTextMore] = useState<boolean>(false);
  const showTextLength = useMemo(() => {
    if (postData && postData.images) {
      return 100;
    }
    return 200;
  }, [postData]);
  const showMore = useCallback(() => {
    setTextMore((prev) => !prev);
  }, []);

  //텍스트 글자 제한에 따라 텍스트 관련 뷰 데이터 메모이제이션
  const textData = useMemo(() => {
    if (!postData.text) {
      return null;
    }
    if (textMore) {
      return (
        <>
          {postData.text}
          <span className={styles.card_body_text_more} onClick={showMore}>
            {" "}
            접기
          </span>
        </>
      );
    }

    if ((postData.text.match(/[^\n]*\n[^\n]*/gi) || []).length > 10) {
      return (
        <>
          {postData.text.split("\n").slice(0, 5).join("\n")}
          <span className={styles.card_body_text_more} onClick={showMore}>
            {" "}
            더보기...
          </span>
        </>
      );
    }

    if (postData.text.length > showTextLength) {
      return (
        <>
          {postData.text.slice(0, showTextLength)}
          <span className={styles.card_body_text_more} onClick={showMore}>
            {" "}
            더보기...
          </span>
        </>
      );
    }

    return postData.text;
  }, [postData, showMore, showTextLength, textMore]);

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
      <Card.Header className={styles.card_header} ref={headerRef}>
        <Card.Title className={styles.card_header_game}>
          {postData.game}
        </Card.Title>
        <div className={styles.card_header_profile}>
          <img
            src={
              postData.profile.profileImage
                ? postData.profile.profileImage
                : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPwAAADICAMAAAD7nnzuAAAAflBMVEX39/coYJD//////vwAUoj8+/okXo8hXY79/PsaWYweW40AU4gTV4sAUIcNVYr29vZLdp5EcZvh5uutvtDr7vHI091Fc5xoiKnS2+UuZZNghah+mbW7ydg6a5dZf6ScsMWPp7+nuczc4+iTqcBykbCrvc+3xNN6lrPBzdqHoLtjb9pzAAAKXUlEQVR4nO2d2ZajIBCGjQoKIiZmtbMvk07e/wVHk16ymMQqQMyM39X0nNMtv0BRFEXpOC0tLS0tLS0tLS26ICdst6JOCAm9HGeQbjaTnM0mHTjF/4T/9nvIZZNkMlseP3qBEEJGJ2T+z6D3cVzOJgnJX4HtVhqAeN5guNzNI18IxmmHdi7If+RMCD+a75bDgef9Uy8g9JLDscdkofop+TuQrHc8JF5ou816CMPNehFLTl8I/3kBlMt4sd6Eb6+feOly5LOgmu5fAuaPluk7j38SJv1uJCr2+N0IEFG3n7ypASTeZsoEuM+v+l+w6eYNu594w0XEVJSf4dFi+GbyCZn1Iq4u/Sy/N3sj/4d4s55EzvQyqOzN3qX3vWEv0ij9JD/qDT3buirgpWNfycqVE/jjtOnyCdkKTXP9Fi62zZ763jDDLuuvoSJr8NgnztQ3Jv0k3586De38vNs1LOzPYQ3t/HBrttvPUH/bvA0PGXSFeekFojto2ND3htzA+lZOwJs19N11HUP+G+qvXduKfyFTvz7pBf60KSOfOIuapvsvYtGMNY8MesZXuHtYrwlmjwwyQ/7sc3hmXz1JO7WZ+WuCTmpZPUkDS9pz9YFd9Ta121afz3eL2nP1Nud9Mrdi637h88SWdtK1rD1X37XU9d5YcX2nPEfRLWZjK36+t5L4NnMRxZ3Rx3j8MerEkUrkS64sqPf2aH+eR3TXnzjuF86kv6P4KL+/r1092SAj81Tw48S9Y3LkyOgflZva5z1ykZNZP7yXXhD2M9w8CrKapSONHevsy5Wf2Xdwf7Veo+f1I0QjaXwkz7S7LjnGmLEf9WtUT1LM/GRZyVy/m/uYCDAVNfq5Ica7keMHk/1m6o8RM593awvphktE+/xVFekFK8QaKpd1qU8Rq1z8p6p21/0Tg/88lWk92r0FfJXz+9W1u24f3vfBohabR2bwpvlriHbXXSMeMavD5iUZeNDLI0y76x7BVoVmNexuwy04Ts0/oNpd9wO8nogaDvEGYGtHsxeuTRkEPL6oHJjW7k3BXRJX8G3umYBNPp+atnkp2BQx8IQ/cwS7er7h5c77hDaJZjjtrgse+OzTbNen4A1NNMOKn8GfZbTr4TM+GGG1u+4I6kyZnfUD8Iz3h3jxQ/jTDBp8D7zGB128dtftQrtebA12PbAtuW+HnvEFM/ju0Zh0sgc3JlDR7rrgHZTcm/Lw4ds5VnkTX84KurCa29zBHRx/oyZ+A3+iodUu3IIdnLmadtedgx0dQ9ubEN4SxVGPGPd0bkQ8mYA9LqmwyJ8Zgk1sNDFh8jx4L7BEVXzC4KPNhMkj4FFPe6raXbcHfujcQM+TDXiDzabq4qfgjW1s4NwyXIKbIQDh6kf8AQfNmIEQPiJgLVEhnGsmcKfSgJ+TwI8m/VRdPNyx6kTaw7gEvuh0Yue1uFc48NMbOdQ96eHuXS5eXbvrwsXrd/IwZ1SKW7oziMdqn/QJuA2dDjp0eUmGeLDuSQ/fX2nY1hSAXatiL6lXO9nDL1Pgg9aXwE8GO0JzRCMEO/YFOsQjHstWei1eOIYnolCpQzwiEYKP9Yr3MHbH0lKXW1rN5h7TBn+grh1+UtApvCutbDB5d9FGXTzywTq1Y5zb3OoqBe3PzDBX9vQ6uKSPaQNbqouHb6RzRF+n+HCJER+M1cWPMfnNQuuWPlxh0uF1eDkIHydf67Qu9OEOdRdA3dyjjH2H73SK9+DJUQUClHpYBsrWdPiHzoXeAx8WnxuhPOkRjmWnOBjXKh4cQT5BZaVE68eEuLsstKdVPGJjWSAPauIPuIsndN4E8Zjcy0twpka3eMy+pkDN3uNsfUfzzgYtXu2cFhVE0C8eOexz9QrhawervRlzvvA08eJRPrUB8SOseBqhu95BlxSkI63iEVH7L/BHtfAD2m/0Ru49nKd1AhvSQIUxznCtVyzDT7z4ABm+n+MrUvBPvVtahToBArXcrRSqLumNXSMyEy7AJB/Dk44vxWsNZmAObC4bA/bzBkoVKfQe2eACmD/Ap73ChO9oP6FHJEhcwoCZ5121UiSac1CJYsE7toBoXyiWYfH1HlTi/dtv9d3Knp6j2O+avVt0BPMCnlVMT0qVS8zpjV/iUnJuCKod4MzUvgdQoDsphyADSlf4u5dD39lpqKYpD5rTsRTN/RlOnxZLcd091VFtS/+FA2ws5/pzPbL3xNsb9uTDX4SgvW4Ocl/HhQiuRAT+vF86+J3+/LouPg0ErmaW3j1dAca7D0T8sU9uiyVSwXezm0T8ZLa7rQ4VBGmy/4gR5k9/5jEBZwCzaLE/9fFdeVTKRZx9Lg+TNGdyWH5msbgtDcez037A2cO/iSL137UgoDsPgQy2P+u6U1IDvPhKlfRzZOkXrcSvT5Ru8z8GeDRl+vPtPcBJOY9G12v6J3Ct8D+vfn02AlSMCwxUyqqenBH4i7tE+z7EdvH7093JovJXQvSmZXxRcaWnfrfsjsGgW9lmyG7Z9n/SrVhI3ci1wrDSMbWcP1rI+7yS5WL80aH+cF7l/QVGymRVWeyYeFINyDnGrz/WFx+fuMBrUaEJZqpkbV6+eH/8/CLd4Cif1ZKjQh6fB7yS8cu5JzWnXH/xKj2DB69P45313C9fMynz5+vXe/4Df2459SZl/ELWT+29XFQLV2xWmS/YpdNLAyb8bLWp9OvO4ukAFGtDF+ifHpfHgBPJwWy1yEScOzi5oxOLbLGaAeK7y2d5wMaqZniPwzkB/M5wkk6Gh8NwkoIv3A4fe3x8Z6p4AHl4khBUjVHp4fEHBXzt18p+1T9IymJz5evSMB6VV6c9c0XxSPnNVjbScHsQhtMrVS/+mKwIWOZkYI9h1Sg902EGpTteSRA3yGoe82eSknrTzGSNoHy1ux9t8FNIPQzupyA3Ww7wPn4fK9fFwDK8Xe9NVUr54fZ9i60t7ff5C8J0HUjvOj9MrfCXKtebDbE0X/r2etDX6tzckl4PfOPSnfCyOpjNQV9wmSok9zWUu76K6NjVfnnT1kwE5xbyW5T1WdymHn532bGRykh3eD+pkdy2dtf99juY8aK3XyRfZ4jM8owv+PI7qPZqCY8gh/PWVsdFYVW+Aiy+7iP5x3i74n0HoCQjU5xSopmxGEYJp4Fv39wVFCavvkFfcIrpRFYdnG+KGswG4zdleFtpf5E/k7s3ZneyJeoXohFTPp/0op7PWVwy4MjS7bo5Gt7Fl0EmGkoD6GBZj2t3o95K9OqexM6HGhVvCeuhtu823WJbeIEt7U1Qb0+7ffU2tdtWb1e7XfW2tdtUb1t5wf+s3ZZ626q/+Z+1W/D1rPl1JSSIj7KpQKx9dr6cOrXb1nrP/6y9tonfpOl+SR3abWt8zP+s3UkMy3caZuVvMTjzmzrbLzEk/x2kF5jQbltTdbQ7fHYitFi0yn8v6Sd0SbetA4kG0/cuZq4MxdH/huP9kgSvnzTdpakG5hPsttusFcD8f+d5/oB8DJOXbyAkzr8x2B9ASFjyDsKQ/Fsj/TFJ8vznlpaWlpaWlpaWlhYofwEbMOlmJ1OJfgAAAABJRU5ErkJggg=="
            }
            className={styles.card_header_img}
            alt="profile"
          />
          <div>
            <Card.Title className={styles.card_header_title}>
              {postData.profile.nickname}
              <span className={styles.card_header_username}>
                {postData.username ? ` (${postData.username})` : ""}
              </span>
            </Card.Title>
            <Card.Subtitle className={styles.card_header_subtitle}>
              {postData.date.substring(0, postData.date.length - 4)}
            </Card.Subtitle>
          </div>
        </div>
        {postData.username === username ? (
          <div className={styles.card_header_menu}>
            <Dropdown onSelect={select}>
              <Dropdown.Toggle
                variant="primary"
                id="dropdown-basic"
                className={styles.header_menu_container}
              ></Dropdown.Toggle>

              <Dropdown.Menu className={styles.header_menu_items}>
                <Dropdown.Item eventKey="1">수정</Dropdown.Item>
                <Dropdown.Item eventKey="2">삭제</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ) : null}
      </Card.Header>
      <Card.Body className={`${styles.card_body}`}>
        {images.length > 0 ? <ImageSlide images={images} /> : null}
        <Card.Text className={styles.card_body_text}>{textData}</Card.Text>
        <div className={styles.card_body_buttons}>
          <button className={styles.card_body_btn} onClick={likeClick}>
            {postData.likes.includes(username) ? (
              <BsHandThumbsUpFill className={styles.card_body_btn_icon} />
            ) : (
              <BsHandThumbsUp />
            )}
            <p>좋아요</p>
            <p className={styles.card_body_btn_badge}>
              {postData.likes.length}
            </p>
          </button>
          <button className={styles.card_body_btn} onClick={commentHandler}>
            {showComment ? (
              <FaComment className={styles.card_body_btn_icon} />
            ) : (
              <FaRegComment />
            )}{" "}
            <span>댓글</span>
          </button>
          <button className={styles.card_body_btn} onClick={dislikeClick}>
            {postData.dislikes.includes(username) ? (
              <BsHandThumbsDownFill className={styles.card_body_btn_icon} />
            ) : (
              <BsHandThumbsDown />
            )}
            <p>싫어요</p>
            <p className={styles.card_body_btn_badge}>
              {postData.dislikes.length}
            </p>
          </button>
        </div>
      </Card.Body>
      <CommentList
        postId={`${post.username}/${post.date}`}
        commentsData={commentsData}
        showComment={showComment}
        setShowComment={setShowComment}
      />
      <RemoveConfirmModal
        close={handleRemoveModalClose}
        show={showRemoveModal}
        loading={removeLoading}
        remove={sendRemovePost}
        className={styles.card_remove_modal}
      />
    </Card>
  );
}
