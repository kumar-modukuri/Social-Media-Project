import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

const Login = () => {
	const location = useLocation();
	const mailFromLanding = location.state?.mail;
	const [mail, setMail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordVisibility, setPasswordVisibility] = useState(false);
	const [imageSrc, setImageSrc] = useState(require("../assets/Show.png"));
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	// Backend API Endpoint

	const URL = "http://localhost:8080/api/users";

	// Getting mail from the Landing and setting it to the mail

	useEffect(() => {
		if (mailFromLanding) {
			setMail(mailFromLanding);
		}
	}, [mailFromLanding]);

	// HANDLE CLICK

	const handleClick = async () => {
		if (mail === "" || password === "") {
			setMessage("Enter Mail and Password");
		} else {
			setLoading(true);
			try {
				const response = await axios.post(URL + "/login", { mail, password });
				setLoading(false);

				if (response.data === "ERROR") {
					setMessage("Unexpected Error while Login");
				} else if (response.data === "NOT FOUND") {
					setMessage("User Not Found");
				} else if (response.data === "MAIL ERROR") {
					setMessage("Unexpected Error while Resending Mail");
				} else if (response.data === "SENT") {
					setMessage("Confirmation Mail Send to " + mail);
				} else if (response.data === "INCORRECT") {
					setMessage("Incorrect Password");
				} else if (response.data === "SUCCESS") {
					let users = Cookies.get("users");

					users = users ? JSON.parse(users) : [];

					if (!users.includes(mail)) {
						users.push(mail);
						Cookies.set("users", JSON.stringify(users), { expires: 365 });
					}

					navigate("/home", { state: { mail } });
				} else {
					setMessage("Unknown Error");
				}
			} catch (error) {
				setLoading(false);
				setMessage("Error Please Try Again");
			}
		}
	};

	// HANDLE PASSWORD VISIBILITY

	const handlePasswordVisibility = () => {
		if (passwordVisibility) {
			setPasswordVisibility(false);
			setImageSrc(require("../assets/Show.png"));
		} else {
			setPasswordVisibility(true);
			setImageSrc(require("../assets/Hide.png"));
		}
	};

	return (
		<div className="loginContainer">
			<div className="loginPic">
				<img src={require("../assets/Login.png")} alt="Login_Pic" />
			</div>
			<div className="loginDetails">
				<div className="loginTitle">
					<p>LOGIN</p>
				</div>
				<div className="loginMessage">
					{loading ? <Spinner /> : <p>{message}</p>}
				</div>
				<div className="loginForm">
					<input
						type="text"
						placeholder="Enter Mail"
						value={mail}
						onChange={(e) => setMail(e.target.value)}
					/>
					<input
						type={passwordVisibility ? "text" : "password"}
						placeholder="Enter Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<div className="loginShowHide">
						<img
							src={imageSrc}
							alt="Password_Icon"
							onClick={handlePasswordVisibility}
						/>
						<p>{passwordVisibility ? "Hide" : "Show"} Password</p>
					</div>
					<button onClick={handleClick} disabled={loading}>
						Login
					</button>
				</div>
				<div className="loginForgetPassword">
					<Link to="/forgetPassword">Forget Password ?</Link>
				</div>
				<div className="loginSignup">
					<p>Dont have an account ?</p>
					<Link to="/signup">Signup</Link>
				</div>
			</div>
		</div>
	);
};

export default Login;
