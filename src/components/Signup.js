import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "./Spinner";

const Signup = () => {
	const [mail, setMail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [passwordVisibility, setPasswordVisibility] = useState(false);
	const [imageSrc, setImageSrc] = useState(require("../assets/Show.png"));
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	// Backend API Endpoint

	const URL = "http://localhost:8080/api/users";
	// const URL = "https://social-media-backend2-rajkumar.onrender.com/api/users";

	// HANDLE CLICK

	const handleClick = async () => {
		if (mail === "" || username === "" || password === "") {
			setMessage("Enter all fields");
		} else {
			setLoading(true);
			try {
				const response = await axios.post(URL + "/signup", {
					mail,
					username,
					password,
				});
				setLoading(false);

				if (response.data === "ERROR") {
					setMessage("Unexcpected Error while Signup");
				} else if (response.data === "ALREADY EXISTS") {
					setMessage("Mail Already Existed");
				} else if (response.data === "MAIL ERROR") {
					setMessage("Unexcpected Error while Sending Mail");
				} else if (response.data === "SAVE ERROR") {
					setMessage("Unexcpected Error while Saving Data");
				} else if (response.data === "SUCCESS") {
					setMail("");
					setUsername("");
					setPassword("");
					setMessage("Confirmation Mail Send to " + mail);
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
		<div className="signupContainer">
			<div className="signupPic">
				<img src={require("../assets/Signup.png")} alt="Signup_Pic" />
			</div>
			<div className="signupDetails">
				<div className="signupTitle">
					<p>SIGNUP</p>
				</div>
				<div className="signupMessage">
					{loading ? <Spinner /> : <p>{message}</p>}
				</div>
				<div className="signupForm">
					<input
						type="text"
						placeholder="Enter Mail"
						value={mail}
						onChange={(e) => setMail(e.target.value)}
					/>
					<input
						type="text"
						placeholder="Enter Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<input
						type={passwordVisibility ? "text" : "password"}
						placeholder="Enter Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
					<div className="signupShowHide">
						<img
							src={imageSrc}
							alt="Password_Icon"
							onClick={handlePasswordVisibility}
						/>
						<p>{passwordVisibility ? "Hide" : "Show"} Password</p>
					</div>
					<button onClick={handleClick} disabled={loading}>
						Signup
					</button>
				</div>
				<div className="signupLogin">
					<p>Already have an account ?</p>
					<Link to="/login">Login</Link>
				</div>
			</div>
		</div>
	);
};

export default Signup;
