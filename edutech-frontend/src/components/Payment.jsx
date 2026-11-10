import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/payment.css";

function loadRazorpayScript() {
	return new Promise((resolve) => {
		if (window.Razorpay) return resolve(true);
		const script = document.createElement("script");
		script.src = "https://checkout.razorpay.com/v1/checkout.js";
		script.onload = () => resolve(true);
		script.onerror = () => resolve(false);
		document.body.appendChild(script);
	});
}

export default function Payment() {
	const location = useLocation();
	const navigate = useNavigate();
	const { courseName = "Unknown Course", price = 0, courseId = null } = location.state || {};
	const [loading, setLoading] = useState(false);

	// Helper function to convert course/hackathon name to URL slug
	const getCoursePath = (name) => {
		if (!name) return "/";
		// Convert course name to URL-friendly format
		
		return `/course/${name}`;
	};

	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const handlePay = async () => {
		setLoading(true);
		const ok = await loadRazorpayScript();
		if (!ok) {
			alert("Failed to load Razorpay SDK. Check your internet connection.");
			setLoading(false);
			return;
		}

		try {
			const resp = await fetch("http://localhost:4000/api/payment/order", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ amount: price }),
				credentials: "include",
			});

			const orderData = await resp.json();
			if (!resp.ok) {
				throw new Error(orderData && orderData.message ? orderData.message : "Order creation failed");
			}
			if (!orderData || !orderData.id) throw new Error("Order creation failed");

			const options = {
				key: orderData.key,
				amount: orderData.amount,
				currency: orderData.currency,
				name: "Skyinten",
				description: courseName,
				order_id: orderData.id,
				handler: async function (response) {
					// verify payment on server
					const verifyResp = await fetch("http://localhost:4000/api/payment/verify", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							razorpay_order_id: response.razorpay_order_id,
							razorpay_payment_id: response.razorpay_payment_id,
							razorpay_signature: response.razorpay_signature,
							courseName: courseName,
						}),
						credentials: "include",
					});

					const verifyData = await verifyResp.json();
					if (verifyData && verifyData.success) {
						const enrolledMsg = verifyData.enrolled ? ' Enrolled recorded.' : '';
						toast.success('Successfully purchased.' + enrolledMsg);
					// Navigate to the Courses or Hackathons listing depending on itemType and reload page
					const itemType = (location.state && location.state.itemType) || 'course';
					const redirectUrl = itemType === 'hackathon' ? '/hackathons' : '/courses';
					setTimeout(() => {
						window.location.href = redirectUrl;
					}, 1500);
					} else {
						toast.error('Payment verification failed. Contact support. ' + (verifyData && verifyData.message ? verifyData.message : ''));
					}
				},
				prefill: {
					name: "",
					email: "",
					contact: "",
				},
				theme: { color: "#2563eb" },
			};

			const rzp = new window.Razorpay(options);
			rzp.open();
		} catch (error) {
			console.error("handlePay error", error);
			alert("Payment initialization failed: " + (error.message || "Unknown error"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="payment-wrapper">
			<div className="payment-container">
				<div className="payment-header">
					<p className="secure">
						<span>🔒</span> Secure Checkout
					</p>
				</div>

				<div className="course-summary">
					<p>
						<strong>Course :</strong> {courseName}
					</p>
					<p>
						<strong>Price :</strong> {price} INR
					</p>
				</div>

				<hr />

				<div style={{ marginTop: 12 }}>
					<button className="pay-btn" onClick={handlePay} disabled={loading}>
						{loading ? "Processing..." : `Pay ₹${price}`}
					</button>
				</div>
			</div>
		</div>
	);
}

