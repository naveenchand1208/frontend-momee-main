'use client';
import './page.css';
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import apiRoutes from "@/common/constants/apiRoutes";
import { apiRequest } from "@/common/api/apiService";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../common/store/auth/authSlice";
import CircularProgress from '@mui/material/CircularProgress';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { showSuccess,showError } from "@/common/toast/toastService";
export default function Login() {
	const [userName, setUserName] = useState('');
	const [password, setPassword] = useState('');
	const [token, setToken] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const dispatch = useDispatch();
	const [showPassword, setShowPassword] = useState(false);
	const loginRef = useRef(false);
	const handleLogin = async (e) => {
		e.preventDefault();
		if (loginRef.current) return;
		loginRef.current = true;
		setLoading(true);

		if (userName !== 'admin' || password !== '12345') {
		showError('Invalid username or password');
		setLoading(false);
		loginRef.current = false;
		return;
	}
		const payload = {
			params: {
				userName,
				password,
			},
		};
		try {
			const data = await apiRequest(apiRoutes.login, 'POST', payload);
			if (data.response && data.data.token) {
				dispatch(loginSuccess({
					token: data.data.token,
					user: { userName }
				}));

				setToken(data.data.token);
				showSuccess(data.message)
				router.push('/');
			} else {
				// alert('Login failed. Please try again.');
			}
		} catch (error) {
			console.error('Login error:', error);
			// alert('An error occurred during login.');
		} finally {
			setLoading(false);
			loginRef.current = false;
		}
	};
	return (
		<div>
			{!token && (
				<div className="hold-transition theme-primary bg-img"
					style={{
						backgroundImage: `url('./assets/login-bg.jpg')`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						height: '100vh'
					}}>
					<div className="container h-p100 pt-5">
						<div className="row login align-items-center justify-content-md-center h-p100 p-5">
							<div className="col-12">
								<div className="row justify-content-center g-0 mb-5">
									<div className="box col-lg-5 col-md-5 col-12 h-50">
										<div className="bg-white rounded-3 shadow-lg p-5 pt-3">
											<div className="content-top-agile">
												<h2 className="text text-center fw-600"><b>Let's Get Started</b></h2>
												<p className="mb-0 text-fade text-center pb-3">Sign in to continue to Momee Admin.</p>
											</div>
											<div className="p-40">
												<form onSubmit={handleLogin}>
													<div className="form-group">
														<div className="input-group mb-3">
															<span className="input-group-text bg-transparent">
																<Image src="/assets/icons/login-user-icon.svg" alt="logo" width={24} height={24} />
															</span>
															<input type="text" className="form-control ps-15 bg-transparent"
																placeholder="Username"
																value={userName}
																onChange={(e) => setUserName(e.target.value)}
																required
															/>
														</div>
													</div>
													<div className="form-group">
														<div className="input-group mb-3">
															<span className="input-group-text bg-transparent">
																<Image src="/assets/icons/login-password-icon.svg" alt="logo" width={24} height={24} />
															</span>
															<input
																type={showPassword ? 'text' : 'password'}
																className="form-control ps-15 bg-transparent"
																placeholder="Password"
																value={password}
																onChange={(e) => setPassword(e.target.value)}
																required
															/>
															<span className="input-group-text bg-transparent cursor" onClick={() => setShowPassword(prev => !prev)}>
																{showPassword ? <VisibilityOff /> : <Visibility />}
															</span>
														</div>
													</div>
													<div className="row">
														<div className="col-6">
															<div className="d-flex align-items-center">
																<input
																	type="checkbox"
																	id="basic_checkbox_1"
																	style={{ width: '18px', height: '18px' }}
																/>
																<label htmlFor="basic_checkbox_1" className="ms-2 mb-0">
																	Remember Me
																</label>
															</div>
														</div>

														<div className="col-12 text-center">
															<button type="submit" className="btn custom-btn w-100 mt-10 mt-2 cursor" disabled={loading}>
																{loading ? <CircularProgress size={25} color="white" />
																	: 'SIGN IN'}
															</button>
														</div>
													</div>
												</form>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

