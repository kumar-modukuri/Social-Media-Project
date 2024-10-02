import { Client } from "@stomp/stompjs";
import axios from "axios";
import Cookies from "js-cookie";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SockJS from "sockjs-client";
import Spinner from "./Spinner";

let stompClient = null;

const Home = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const mail = location.state?.mail;
	const [loading, setLoading] = useState(false);
	const [reqDel, setReqDel] = useState(false);
	const [frndDel, setFrndDel] = useState(false);
	const [user, setUser] = useState({});
	const [friends, setFriends] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [searched, setSearched] = useState("");
	const [searchedUsers, setSearchedUsers] = useState([]);
	const [message, setMessage] = useState("");
	const [chats, setChats] = useState([]);
	const [selectedChats, setSelectedChats] = useState([]);
	const [selected, setSelected] = useState(null);
	const [delSelected, setDelSelected] = useState("");
	const [sendReqSelected, setSendReqSelected] = useState("");
	const [delReqSelected, setDelReqSelected] = useState("");
	const [reqAcc, setReqAcc] = useState("");
	const [activeTab, setActiveTab] = useState("requests");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [requests, setRequests] = useState([]);
	const [sent, setSent] = useState([]);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const [isConnected, setIsConnected] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);

	// Backend 1 API Endpoint

	const URL = "http://localhost:8080/api/users";
	// const URL = "https://social-media-backend-rajkumar.onrender.com/api/users";

	// SYNC CHATS WITH CHATREF

	const chatsRef = useRef([]);

	useEffect(() => {
		chatsRef.current = chats;
	}, [chats]);

	// SYNC ISCONNECTED WITH ISCONNECTEDREF

	const isConnectedRef = useRef(false);

	useEffect(() => {
		isConnectedRef.current = isConnected;
	}, [isConnected]);

	// ON CONNECTED

	const onConnected = useCallback(() => {
		console.log("Connected");

		if (stompClient && stompClient.connected) {
			stompClient.publish({
				destination: "/chat/global",
				body: JSON.stringify({ mail, password: "online" }),
			});

			if (!isConnectedRef.current) {
				setIsConnected(true);

				stompClient.subscribe("/global/status", (onlineUsersList) => {
					if (onlineUsersList.body) {
						setOnlineUsers(JSON.parse(onlineUsersList.body));
					}
				});

				stompClient.subscribe("/private/" + mail + "/chat", (msg) => {
					if (msg.body) {
						const response = JSON.parse(msg.body);

						if (response.timestamp === "DELETE CHATS") {
							const remainingChats = chatsRef.current.filter(
								(chat) =>
									!(
										(chat.sender === response.sender &&
											chat.receiver === response.receiver) ||
										(chat.sender === response.receiver &&
											chat.receiver === response.sender)
									)
							);

							setChats(remainingChats);
							setSelectedChats([]);
						} else {
							setChats((prev) => [...prev, JSON.parse(msg.body)]);
						}
					}
				});
			}
		}
	}, [mail]);

	// ON DISCONNECTED

	const onDisconnected = useCallback(() => {
		console.log("Disconnected from WebSocket");

		if (stompClient && stompClient.connected) {
			stompClient.publish({
				destination: "/chat/global",
				body: JSON.stringify({ mail, password: "offline" }),
			});
		}
	}, [mail]);

	// ON ERROR

	const onError = useCallback((error) => {
		console.error("WebSocket error:", error);

		if (stompClient && !stompClient.connected) {
			setTimeout(() => {
				console.log("Attempting to reconnect");
				if (stompClient) {
					stompClient.activate();
				}
			}, 3000);
		}
	}, []);

	// FETCH USER , FRIENDS , ALLUSERS , REQUESTS RECEIVED , REQUESTS SEND , WEB SOCKET CONNECTION

	useEffect(() => {
		const fetchUser = async () => {
			setLoading(true);
			try {
				const response = await axios.get(URL + "/" + mail);
				setLoading(false);

				if (response.data && response.data.loggedIn) {
					setUser(response.data);
					setSelected(response.data);
				} else {
					navigate("/");
				}
			} catch (error) {
				setLoading(false);
				console.log("Unexpected Error while Fetching User");
			} finally {
				fetchFriends();
				fetchAllUsers();
				fetchRequests();
				fetchSent();
				fetchChats();
				connect();
			}
		};

		const fetchFriends = async () => {
			setLoading(true);
			try {
				const response = await axios.get(URL + "/friends/" + mail);
				setLoading(false);

				if (response.data && response.data.length > 0) {
					setFriends(response.data);
				}
			} catch (error) {
				setLoading(false);
				console.log("Unexpected Error while Fetching Friends");
			}
		};

		const fetchAllUsers = async () => {
			setLoading(true);
			try {
				const response = await axios.get(URL);
				setLoading(false);

				if (response.data.length !== null) {
					const filteredUsers = response.data.filter(
						(user) => user.mail !== mail
					);
					setAllUsers(filteredUsers);
				} else {
					console.log("Unknown Error in fetchAllUsers");
				}
			} catch (error) {
				setLoading(false);
				console.log("Unexpected Error while Fetching All Users");
			}
		};

		const fetchRequests = async () => {
			setLoading(true);
			try {
				const response = await axios.get(URL + "/requests/" + mail);
				setLoading(false);

				if (response.data && response.data.length > 0) {
					setRequests(response.data);
				}
			} catch (error) {
				setLoading(false);
				console.log("Unexpected Error while Fetching Requests");
			}
		};

		const fetchSent = async () => {
			setLoading(true);
			try {
				const response = await axios.get(URL + "/sent/" + mail);
				setLoading(false);

				if (response.data && response.data.length > 0) {
					setSent(response.data);
				}
			} catch (error) {
				setLoading(false);
				console.log("Unexpected Error while Fetching Sent");
			}
		};

		const fetchChats = async () => {
			setLoading(true);
			try {
				const response = await axios.get(URL + "/chats/" + mail);
				setLoading(false);

				if (response.data && response.data.length > 0) {
					setChats(response.data);
				}
			} catch (error) {
				setLoading(false);
				console.log("Unexpected Error while Fetching Chats");
			}
		};

		const connect = () => {
			const socket = new SockJS("http://localhost:8080/api/ws");
			stompClient = new Client({
				webSocketFactory: () => socket,
				onConnect: onConnected,
				onDisconnect: onDisconnected,
				onStompError: onError,
			});

			stompClient.activate();
		};

		if (mail) {
			fetchUser();
		} else {
			navigate("/login");
		}

		window.addEventListener("beforeunload", onDisconnected);

		return () => {
			if (stompClient && stompClient.connected) {
				stompClient.deactivate();
				onDisconnected();
				stompClient = null;
			}
		};
	}, [mail, navigate, onConnected, onDisconnected, onError]);

	// FILTERING USERS BY SEARCH

	useEffect(() => {
		if (allUsers) {
			if (searched !== "") {
				const filteredUsers = allUsers.filter((user) =>
					user.username.toLowerCase().includes(searched.toLowerCase())
				);

				setSearchedUsers(filteredUsers);
			}
		}
	}, [allUsers, searched]);

	// FILTERING CHATS BY SELECTED

	useEffect(() => {
		if (selected) {
			const filteredChats = chats
				.filter(
					(chat) =>
						(chat.sender.includes(mail) &&
							chat.receiver.includes(selected.mail)) ||
						(chat.sender.includes(selected.mail) &&
							chat.receiver.includes(mail))
				)
				.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

			setSelectedChats(filteredChats);
		}
	}, [selected, chats, mail]);

	// LOGOUT

	const handleLogout = async () => {
		setLoading(true);

		try {
			const response = await axios.post(
				"http://localhost:8080/api/users/logout",
				{
					mail,
					password: "",
				}
			);
			setLoading(false);

			if (response.data === "ERROR") {
				console.log("Unexpected Error while Logout");
			} else if (response.data === "SUCCESS") {
				onDisconnected();
				navigate("/");
			} else {
				console.log("Unknown Error");
			}
		} catch (error) {
			setLoading(false);
			console.log("Error Please Try Again");
		}
	};

	// IS FRIEND

	const isFriend = (friend) => {
		return friends.some((frnd) => frnd.mail === friend.mail);
	};

	// IS SENT (REQUEST)

	const isSent = (otherUser) => {
		return sent.some((sentData) => sentData === otherUser.mail);
	};

	// IS ONLINE

	const isOnline = (friend) => {
		return onlineUsers.some((onlineUser) => onlineUser === friend.mail);
	};

	// SEND FRIEND REQUEST

	const handleSendRequest = async (otherUser) => {
		setLoading(true);
		setSendReqSelected(otherUser.mail);

		try {
			const response = await axios.post(URL + "/request", {
				from: user.mail,
				to: otherUser.mail,
				username: user.username,
				image: user.image,
			});
			setLoading(false);

			if (response.data === "ERROR") {
				console.log("Unexpected Error while Sending Request");
			} else if (response.data === "NOT FOUND") {
				console.log("User Not Found");
			} else if (response.data === "SUCCESS") {
				setSent((prevSent) => [...prevSent, otherUser.mail]);
			} else if (response.data === "ACCEPTED") {
				setRequests(requests.filter((req) => req.from !== otherUser.mail));

				const newFriend = {
					mail: otherUser.mail,
					username: otherUser.username,
					image: otherUser.image,
				};

				setFriends((prevFriends) => {
					const updatedFriends = [...prevFriends, newFriend].sort((a, b) =>
						a.username.localeCompare(b.username)
					);
					return updatedFriends;
				});

				setSent(sent.filter((sentReq) => sentReq !== otherUser.mail));
			} else if (response.data === "ALREADY SENT") {
				window.alert("Friend request Already Sent");
			} else {
				console.log("Unknown Error");
			}
		} catch (error) {
			setLoading(false);
			console.log("Error Please Try Again");
		}
	};

	// DELETE FRIEND

	const handleDelete = async (friend) => {
		setFrndDel(true);
		setDelSelected(friend.mail);

		try {
			const response = await axios.post(URL + "/deleteFriend/" + mail, {
				mail: friend.mail,
				username: friend.username,
			});
			setFrndDel(false);

			if (response.data === "ERROR") {
				console.log("Unexpected Error while Deleting Friend");
			} else if (response.data === "NOT FOUND") {
				console.log("User Not Found");
			} else if (response.data === "SUCCESS") {
				setFriends(friends.filter((frnd) => frnd.mail !== friend.mail));
				setSelected(user);
			} else {
				console.log("Unknown Error");
			}
		} catch (error) {
			setFrndDel(false);
			console.log("Error Please Try Again");
		}
	};

	// HANDLE UPDATE

	const handleUpdate = async () => {
		setLoading(true);

		try {
			const response = await axios.post(URL + "/update", {
				mail,
				username,
				password,
				image: selectedFile,
			});
			setLoading(false);

			if (response.data === "ERROR") {
				console.log("Unexpected Error while Updating");
			} else if (response.data === "NOT FOUND") {
				console.log("User Not Found");
			} else if (response.data === "SUCCESS") {
				setUsername("");
				setPassword("");

				setUser((prevUser) => ({
					...prevUser,
					username: username || prevUser.username,
					password: password || prevUser.password,
				}));

				setUser((user) => ({
					...user,
					image: selectedFile || require("../assets/Profile.png"),
				}));
			} else {
				console.log("Unknown Error");
			}
		} catch (error) {
			setLoading(false);
			console.log("Error Please Try Again");
		}
	};

	// HANDLE DELETE ACCOUNT

	const handleDeleteAccount = async () => {
		setLoading(true);

		try {
			const response = await axios.post(URL + "/delete/" + mail);
			setLoading(false);

			if (response.data === "SUCCESS") {
				let users = Cookies.get("users");
				users = users ? JSON.parse(users) : [];
				const updatedUsers = users.filter((user) => user !== mail);
				Cookies.set("users", JSON.stringify(updatedUsers));

				navigate("/");
			}
		} catch (error) {
			setLoading(false);
			console.log("Error Please Try Again");
		}
	};

	// ACCEPT REQUEST

	const handleRequestAccept = async (request) => {
		setLoading(true);
		setReqAcc(request.from);

		try {
			const response = await axios.post(URL + "/acceptRequest", {
				from: request.from,
				to: request.to,
				username: request.username,
				image: request.image,
			});
			setLoading(false);

			if (response.data === "ERROR") {
				console.log("Unexpected Error while Accepting Request");
			} else if (response.data === "NOT FOUND") {
				console.log("User Not Found");
			} else if (response.data === "SUCCESS") {
				setRequests(requests.filter((req) => req.from !== request.from));

				const newFriend = {
					mail: request.from,
					username: request.username,
					image: request.image,
				};

				setFriends((prevFriends) => {
					const updatedFriends = [...prevFriends, newFriend].sort((a, b) =>
						a.username.localeCompare(b.username)
					);
					return updatedFriends;
				});
			} else {
				console.log("Unknown Error");
			}
		} catch (error) {
			setLoading(false);
			console.log("Error Please Try Again");
		}
	};

	// DELETE REQUEST

	const handleRequestDelete = async (request) => {
		setReqDel(true);
		setDelReqSelected(request.from);

		try {
			const response = await axios.post(URL + "/deleteRequest", {
				from: request.from,
				to: request.to,
				username: request.username,
				image: request.image,
			});
			setReqDel(false);

			if (response.data === "ERROR") {
				console.log("Unexpected Error while Deleting Request");
			} else if (response.data === "NOT FOUND") {
				console.log("User Not Found");
			} else if (response.data === "SUCCESS") {
				setRequests(requests.filter((req) => req.from !== request.from));
			} else {
				console.log("Unknown Error");
			}
		} catch (error) {
			setReqDel(false);
			console.log("Error Please Try Again");
		}
	};

	// TIMESTAMPS

	const formatTime = (timestamp) => {
		const date = new Date(timestamp);
		const hours = date.getHours();
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const ampm = hours >= 12 ? "PM" : "AM";
		const formattedHours = hours % 12 || 12;
		return `${formattedHours}:${minutes} ${ampm}`;
	};

	const formatDate = (timestamp) => {
		return new Date(timestamp).toDateString();
	};

	// SEND MESSAGE

	const sendMessage = () => {
		if (stompClient && stompClient.connected) {
			if (message !== "") {
				const msg = {
					sender: mail,
					receiver: selected.mail,
					content: message,
					timestamp: String(new Date()),
					read: false,
				};

				stompClient.publish({
					destination: "/chat/private",
					body: JSON.stringify(msg),
				});
				setChats((prev) => [...prev, msg]);
				setMessage("");
			} else {
				console.log("Enter Message");
			}
		} else {
			console.log("Not Connected");
		}
	};

	// DELETE CHATS

	const deleteChats = async () => {
		if (stompClient && stompClient.connected) {
			const msg = {
				sender: mail,
				receiver: selected.mail,
				content: "",
				timestamp: "DELETE CHATS",
				read: false,
			};

			stompClient.publish({
				destination: "/chat/private",
				body: JSON.stringify(msg),
			});

			const remainingChats = chats.filter(
				(chat) =>
					!selectedChats.some(
						(selectedChat) =>
							(selectedChat.sender === chat.sender &&
								selectedChat.receiver === chat.receiver) ||
							(selectedChat.receiver === chat.sender &&
								selectedChat.sender === chat.receiver)
					)
			);

			setChats(remainingChats);
			setSelectedChats([]);
		} else {
			console.log("Not Connected");
		}
	};

	// SCROLL TO BOTTOM OF CHAT

	const chatEndRef = useRef(null);

	useEffect(() => {
		if (chatEndRef.current) {
			chatEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [selectedChats]);

	// CHANGE IMAGE

	const fileInputRef = useRef(null);

	const handleImageClick = () => {
		fileInputRef.current.click();
	};

	const handleFileChange = (event) => {
		const file = event.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onloadend = () => {
				setSelectedFile(reader.result);
			};
		}
	};

	return (
		<div className="homeContainer">
			<div className="homeFriends">
				<div className="homeFriendsDiv">
					<div className="homeFriendsDivSearch">
						<div className="homeFriendsDivSearchProfile">
							<div
								className="homeFriendsDivSearchProfileDiv"
								onClick={() => setSelected(user)}>
								<img
									src={
										user.image === "EMPTY"
											? require("../assets/Profile.png")
											: user.image
									}
									alt="Profile_Icon"
								/>
								<p>{user.username}</p>
							</div>
							<button onClick={handleLogout} disabled={loading}>
								Logout
							</button>
						</div>
						<div className="homeFriendsDivSearchInput">
							<input
								placeholder="Search here"
								value={searched}
								onChange={(e) => setSearched(e.target.value)}
							/>
						</div>
					</div>
					<div className="homeFriendsDivList">
						<div className="homeFriendsDivListHolder">
							{searched === "" ? (
								friends.length > 0 ? (
									friends.map((friend, index) => (
										<div key={index} className="homeFriendsDivListCard">
											<div
												className="homeFriendsDivListCardProfile"
												onClick={() => setSelected(friend)}
												style={{ cursor: "pointer" }}>
												<img
													src={
														friend.image !== "EMPTY"
															? friend.image
															: require("../assets/Profile.png")
													}
													alt="Profile_Icon"
													style={{ borderRadius: "50%" }}
												/>
												<div>
													<p className="homeFriendsDivListCardProfileP">
														{friend.username}
													</p>
													<p className="homeFriendsDivListCardProfileMail">
														{friend.mail}
													</p>
												</div>
											</div>
											<div className="homeFriendsDivListCardStatus">
												{frndDel && delSelected === friend.mail ? (
													// <p className="landingLoading">Wait</p>
													<Spinner />
												) : (
													<img
														src={require("../assets/Delete.png")}
														alt="Delete_Icon"
														onClick={() => handleDelete(friend)}
													/>
												)}
												<p
													style={{
														color: isOnline(friend) ? "#02d614" : "#ff4e4e",
													}}>
													{isOnline(friend) ? "Online" : "Offline"}
												</p>
											</div>
										</div>
									))
								) : (
									<div className="homeWarning">
										{loading ? (
											<p>Loading...</p>
										) : (
											<p>Search and add friends</p>
										)}
									</div>
								)
							) : searchedUsers.length > 0 ? (
								searchedUsers.map((otherUser, index) => (
									<div key={index} className="homeFriendsDivListCard">
										<div
											className="homeFriendsDivListCardProfile"
											onClick={() => setSelected(otherUser)}
											style={{ cursor: "pointer" }}>
											<img
												src={
													otherUser.image !== "EMPTY"
														? otherUser.image
														: require("../assets/Profile.png")
												}
												alt="Profile_Icon"
												style={{ borderRadius: "50%" }}
											/>
											<div>
												<p className="homeFriendsDivListCardProfileP">
													{otherUser.username}
												</p>
												<p className="homeFriendsDivListCardProfileMail">
													{otherUser.mail}
												</p>
											</div>
										</div>
										<div className="homeFriendsDivListCardAddFriend">
											{isFriend(otherUser) ? (
												<img
													className="homeFriendsDivListCardFriend"
													src={require("../assets/Check.png")}
													alt="Profile_Icon"
												/>
											) : isSent(otherUser) ? (
												<img
													className="homeFriendsDivListCardPending"
													src={require("../assets/Pending.png")}
													alt="Profile_Icon"
												/>
											) : loading && sendReqSelected === otherUser.mail ? (
												// <p className="landingLoading">Wait</p>
												<Spinner />
											) : (
												<img
													className="homeFriendsDivListCardAdd"
													src={require("../assets/Add.png")}
													alt="Profile_Icon"
													onClick={() => handleSendRequest(otherUser)}
												/>
											)}
										</div>
									</div>
								))
							) : (
								<div className="homeWarning">
									<p>No Users Found</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="homeChatArea">
				{selected && selected.mail !== user.mail && isFriend(selected) ? (
					<div className="homeChatAreaDiv">
						<div className="homeChatAreaDivTitle">
							<div className="homeChatAreaDivTitleProfile">
								<div className="homeFriendsDivListCardProfile">
									<img
										src={
											selected.image !== "EMPTY"
												? selected.image
												: require("../assets/Profile.png")
										}
										alt="Profile_Icon"
										style={{ borderRadius: "50%" }}
									/>
									<p>{selected.username}</p>
								</div>
							</div>
							<div className="homeChatAreaDivTitleOptions">
								<img
									src={require("../assets/Delete.png")}
									alt="Delete_Icon"
									onClick={deleteChats}
								/>
							</div>
						</div>
						<div className="homeChatAreaDivBody">
							<div className="homeChatAreaDivBodyHolder">
								{chats &&
									selectedChats.map((chat, index) => {
										const chatDate = formatDate(chat.timestamp);
										const todayDate = formatDate(new Date());
										let showDateDivider = false;

										if (
											index === 0 ||
											formatDate(selectedChats[index - 1].timestamp) !==
												chatDate
										) {
											showDateDivider = true;
										}

										return (
											<div key={index}>
												{showDateDivider && (
													<p className="divider">
														{chatDate === todayDate ? "Today" : chatDate}
													</p>
												)}
												<div className="homeChatAreaDivBodyHolderContent">
													<div
														className={chat.sender === mail ? "you" : "other"}>
														<p className="content">{chat.content}</p>
													</div>
													<p
														className={
															chat.sender === mail ? "youTime" : "otherTime"
														}>
														{formatTime(chat.timestamp)}
													</p>
												</div>
											</div>
										);
									})}
								<div ref={chatEndRef} />
							</div>
						</div>
						<div className="homeChatAreaDivFooter">
							<div className="homeChatAreaDivFooterInput">
								<input
									type="text"
									placeholder="Type here"
									value={message}
									onChange={(e) => setMessage(e.target.value)}
								/>
							</div>
							<div className="homeChatAreaDivFooterSend">
								<img
									src={require("../assets/Send.png")}
									alt="Send_Icon"
									onClick={() => sendMessage()}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className="homeChatAreaDiv">
						<div className="homeChatAreaDivText">
							<p>Select a Friend to Start Chatting</p>
						</div>
						<div className="homeChatAreaDivImage">
							<img src={require("../assets/Chatting.png")} alt="Chatting_Pic" />
						</div>
					</div>
				)}
			</div>
			<div className="homeProfile">
				<div className="homeProfileDiv">
					{selected ? (
						selected.mail === user.mail ? (
							<div className="homeProfileDivMe">
								<div className="homeProfileDivMeProfile">
									{activeTab === "edit" ? (
										<div className="homeProfileDivMeProfileDiv">
											{selectedFile === null ? (
												<img
													src={require("../assets/ChangeImage.png")}
													alt="ChangeImage_Icon"
													onClick={handleImageClick}
													style={{ cursor: "pointer" }}
												/>
											) : (
												<img
													className="preview"
													src={selectedFile}
													alt="Preview"
													onClick={handleImageClick}
													style={{ cursor: "pointer", borderRadius: "50%" }}
												/>
											)}
											<input
												type="file"
												ref={fileInputRef}
												onChange={handleFileChange}
												style={{ display: "none" }}
											/>
										</div>
									) : (
										<img
											src={
												user.image === "EMPTY"
													? require("../assets/Profile.png")
													: user.image
											}
											alt="Profile_Icon"
											style={{ borderRadius: "50%" }}
										/>
									)}
									<p className="homeProfileDivMeProfileName">{user.username}</p>
									<p className="homeProfileDivMeProfileMail">{user.mail}</p>
								</div>
								<div className="homeProfileDivMeTabContainer">
									<div className="tabs">
										<div
											className="tabTitles"
											onClick={() => setActiveTab("requests")}
											style={{
												background: activeTab === "requests" && "#ff4e4e",
											}}>
											<p style={{ color: activeTab === "requests" && "white" }}>
												Requests
											</p>
										</div>
										<div
											className="tabTitles"
											onClick={() => setActiveTab("edit")}
											style={{
												background: activeTab === "edit" && "#ff4e4e",
											}}>
											<p style={{ color: activeTab === "edit" && "white" }}>
												Edit
											</p>
										</div>
									</div>
									<div className="tabContent">
										{activeTab === "requests" ? (
											<div className="tab">
												<div className="requestsTabHolder">
													{requests && requests.length > 0 ? (
														requests.map((request, index) => (
															<div
																className="requestsTabHolderCard"
																key={index}>
																<div className="requestsTabHolderCardProfile">
																	<img
																		src={
																			request.image !== "EMPTY"
																				? request.image
																				: require("../assets/Profile.png")
																		}
																		alt="Profile_Icon"
																		style={{ borderRadius: "50%" }}
																	/>
																	<div>
																		<p className="homeFriendsDivListCardProfileP">
																			{request.username}
																		</p>
																		<p className="homeFriendsDivListCardProfileMail">
																			{request.from}
																		</p>
																	</div>
																</div>
																<div className="requestsTabHolderCardOptions">
																	{loading && reqAcc === request.from ? (
																		<p className="landingLoading">Wait</p>
																	) : (
																		<img
																			src={require("../assets/Check.png")}
																			alt="Check_Icon"
																			onClick={() =>
																				handleRequestAccept(request)
																			}
																		/>
																	)}
																	{reqDel && delReqSelected === request.from ? (
																		// <p className="landingLoading">Wait</p>
																		<Spinner />
																	) : (
																		<img
																			src={require("../assets/Delete.png")}
																			alt="Delete_Icon"
																			onClick={() =>
																				handleRequestDelete(request)
																			}
																		/>
																	)}
																</div>
															</div>
														))
													) : (
														<p className="noRequests">No Requests</p>
													)}
												</div>
											</div>
										) : (
											<div className="tab">
												<div className="editTabForm">
													<input
														type="text"
														placeholder="Enter Username"
														value={username}
														onChange={(e) => setUsername(e.target.value)}
													/>
													<input
														type="text"
														placeholder="Enter Password"
														value={password}
														onChange={(e) => setPassword(e.target.value)}
													/>
													<button onClick={handleUpdate} disabled={loading}>
														Update
													</button>
													<button
														onClick={handleDeleteAccount}
														disabled={loading}>
														Delete Account
													</button>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						) : (
							<div className="homeProfileDivFriend">
								<div className="homeProfileDivFriendProfile">
									<img
										src={
											selected.image === "EMPTY"
												? require("../assets/Profile.png")
												: selected.image
										}
										alt="Profile_Icon"
										style={{ borderRadius: "50%" }}
									/>
									<p className="homeProfileDivMeProfileName">
										{selected.username}
									</p>
									<p className="homeProfileDivMeProfileMail">{selected.mail}</p>
								</div>
							</div>
						)
					) : (
						// <p className="homeProfileDivLoading">Loading...</p>
						<Spinner />
					)}
				</div>
			</div>
		</div>
	);
};

export default Home;
