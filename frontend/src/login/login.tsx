import React, { useState } from "react";
import "./login.css";

interface Props {
  setUserValidated: React.Dispatch<React.SetStateAction<boolean>>;
  setUserID: React.Dispatch<React.SetStateAction<string>>;
}

function Login({ setUserValidated, setUserID }: Props) {
  let username = "";
  let password = "";
  const [errorMessage, setErrorMessage] = useState("");
  const updateUsername = (event: React.FormEvent<HTMLInputElement>) => {
    username = event.currentTarget.value;
  };
  const updatePassword = (event: React.FormEvent<HTMLInputElement>) => {
    password = event.currentTarget.value;
  };
  const checkUserToken = async () => {
    const uri = "http://" + window.location.hostname + "/user/cookielogin";
    fetch(uri, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        return response.text();
      })
      .then((data) => {
        if (data !== "NO") {
          setUserID(data);
          setUserValidated(true);
        }
      });
  };
  checkUserToken();
  const handleLogin = (
    userData: {
      name: String;
      email: String;
      password: String;
    },
    submitButton: HTMLInputElement
  ) => {
    const uri = "http://" + window.location.hostname + "/user/login";
    fetch(uri, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          setErrorMessage("server error");
          submitButton.blur();
          submitButton.setAttribute("value", "Submit");
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.isValid == true) {
          setUserID(data.userID);
          setUserValidated(true);
        } else {
          setErrorMessage("cant find user");
          submitButton.blur();
          submitButton.setAttribute("value", "Submit");
        }
      })
      .catch((error) => {
        console.error("There was a problem with your fetch operation:", error);
      });
  };
  const validateUser = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submitButton = event.currentTarget.getElementsByTagName("input")[2];
    submitButton.setAttribute("value", `Loading...`);
    const userData = {
      name: "",
      email: "",
      password: password,
    };
    if (username.includes("@")) {
      userData.email = username;
    } else {
      userData.name = username;
    }
    handleLogin(userData, submitButton);
  };
  return (
    <div id="login-root">
      <div id="login-container">
        <div id="login-header">LOGIN FORM</div>
        <form id="login-form" onSubmit={validateUser}>
          <div>
            <label>Name or Email: </label>
            <input onInput={updateUsername}></input>
          </div>
          <div>
            <label>Password: </label>
            <input type="password" onInput={updatePassword}></input>
          </div>
          <div>
            <input type="submit" value={"Submit"}></input>
            <div>{errorMessage}</div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
