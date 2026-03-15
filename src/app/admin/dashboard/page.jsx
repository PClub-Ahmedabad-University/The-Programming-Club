"use client";

import React, { useEffect, useRef, useState } from "react";
import "@/app/Styles/AdminNavbar.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import WinnersSection from "./WinnersSection";
import GetParticipantsSection from "./GetParticipantsSection";
import MembersSection from "./MembersSection";
import Webhook from "./webhook";
import RecruitmentSection from "./RecruitmentSection";
import FormSection from "./FormSection";
import AudienceDashboard from "./Audience";
import FormSubmissions from "./FormSubmissions";
import RoleManagement from "./RoleManagement";
import MonitorCoCSection from "./MonitorCoCSection";
import { useUser } from "@/lib/UserContext";

export default function page() {
	const { token } = useUser();

	const [selected, setSelected] = useState(0);
	const [showUI, setShowUI] = useState(1);

	useEffect(() => {
		if (!token) {
			setShowUI(0);
			return;
		}

		(async () => {
			try {
				const res = await fetch("/api/auth/validate", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						authorization: "Bearer " + token,
					},
				});

				if (res.status === 200) setShowUI(2);
				else setShowUI(0);
			} catch {
				setShowUI(0);
			}
		})();
	}, [token]);

	return (
		<>
			{showUI === 2 ? (
				<div className="admin-dashboard">
					<nav className="admin-navbar">
						<ul>
							<li className={selected === 0 ? "selected" : ""} onClick={() => setSelected(0)}>Audience</li>
							<li className={selected === 1 ? "selected" : ""} onClick={() => setSelected(1)}>Forms</li>
							<li className={selected === 2 ? "selected" : ""} onClick={() => setSelected(2)}>Form Submissions</li>
							<li className={selected === 3 ? "selected" : ""} onClick={() => setSelected(3)}>Events</li>
							<li className={selected === 4 ? "selected" : ""} onClick={() => setSelected(4)}>Members</li>
							<li className={selected === 5 ? "selected" : ""} onClick={() => setSelected(5)}>Gallery</li>
							<li className={selected === 6 ? "selected" : ""} onClick={() => setSelected(6)}>Notice</li>
							<li className={selected === 7 ? "selected" : ""} onClick={() => setSelected(7)}>Winners</li>
							<li className={selected === 8 ? "selected" : ""} onClick={() => setSelected(8)}>Get Participants</li>
							<li className={selected === 9 ? "selected" : ""} onClick={() => setSelected(9)}>Webhook</li>
							<li className={selected === 10 ? "selected" : ""} onClick={() => setSelected(10)}>Recruitment</li>
							<li className={selected === 11 ? "selected" : ""} onClick={() => setSelected(11)}>Codeforces Problems</li>
							<li className={selected === 12 ? "selected" : ""} onClick={() => setSelected(12)}>Role Management</li>
							<li className={selected === 13 ? "selected" : ""} onClick={() => setSelected(13)}>Monitor CoC</li>
						</ul>
					</nav>

					<main className="dashboard-content">
						{selected === 0 && <AudienceDashboard />}
						{selected === 1 && <FormSection />}
						{selected === 2 && <FormSubmissions />}
						{selected === 3 && <EventsSection />}
						{selected === 4 && <MembersSection />}
						{selected === 5 && <GallerySection />}
						{selected === 6 && <NoticeSection />}
						{selected === 7 && <WinnersSection />}
						{selected === 8 && <GetParticipantsSection />}
						{selected === 9 && <Webhook />}
						{selected === 10 && <RecruitmentSection />}
						{selected === 11 && <CPProblemsSection />}
						{selected === 12 && <RoleManagement />}
						{selected === 13 && <MonitorCoCSection />}
					</main>
				</div>
			) : showUI === 1 ? (
				<div className="not-show">
					<h2>Loading...</h2>
				</div>
			) : (
				<div className="not-show">
					<h2>Please login as admin first!</h2>
				</div>
			)}
		</>
	);
}

function NoticeSection() {
	const { token } = useUser();

	const [notice, setNotice] = React.useState({ show: false, link: "", message: "" });
	const [loading, setLoading] = React.useState(true);
	const [saving, setSaving] = React.useState(false);

	React.useEffect(() => {
		if (!token) return;

		setLoading(true);

		fetch("/api/notice", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
			.then((res) => res.json())
			.then((data) => {
				setNotice(data || { show: false, link: "", message: "" });
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [token]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		setNotice((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);

		const res = await fetch("/api/notice", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(notice),
		});

		setSaving(false);

		if (res.ok) alert("Notice updated!");
		else alert("Failed to update notice.");
	};

	if (loading) return <div>Loading notice...</div>;

	return (
		<div style={{ background: "linear-gradient(90deg,#026C71 0%,#004457 100%)", color: "white", padding: "2rem", borderRadius: "12px", margin: "2rem 0", maxWidth: 500 }}>
			<h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "1rem" }}>Edit Notice</h2>

			<form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				<label>
					<input type="checkbox" name="show" checked={notice.show} onChange={handleChange} style={{ marginRight: 8 }} />
					Show Notice
				</label>

				<label>
					Link:
					<input type="text" name="link" value={notice.link} onChange={handleChange} required style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "none", marginTop: 4 }} />
				</label>

				<label>
					Message:
					<input type="text" name="message" value={notice.message} onChange={handleChange} required style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "none", marginTop: 4 }} />
				</label>

				<button type="submit" disabled={saving} style={{ background: "#36d1c4", color: "white", border: "none", borderRadius: 6, padding: "0.5rem 1.5rem", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
					{saving ? "Saving..." : "Save Notice"}
				</button>
			</form>
		</div>
	);
}