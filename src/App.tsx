import "@aws-amplify/ui-react/styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorPage from "./pages/ErrorPage";
import { useContext, useEffect } from "react";
import UserServices from "./services/UserServices";
import { UserDataContext } from "./context/UserDataContextProvider";
import ProfileServices from "./services/ProfileServices";

function App() {
  const { setUsernameHandler, setProfileArrHandler } =
    useContext(UserDataContext);

  useEffect(() => {
    UserServices.getUsername().then((username) => {
      if (username) {
        setUsernameHandler(username);
        ProfileServices.getProfiles().then((profiles) => {
          if (profiles) {
            setProfileArrHandler(profiles);
          }
        });
      }
    });
  }, [setProfileArrHandler, setUsernameHandler]);

  return (
    <div className="App">
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
}

export default App;
