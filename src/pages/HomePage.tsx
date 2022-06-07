import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostList from "../components/posts/PostList";
import { UserDataContext } from "../context/UserDataContextProvider";
import FileServices from "../services/FileServices";
import LikeServices from "../services/LikeServices";
import PostServices from "../services/PostServices";
import ProfileServices from "../services/ProfileServices";
import UserServices from "../services/UserServices";
import { AddPostReqData } from "../types/post.type";
import { Profile } from "../types/profile.type";

const initialProfile: Profile = {
  username: "호벗",
  nickname: "호벗",
  date: "2022-05-16 05:52:42 pm 982",
  game: "메이플",
  profileImage: "",
};

export default function HomePage() {
  const navigate = useNavigate();
  const { profileArr, username, logout } = useContext(UserDataContext);
  const [currentProfile, setCurrentProfile] = useState<Profile>(initialProfile);

  useEffect(() => {
    if (profileArr.length > 0) {
      setCurrentProfile(profileArr[0]);
    }
  }, [profileArr]);

  const click = () => {
    navigate("/login");
  };

  const getUser = useCallback(async () => {
    try {
      const user = await UserServices.getUsername();
      console.log(user);
      window.alert(user);
    } catch {
      console.log("");
    }
  }, []);

  const refresh = useCallback(async () => {
    const response = await UserServices.getUsernameWithRefresh();
    console.log(response);
  }, []);

  const getProfile = useCallback(async () => {
    await ProfileServices.getProfiles();
  }, []);

  const postProfile = useCallback(async () => {
    await ProfileServices.postProfiles({
      nickname: "호벗1",
      game: "리그오브레전드",
      profileImage: "",
    });
  }, []);

  const updateProfile = useCallback(async () => {
    await ProfileServices.updateProfiles({
      nickname: "호벗123",
      game: "메이플스토리",
      profileImage: "",
      username,
      date: "2022-05-14 03:30:50am 395",
    });
  }, [username]);

  const deleteProfile = useCallback(async () => {
    await ProfileServices.deleteProfiles("2022-05-16 10:14:04pm 881");
  }, []);

  const addPost = useCallback(async () => {
    const newPost: AddPostReqData = {
      game: "리그 오브 레전드",
      profile: currentProfile,
      text: "hi123",
      images: [],
    };
    PostServices.addPost(newPost);
  }, [currentProfile]);

  const getPost = useCallback(async () => {
    PostServices.getPostIdList();
  }, []);

  const getPostByGame = useCallback(async () => {
    const game = "메이플";
    PostServices.getPostIdListByGame(game);
  }, []);

  const getNextPostByGame = useCallback(async () => {
    PostServices.getNextPostIdListByGame({
      username,
      date: "2022-05-23 03:54:14 am 802",
      game: "메이플",
    });
  }, [username]);

  const removePost = useCallback(async () => {
    const removeData = {
      username,
      date: "2022-05-17 01:29:10am 940",
    };
    PostServices.removePost(removeData);
  }, [username]);

  const updatePost = useCallback(async () => {
    const updateData = {
      id: "id",
      game: "리그 오브 레전드",
      profile: currentProfile,
      text: "hi 123",
      images: [],
      likes: [],
      dislikes: [],
      comments: [],
      date: "2022-05-17 04:56:49pm 308",
      username: "호벗",
    };
    PostServices.updatePost(updateData);
  }, [currentProfile]);

  const likePost = useCallback(async () => {
    const postId = "리그 오브 레전드-2022-05-20 01:25:16am 440";
    LikeServices.postLike(postId);
  }, []);

  const addImage = useCallback(async (files: FileList) => {
    const image = await Promise.all(
      Array.from(files).map((file) => {
        const name = file.name;
        return FileServices.putPostImage(file);
      })
    );
    console.log(image);
  }, []);

  const imageUpload = useCallback(
    async (event: any) => {
      const files = event.target.files as FileList;
      if (files.length > 0) {
        await addImage(files);
      }
    },
    [addImage]
  );

  const addProfileImage = useCallback(async (files: FileList) => {
    const image = await Promise.all(
      Array.from(files).map((file) => {
        const name = file.name;
        return FileServices.putProfileImage(file);
      })
    );
    console.log(image);
  }, []);

  const profileUpload = useCallback(
    async (event: any) => {
      const files = event.target.files as FileList;
      if (files.length > 0) {
        await addProfileImage(files);
      }
    },
    [addProfileImage]
  );

  return (
    <div>
      <button onClick={click}>로그인</button>
      <button onClick={logout}>로그아웃</button>
      <button onClick={getUser}>유저</button>
      <button onClick={refresh}>refresh</button>
      <button onClick={getProfile}>프로필</button>
      <button onClick={postProfile}>post profile</button>
      <button onClick={deleteProfile}>delete profile</button>
      <button onClick={updateProfile}>update profile</button>
      <button onClick={addPost}>add post</button>
      <button onClick={getPost}>get post</button>
      <button onClick={getPostByGame}>get post by game</button>
      <button onClick={getNextPostByGame}>get Next post by game</button>
      <button onClick={removePost}>remove Post</button>
      <button onClick={updatePost}>update Post</button>
      <button onClick={likePost}>like Post</button>
      <input
        onInput={imageUpload}
        type="file"
        accept="image/jpg image/png image/jpeg"
      />
      <input
        onInput={profileUpload}
        type="file"
        accept="image/jpg image/png image/jpeg"
      />

      <PostList />
    </div>
  );
}
