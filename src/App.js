import { HashRouter, Route, Routes } from "react-router-dom";
import ForgetPassword from "./components/ForgetPassword";
import Home from "./components/Home";
import Landing from "./components/Landing";
import Login from "./components/Login";
import Signup from "./components/Signup";
import SignupSuccessful from "./components/SignupSuccessful";

function App() {
	return (
		<div className="appContainer">
			<HashRouter>
				<div className="middle">
					<Routes>
						<Route exact path="/" element={<Landing />} />
						<Route path="/login" element={<Login />} />
						<Route path="/home" element={<Home />} />
						<Route path="/forgetPassword" element={<ForgetPassword />} />
						<Route path="/signup" element={<Signup />} />
						<Route path="/signupSuccessful" element={<SignupSuccessful />} />
					</Routes>
				</div>
				<div className="footer">
					<div className="footerContainer">Kumar Modukuri &copy; 2024</div>
				</div>
			</HashRouter>
		</div>
	);
}

export default App;
