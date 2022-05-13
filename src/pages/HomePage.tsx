import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AddPostElement from "../components/posts/AddPostElement";
import { UserDataContext } from "../context/UserDataContextProvider";
import AuthServices from "../services/AuthServices";
import PostServices from "../services/PostServices";
import ProfileServices from "../services/ProfileServices";
import UserServices from "../services/UserServices";
import { AddPostReqData, Post } from "../types/post.type";

export default function HomePage() {
  const navigate = useNavigate();
  const { currentProfile } = useContext(UserDataContext);
  const click = () => {
    navigate("/login");
  };

  const getUser = async () => {
    try {
      const user = await UserServices.getUsername();
      console.log(user);
    } catch {
      console.log("");
    }
  };

  const logout = async () => {
    try {
      await AuthServices.signOut();
    } catch {
      console.log("");
    }
  };

  const refresh = async () => {
    const response = await UserServices.getUsernameWithRefresh();
    console.log(response);
  };

  const getProfile = async () => {
    await ProfileServices.getProfiles();
  };

  const postProfile = async () => {
    await ProfileServices.postProfiles({
      nickname: "호벗",
      game: "메이플",
      profileImage: "",
    });
  };

  const updateProfile = async () => {
    await ProfileServices.updateProfiles({
      nickname: "호벗123",
      game: "메이플스토리",
      profileImage: "",
      username: "호벗",
      date: "2022-05-14 03:30:50am 395",
    });
  };

  const deleteProfile = async () => {
    await ProfileServices.deleteProfiles("2022-05-14 03:22:20am 796");
  };

  const addPost = async () => {
    const newPost: AddPostReqData = {
      game: "리그 오브 레전드",
      profile: currentProfile,
      text: "hi",
      images: null,
      likes: [],
      dislikes: [],
      comments: [],
    };
    PostServices.addPost(newPost);
  };

  const getPostByGame = async () => {
    const game = "리그 오브 레전드";
    PostServices.getPostByGame(game);
  };

  const removePost = async () => {
    const removeData = {
      game: "리그 오브 레전드",
      date: "2022-05-13 03:49:20am",
    };
    PostServices.removePost(removeData);
  };
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
      <button onClick={getPostByGame}>get post by game</button>
      <button onClick={removePost}>remove Post</button>
      <AddPostElement />
    </div>
  );
}
