import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";

const Landing = () => {
	const [users, setUsers] = useState([]);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState("");

	// Backend API Endpoint

	const URL = "http://localhost:8080/api/users";
	// const URL = "https://social-media-backend2-rajkumar.onrender.com/api/users";

	// Retrieving the user mail Id's stored in Cookies ("users")

	useEffect(() => {
		const storedUsers = Cookies.get("users");

		if (storedUsers) {
			setUsers(JSON.parse(storedUsers));
		}
	}, []);

	// Generating a Random Colour

	const generateRandomColor = () => {
		const letters = "0123456789ABCDEF";
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	// HANDLE CLICK

	const handleClick = async (mail) => {
		setLoading(true);
		setSelected(mail);

		try {
			const response = await axios.post(URL + "/autoLogin", {
				mail,
				password: "",
			});
			setLoading(false);

			if (response.data === "ERROR") {
				console.log("Unexpected Error while Auto Login");
			} else if (response.data === "NOT FOUND") {
				console.log("User Not Found");
			} else if (response.data === "FAILED") {
				navigate("/login", { state: { mail } });
			} else if (response.data === "SUCCESS") {
				navigate("/home", { state: { mail } });
			} else {
				console.log("Unknown Error");
			}
		} catch (error) {
			setLoading(false);
			console.log("Frontend Landing : ", error);
		}
	};

	// HANDLE REMOVE

	const handleRemove = (userToBeRemoved) => {
		const updatedUsers = users.filter((user) => user !== userToBeRemoved);
		Cookies.set("users", JSON.stringify(updatedUsers));
		setUsers(updatedUsers);
	};

	return (
		<div className="landingContainer">
			<div className="landingTitle">
				<p>SOCIAL MEDIA PROJECT</p>
				<a href="https://rajkumar-employee-project.onrender.com/" target="#">
					PROJECTS
				</a>
			</div>
			<div className="landingContent">
				<div className="landingPic">
					<img src={require("../assets/Landing.png")} alt="Landing_Pic" />
				</div>
				<div className="landingUsers">
					<div className="landingLoginAs">
						<p>Login as</p>
					</div>
					<div className="landingUserDetails">
						{users &&
							users.map((user, index) =>
								selected === user && loading ? (
									<div className="landingUserCard" key={index}>
										<Spinner />
									</div>
								) : (
									<div className="landingUserCard" key={index}>
										<div className="landingUserAvatar">
											<div
												className="landingUserIcon"
												style={{ backgroundColor: generateRandomColor() }}>
												<p onClick={() => handleClick(user)}>
													{user.charAt(0).toUpperCase()}
												</p>
											</div>
											<div className="landingUserTooltip">
												<p>{user}</p>
											</div>
										</div>
										<p
											className="landingUserRemove"
											onClick={() => handleRemove(user)}>
											Remove
										</p>
									</div>
								)
							)}
					</div>
					<div className="landingNewUser">
						<button onClick={() => navigate("/login")}>+</button>
						<div className="landingNewUserTooltip">
							<p>New User</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Landing;
