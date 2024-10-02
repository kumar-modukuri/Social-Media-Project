import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import Spinner from "./Spinner";

const ForgetPassword = () => {
	const [imageSrc, setImageSrc] = useState(
		require("../assets/Forget_Password.png")
	);
	const [mail, setMail] = useState("");
	const [password, setPassword] = useState("");
	const [otp, setOtp] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [otpVisible, setOtpVisible] = useState(false);
	const [success, setSuccess] = useState(false);
	const [passwordChanged, setPasswordChanged] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [intervalId, setIntervalId] = useState(null);
	const [resendVisible, setResendVisible] = useState(false);

	// Backend API Endpoint

	const URL = "http://localhost:8080/api/users";
	// const URL = "https://social-media-backend2-rajkumar.onrender.com/api/users";

	// HANDLE CLICK

	const handleClick = async () => {
		if (mail === "") {
			setMessage("Plase Enter Mail");
		} else {
			setLoading(true);
			try {
				const response = await axios.post(URL + "/forgetPassword", {
					mail,
					password: "",
				});
				setLoading(false);

				if (response.data === "ERROR") {
					setMessage("Unexpected Error in Forget Password");
				} else if (response.data === "NOT FOUND") {
					setMessage("No Account Found");
				} else if (response.data === "OTP ERROR") {
					setMessage("Unexpected Error while Sending OTP");
				} else if (response.data === "SUCCESS") {
					setImageSrc(require("../assets/Enter_Otp.png"));
					setMessage("OTP Send to " + mail);
					setOtpVisible(true);
					startCountdown();
				} else {
					setMessage("Unknown Error");
				}
			} catch (error) {
				setLoading(false);
				setMessage("Error Please Try Again");
			}
		}
	};

	// COUNTDOWN

	const startCountdown = () => {
		setCountdown(30);
		setResendVisible(false);

		const interval = setInterval(() => {
			setCountdown((count) => {
				if (count === 1) {
					clearInterval(interval);
					setResendVisible(true);
					setMessage("Click Resend OTP");
					return 0;
				}
				return count - 1;
			});
		}, 1000);

		setIntervalId(interval);
	};

	// HANDLE OTP

	const handleOTP = async () => {
		if (otp === "") {
			setMessage("Plase Enter OTP");
		} else {
			if (parseInt(otp)) {
				setLoading(true);
				try {
					const response = await axios.post(URL + "/confirmOtp", {
						mail,
						password: otp,
					});
					setLoading(false);

					if (response.data === "ERROR") {
						setMessage("Unexpected Error while OTP Confirmation");
					} else if (response.data === "NOT FOUND") {
						setMessage("User Not Found");
					} else if (response.data === "INCORRECT") {
						setMessage("Incorrect OTP");
					} else if (response.data === "SUCCESS") {
						setImageSrc(require("../assets/Change_Password.png"));
						setSuccess(true);
						clearInterval(intervalId);
						setMessage("Enter New Password");
					} else {
						setMessage("Unknown Error");
					}
				} catch (error) {
					setLoading(false);
					setMessage("Error Please Try Again");
				}
			} else {
				setMessage("OTP Should be a 6-digit Number");
			}
		}
	};

	// HANDLE PASSWORD

	const handlePassword = async () => {
		if (password === "") {
			setMessage("Please Enter Password");
		} else {
			setLoading(true);
			try {
				const response = await axios.post(URL + "/changePassword", {
					mail,
					password,
				});
				setLoading(false);

				if (response.data === "ERROR") {
					setMessage("Unexpected Error while Changing Password");
				} else if (response.data === "NOT FOUND") {
					setMessage("No Account Found");
				} else if (response.data === "SUCCESS") {
					setPasswordChanged(true);
					setMessage("Password Changed Successfully go to Login Page");
				} else {
					setMessage("Unknown Error");
				}
			} catch (error) {
				setLoading(false);
				setMessage("Error Please Try Again");
			}
		}
	};

	return (
		<div className="forgetPasswordContainer">
			<div className="forgetPasswordPic">
				<img src={imageSrc} alt="Forget_Password_Pic" />
			</div>
			<div className="forgetPasswordDetails">
				<div className="forgetPasswordTitle">
					<p>FORGET PASSWORD</p>
				</div>
				<div className="forgetPasswordMessage">
					{loading ? <Spinner /> : <p>{message}</p>}
				</div>
				<div className="forgetPasswordForm">
					{otpVisible ? (
						<div className="forgetPasswordFormDiv">
							{success ? (
								<div className="changePasswordFormDiv">
									{passwordChanged ? (
										<div className="lastDiv">
											<Link to="/login">Login</Link>
										</div>
									) : (
										<div className="lastDiv">
											<input
												type="text"
												placeholder="Enter Password"
												value={password}
												onChange={(e) => setPassword(e.target.value)}
											/>
											<button onClick={handlePassword} disabled={loading}>
												Submit
											</button>
										</div>
									)}
								</div>
							) : (
								<div className="changePasswordFormDiv">
									<input
										type="text"
										placeholder="Enter OTP"
										value={otp}
										onChange={(e) => setOtp(e.target.value)}
									/>
									{countdown !== 0 ? (
										<p>Resend OTP in : {countdown}s</p>
									) : (
										<p>Enter OTP Before Timeout</p>
									)}
									{resendVisible ? (
										<button onClick={handleClick} disabled={loading}>
											Resend OTP
										</button>
									) : (
										<button onClick={handleOTP} disabled={loading}>
											Submit OTP
										</button>
									)}
								</div>
							)}
						</div>
					) : (
						<div className="forgetPasswordFormDiv">
							<input
								type="text"
								placeholder="Enter Mail"
								value={mail}
								onChange={(e) => setMail(e.target.value)}
							/>
							<button onClick={handleClick} disabled={loading}>
								Submit
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ForgetPassword;
