import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Spinner from "./Spinner";

const SignupSuccessful = () => {
	const [imageSrc, setImageSrc] = useState(
		require("../assets/SignupFailed.png")
	);
	const [message, setMessage] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const location = useLocation();

	// Backend API Endpoint

	const URL = "http://localhost:8080/api/users";

	useEffect(() => {
		const query = new URLSearchParams(location.search);
		const mail = query.get("mail");

		const confirmation = async () => {
			setLoading(true);
			try {
				const response = await axios.post(URL + "/signupSuccessful", {
					mail,
					username: "",
					password: "",
				});
				setLoading(false);

				if (response.data === "ERROR") {
					setMessage("Unexpected Error while Confirmation");
				} else if (response.data === "NOT FOUND") {
					setMessage("No Account Found");
				} else if (response.data === "SUCCESS") {
					setImageSrc(require("../assets/SignupSuccessful.png"));
					setSuccess(true);
					setMessage("Sign up Successful go to Login Page : ");
				} else {
					setMessage("Unknown Error");
				}
			} catch (error) {
				setLoading(false);
				setMessage("Error Please Try Again");
			}
		};

		if (mail) {
			confirmation();
		} else {
			setMessage("Mail Not Provided");
		}
	}, [location.search]);

	return (
		<div className="signupSuccessfulContainer">
			<div className="signupSuccessfulDetails">
				{success ? (
					<div className="signupSuccessfulDetailsDiv">
						{loading ? <Spinner /> : <p>{message}</p>}
						<Link to="/login">Login</Link>
					</div>
				) : (
					<div className="signupSuccessfulDetailsDiv">
						{loading ? <p>Loading...</p> : <p>{message}</p>}
					</div>
				)}
			</div>
			<div className="signupSuccessfulPic">
				<img src={imageSrc} alt="signupSuccessful_Pic" />
			</div>
		</div>
	);
};

export default SignupSuccessful;
