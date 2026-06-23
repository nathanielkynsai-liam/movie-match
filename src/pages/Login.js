function Login() {

  const login = () => {
    localStorage.setItem(
      "loggedIn",
      "true"
    );

    alert("Logged In");
  };

  return (
    <div>
      <h1>Login</h1>

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}

export default Login;