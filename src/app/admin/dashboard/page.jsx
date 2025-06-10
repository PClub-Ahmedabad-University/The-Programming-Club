"use client";

import React, { useEffect, useRef, useState } from "react";
import "@/app/Styles/AdminNavbar.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { FaTrophy } from "react-icons/fa";
import WinnersSection from "./WinnersSection";

export default function page() {
	const [selected, setSelected] = useState(0);
	const [userToken, setUserToken] = useState("");
	const [showUI, setShowUI] = useState(1);
	const contents = useRef([
		<EventsSection />,
		<MembersSection />,
		<GallerySection token={userToken} />,
		<NoticeSection />,
		<WinnersSection token={userToken} />
	]);
	useEffect(() => {
		if (process.env.NODE_ENV === "development") setShowUI(2);
		else {
			if (localStorage.getItem("token")) {
				(async () => {
					await fetch("/api/auth/validate", {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							authorization:
								"Bearer " + localStorage.getItem("token"),
						},
					})
						.then((data) => {
							console.log("data received,", data);
							if (data.status === 200) {
								setShowUI(2);
								setUserToken(localStorage.getItem("token"));
							} else {
								setShowUI(0);
							}
						})
						.catch((err) => {
							if (process.env.NODE_ENV === "development")
								console.error(
									"Error in validating user: ",
									err
								);
							setShowUI(0);
						});
				})();
			} else {
				setShowUI(0);
			}
		}
	}, []);

	return (
		<>
			{showUI === 2 ? (
				<div className="admin-dashboard">
					<nav className="admin-navbar">
						<ul>
							<li
								className={selected === 0 ? "selected" : ""}
								onClick={() => setSelected(0)}
							>
								Events
							</li>
							<li
								className={selected === 1 ? "selected" : ""}
								onClick={() => setSelected(1)}
							>
								Members
							</li>
							<li
								className={selected === 2 ? "selected" : ""}
								onClick={() => setSelected(2)}
							>
								Gallery
							</li>
							<li
								className={selected === 3 ? "selected" : ""}
								onClick={() => setSelected(3)}
							>
								Notice
							</li>
							<li
								className={selected === 4 ? "selected" : ""}
								onClick={() => setSelected(4)}
							>
								Winners
							</li>
						</ul>
					</nav>
					<main className="dashboard-content">
						{selected < contents.current.length
							? contents.current[selected]
							: "Maybe you are far off!"}
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
	const [notice, setNotice] = React.useState({ show: false, link: "", message: "" });
	const [loading, setLoading] = React.useState(true);
	const [saving, setSaving] = React.useState(false);

	React.useEffect(() => {
		fetch("/api/notice")
			.then(res => res.json())
			.then(data => {
				setNotice(data || { show: false, link: "", message: "" });
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setNotice(prev => ({
			...prev,
			[name]: type === "checkbox" ? checked : value
		}));
	};

	const handleSave = async (e) => {
		e.preventDefault();
		setSaving(true);
		const res = await fetch("/api/notice", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(notice),
		});
		setSaving(false);
		if (res.ok) {
			alert("Notice updated!");
		} else {
			alert("Failed to update notice.");
		}
	};

	if (loading) return <div>Loading notice...</div>;

	return (
		<div style={{
			background: "linear-gradient(90deg, #026C71 0%, #004457 100%)",
			color: "white",
			padding: "2rem",
			borderRadius: "12px",
			margin: "2rem 0",
			maxWidth: 500,
		}}>
			<h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "1rem" }}>Edit Notice</h2>
			<form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
				<label>
					<input
						type="checkbox"
						name="show"
						checked={notice.show}
						onChange={handleChange}
						style={{ marginRight: 8 }}
					/>
					Show Notice
				</label>
				<label>
					Link:
					<input
						type="text"
						name="link"
						value={notice.link}
						onChange={handleChange}
						required
						style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "none", marginTop: 4 }}
					/>
				</label>
				<label>
					Message:
					<input
						type="text"
						name="message"
						value={notice.message}
						onChange={handleChange}
						required
						style={{ width: "100%", padding: "0.5rem", borderRadius: 6, border: "none", marginTop: 4 }}
					/>
				</label>
				<button
					type="submit"
					disabled={saving}
					style={{
						background: "#36d1c4",
						color: "white",
						border: "none",
						borderRadius: 6,
						padding: "0.5rem 1.5rem",
						fontWeight: 600,
						cursor: saving ? "not-allowed" : "pointer",
						opacity: saving ? 0.7 : 1,
						marginTop: 8,
					}}
				>
					{saving ? "Saving..." : "Save Notice"}
				</button>
			</form>
		</div>
	);
}
async function convertToBase64(file) {
	const fileReader = new FileReader();
	return await new Promise((resolve, reject) => {
		fileReader.onload = () => resolve(fileReader.result);
		fileReader.onerror = reject;
		fileReader.readAsDataURL(file);
	});
}
function GallerySection({ fkthetoken }) {
	const [events, setEvents] = React.useState([]);
	const [selectedEvent, setSelectedEvent] = React.useState(null);
	const [newImages, setNewImages] = React.useState([]);
	const [loading, setLoading] = React.useState(false);
	const token = localStorage.getItem("token");
	// Fetch all gallery events
	const fetchEvents = async () => {
		try {
			const res = await fetch("/api/gallery/get", {
				headers: {
					authorization: "Bearer " + token,
				},
			});
			const data = await res.json();
			if (Array.isArray(data)) setEvents(data);
			else if (Array.isArray(data.data)) setEvents(data.data);
			else if (Array.isArray(data.galleries)) setEvents(data.galleries);
			else setEvents([]);
		} catch (err) {
			alert("Failed to fetch gallery events");
			setEvents([]);
		}
	};

	React.useEffect(() => {
		if (token) fetchEvents();
	}, [token]);

	// Select event handler
	const handleSelectEvent = (event) => {
		setSelectedEvent(event);
		setNewImages([]);
	};

	// Add new images to event
	const handleAddImages = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (!selectedEvent || newImages.length === 0) {
				alert("Select an event and add images");
				setLoading(false);
				return;
			}
			// Convert files to base64
			const base64Images = await Promise.all(
				Array.from(newImages).map(
					(file) =>
						new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result);
							reader.onerror = reject;
							reader.readAsDataURL(file);
						})
				)
			);
			const res = await fetch(`/api/gallery/patch/${selectedEvent._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer " + token,
				},
				body: JSON.stringify({ newImages: base64Images }),
			});
			if (!res.ok) throw new Error("Failed to add images");
			setNewImages([]);
			await fetchEvents();
			// Refresh selected event
			const updated = await res.json();
			setSelectedEvent(updated.data);
		} catch (err) {
			alert(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Delete all images (delete the event)
	const handleDeleteEvent = async () => {
		if (!selectedEvent) return;
		if (!confirm("Delete this entire event and all its images?")) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/gallery/delete/${selectedEvent._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer " + token,
				},
			});
			if (!res.ok) throw new Error("Failed to delete event");
			setSelectedEvent(null);
			await fetchEvents();
		} catch (err) {
			alert(err.message);
		} finally {
			setLoading(false);
		}
	};

	// Add new event
	const [newEventName, setNewEventName] = React.useState("");
	const [newEventImages, setNewEventImages] = React.useState([]);
	const handleAddEvent = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (!newEventName || newEventImages.length === 0) {
				alert("Event name and images required");
				setLoading(false);
				return;
			}
			const base64Images = await Promise.all(
				Array.from(newEventImages).map(
					(file) =>
						new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.onloadend = () => resolve(reader.result);
							reader.onerror = reject;
							reader.readAsDataURL(file);
						})
				)
			);
			console.log(token);
			const res = await fetch("/api/gallery/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					authorization: "Bearer " + token,
				},
				body: JSON.stringify({ eventName: newEventName, images: base64Images }),
			});
			if (!res.ok) throw new Error("Failed to add event");
			setNewEventName("");
			setNewEventImages([]);
			await fetchEvents();
		} catch (err) {
			console.log(token);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ padding: "2rem", color: "white" }}>
			<h2>Gallery Event Manager</h2>
			{/* Add new event */}
			<form onSubmit={handleAddEvent} style={{ marginBottom: "2rem", background: "#222", padding: "1rem", borderRadius: 8 }}>
				<input
					type="text"
					placeholder="New Event Name"
					value={newEventName}
					onChange={e => setNewEventName(e.target.value)}
					style={{ marginRight: 8 }}
					required
				/>
				<input
					type="file"
					accept="image/*"
					multiple
					onChange={e => setNewEventImages(e.target.files)}
					style={{ marginRight: 8 }}
					required
				/>
				<button type="submit" disabled={loading}>
					{loading ? "Adding..." : "Add Event"}
				</button>
			</form>

			{/* List of events */}
			<h3>Existing Events</h3>
			<ul style={{ marginBottom: "2rem" }}>
				{events.map(ev => (
					<li
						key={ev._id}
						style={{
							cursor: "pointer",
							fontWeight: selectedEvent && selectedEvent._id === ev._id ? "bold" : "normal",
							color: selectedEvent && selectedEvent._id === ev._id ? "#36d1c4" : "white",
							marginBottom: 6,
						}}
						onClick={() => handleSelectEvent(ev)}
					>
						{ev.eventName}
					</li>
				))}
			</ul>

			{/* Selected event details */}
			{selectedEvent && (
				<div style={{ background: "#222", padding: "1rem", borderRadius: 8 }}>
					<h4>{selectedEvent.eventName}</h4>
					<button
						onClick={handleDeleteEvent}
						style={{
							background: "#ff5252",
							color: "white",
							border: "none",
							borderRadius: 4,
							padding: "0.3rem 1rem",
							marginBottom: "1rem",
							cursor: "pointer",
						}}
						disabled={loading}
					>
						Delete Entire Event
					</button>
					<div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
						{selectedEvent.imageUrls.map((url, idx) => (
							<div key={idx} style={{ position: "relative" }}>
								<img
									src={url}
									alt={`Gallery ${idx}`}
									style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 6, background: "#111" }}
								/>
								<button
									onClick={async () => {
										if (!window.confirm("Delete this image?")) return;
										setLoading(true);
										try {
											const res = await fetch(`/api/gallery/patch/${selectedEvent._id}`, {
												method: "PATCH",
												headers: {
													"Content-Type": "application/json",
													authorization: "Bearer " + token,
												},
												body: JSON.stringify({ removeImageUrls: [url] }),
											});
											if (!res.ok) throw new Error("Failed to delete image");
											const updated = await res.json();
											setSelectedEvent(updated.data);
											await fetchEvents();
										} catch (err) {
											alert(err.message);
										} finally {
											setLoading(false);
										}
									}}
									style={{
										position: "absolute",
										top: 6,
										right: 6,
										background: "#ff5252",
										color: "white",
										border: "none",
										borderRadius: "50%",
										width: 28,
										height: 28,
										cursor: "pointer",
										fontWeight: "bold",
									}}
									title="Delete Image"
								>
									×
								</button>
							</div>
						))}
					</div>
					{/* Add images to event */}
					<form onSubmit={handleAddImages} style={{ marginTop: "1rem" }}>
						<input
							type="file"
							accept="image/*"
							multiple
							onChange={e => setNewImages(e.target.files)}
							style={{ marginRight: 8 }}
							required
						/>
						<button type="submit" disabled={loading}>
							{loading ? "Adding..." : "Add Images"}
						</button>
					</form>
				</div>
			)}
		</div>
	);
}
function MembersSection() {
	const obsPositions = ["Secretary", "Treasurer", "Joint Secretary"];
	const leadPositions = [
		"Dev Lead",
		"CP Lead",
		"Graphic Lead",
		"Social Media Head",
		"Content Lead",
		"Communication Lead",
	];

	const [members, setMembers] = React.useState([]);
	const [form, setForm] = React.useState({
		name: "",
		position: "",
		term: "",
		linkedinId: "",
		pfpImage: "",
	});
	const [loading, setLoading] = React.useState(false);

	const fetchMembers = async () => {
		try {
			const res = await fetch("/api/members/get");
			const data = await res.json();
			if (Array.isArray(data)) setMembers(data);
			else if (Array.isArray(data.members)) setMembers(data.members);
			else if (Array.isArray(data.data)) setMembers(data.data);
			else setMembers([]);
		} catch (err) {
			alert("Failed to fetch members");
			setMembers([]);
		}
	};

	React.useEffect(() => {
		fetchMembers();
	}, []);

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handlePhotoChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onloadend = () => {
			setForm((prev) => ({ ...prev, pfpImage: reader.result }));
		};
		reader.readAsDataURL(file);
	};

	const handleAddMember = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (!form.position) {
				alert("Please select a position");
				setLoading(false);
				return;
			}
			const res = await fetch("/api/members/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			if (!res.ok) throw new Error("Failed to add member");
			setForm({
				name: "",
				position: "",
				term: "",
				linkedinId: "",
				pfpImage: "",
			});
			await fetchMembers();
		} catch (err) {
			alert(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!confirm("Are you sure you want to delete this member?")) return;
		try {
			const res = await fetch("/api/members/delete", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});
			if (!res.ok) throw new Error("Failed to delete member");
			await fetchMembers();
		} catch (err) {
			alert(err.message);
		}
	};

	return (
		<div
			style={{
				padding: "2rem",
				minHeight: "100vh",
				background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
				backgroundSize: "cover",
				backgroundRepeat: "no-repeat",
				backgroundPosition: "center",
				backgroundAttachment: "fixed",
				color: "white",
			}}
		>
			<h2 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: "1.5rem" }}>
				Admin Panel - Manage Members
			</h2>

			<form
				onSubmit={handleAddMember}
				style={{
					marginBottom: "2.5rem",
					background: "rgba(30,40,60,0.85)",
					color: "white",
					padding: "1.5rem",
					borderRadius: "12px",
					boxShadow: "0 2px 12px #0003",
					display: "flex",
					flexWrap: "wrap",
					gap: "1rem",
					alignItems: "center",
				}}
			>
				<input
					name="name"
					placeholder="Name"
					value={form.name}
					onChange={handleChange}
					required
					style={{
						flex: "1 1 180px",
						padding: "0.5rem",
						borderRadius: 6,
						border: "none",
					}}
				/>

				<select
					name="position"
					value={form.position}
					onChange={handleChange}
					required
					style={{
						flex: "1 1 180px",
						padding: "0.5rem",
						borderRadius: 6,
						border: "none",
						color: "black",
					}}
				>
					<option value="">Select Position</option>
					<optgroup label="OBS Positions">
						{obsPositions.map((pos) => (
							<option key={pos} value={pos}>
								{pos}
							</option>
						))}
					</optgroup>
					<optgroup label="Lead Positions">
						{leadPositions.map((pos) => (
							<option key={pos} value={pos}>
								{pos}
							</option>
						))}
					</optgroup>
					<optgroup label="Regular Positions">
						<option value="Member">Member</option>
						<option value="Volunteer">Volunteer</option>
					</optgroup>
				</select>

				<input
					name="term"
					placeholder="Term"
					value={form.term}
					onChange={handleChange}
					required
					style={{
						flex: "1 1 120px",
						padding: "0.5rem",
						borderRadius: 6,
						border: "none",
					}}
				/>

				<input
					name="linkedinId"
					placeholder="LinkedIn ID"
					value={form.linkedinId}
					onChange={handleChange}
					style={{
						flex: "1 1 180px",
						padding: "0.5rem",
						borderRadius: 6,
						border: "none",
					}}
				/>

				<input
					type="file"
					accept="image/*"
					onChange={handlePhotoChange}
					style={{
						flex: "1 1 180px",
						padding: "0.5rem",
						borderRadius: 6,
						border: "none",
						background: "#222",
						color: "#fff",
					}}
				/>

				<button
					type="submit"
					disabled={loading}
					style={{
						background: "linear-gradient(90deg,#36d1c4,#5b86e5)",
						color: "white",
						border: "none",
						borderRadius: 6,
						padding: "0.5rem 1.5rem",
						fontWeight: 600,
						cursor: loading ? "not-allowed" : "pointer",
						opacity: loading ? 0.7 : 1,
					}}
				>
					{loading ? "Adding..." : "Add Member"}
				</button>
			</form>

			<h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Members List</h3>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
					gap: "1.5rem",
				}}
			>
				{members.map((m) => (
					<div
						key={m._id}
						style={{
							background: "rgba(30,40,60,0.85)",
							borderRadius: 12,
							boxShadow: "0 2px 12px #0003",
							padding: "1.2rem",
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							position: "relative",
						}}
					>
						<div
							style={{
								width: 70,
								height: 70,
								borderRadius: "50%",
								overflow: "hidden",
								marginBottom: 12,
								border: "2px solid #36d1c4",
								background: "#111",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							{m.pfpImage ? (
								<img
									src={m.pfpImage}
									alt={m.name}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
									}}
								/>
							) : (
								<span style={{ color: "#bbb", fontSize: 32 }}>
									{m.name?.[0] || "?"}
								</span>
							)}
						</div>
						<div style={{ textAlign: "center" }}>
							<strong style={{ fontSize: "1.1rem" }}>{m.name}</strong>
							<div style={{ color: "#36d1c4", margin: "2px 0" }}>
								{m.position}
							</div>
							<div style={{ fontSize: "0.95rem", color: "#bbb" }}>
								{m.term}
							</div>
							{m.linkedinId && (
								<div style={{ marginTop: 4 }}>
									<a
										href={`https://linkedin.com/in/${m.linkedinId}`}
										target="_blank"
										rel="noopener noreferrer"
										style={{
											color: "#5b86e5",
											textDecoration: "underline",
											fontSize: "0.95rem",
										}}
									>
										LinkedIn
									</a>
								</div>
							)}
						</div>
						<button
							onClick={() => handleDelete(m._id)}
							style={{
								color: "#fff",
								background: "#ff5252",
								border: "none",
								borderRadius: 6,
								padding: "0.4rem 1.2rem",
								marginTop: 16,
								fontWeight: 600,
								cursor: "pointer",
								transition: "background 0.2s",
							}}
						>
							Delete
						</button>
					</div>
				))}
				{members.length === 0 && (
					<div
						style={{
							color: "#bbb",
							textAlign: "center",
							gridColumn: "1/-1",
							marginTop: "2rem",
						}}
					>
						No members found.
					</div>
				)}
			</div>
		</div>
	);
}
function EventsSection() {
	const [selected, setSelected] = useState(0);
	const [events, setEvents] = useState();
	const [reloadEvents, setReloadEvents] = useState(false);
	const token = localStorage.getItem("token");
	useEffect(() => {
		fetch("/api/events/get")
			.then((data) => {
				if (data.status === 200) {
					return data.json();
				} else {
					return {};
				}
			})
			.then((data) => {
				if (data.data) setEvents(data.data);
			});
	}, [reloadEvents]);

	return (
		<div className="events-section">
			<nav>
				<ul>
					<li
						className={selected === 0 ? "selected" : ""}
						onClick={() => setSelected(0)}
					>
						Add
					</li>
					<li
						className={selected === 1 ? "selected" : ""}
						onClick={() => setSelected(1)}
					>
						Delete
					</li>
					<li
						className={selected === 2 ? "selected" : ""}
						onClick={() => setSelected(2)}
					>
						Edit
					</li>
				</ul>
			</nav>
			<div className="events-content">
				{selected === 0 ? (
					<AddEventsUI token={token} />
				) : selected === 1 ? (
					<DeleteEventsUI
						token={token}
						events={events}
						setReloadEvents={setReloadEvents}
					/>
				) : selected === 2 ? (
					<EditEventsUI
						token={token}
						events={events}
						setReloadEvents={setReloadEvents}
					/>
				) : (
					<></>
				)}
			</div>
		</div>
	);
}

function AddEventsUI({ token }) {
	const statusOptions = ["Completed", "Not Completed", "On Going", "Other", "Upcoming"];
	const typeOptions = ["CP", "DEV", "FUN", "Other"];
	const [imageFile, setImageFile] = useState("");
	const inputRef = useRef();
	const [loading, setLoading] = useState(1); // 0 = loading, 1 = all ok, 2 = success, 3 = failed,

	return (
		<form
			action="/api/events/add"
			method="post"
			onSubmit={async (e) => {
				console.log("Submitting!");
				if (!e.isTrusted) return;
				e.preventDefault();
				const values = Object.fromEntries(new FormData(e.target));
				console.log("formData:", values);
				if (!values.registrationOpen) {
					values.registrationOpen = false;
				} else {
					values.registrationOpen = true;
				}
				if (values.image) {
					const base64Image = await convertToBase64(imageFile);
					values.image = base64Image;
				}
				console.log("formData:", values);
				setLoading(0);
				fetch("/api/events/add", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						authorization: "Bearer " + token,
					},
					body: JSON.stringify(values),
				}).then((data) => {
					if (data.status < 300 && data.status > 199) {
						setLoading(2);
						setTimeout(() => setLoading(1), 1000);
					} else {
						setLoading(3);
						setTimeout(() => setLoading(1), 1000);
					}
				});
			}}
		>
			<h2>Add Event</h2>
			<div className="group">
				<label htmlFor="title">Title:</label>
				<input type="text" name="title" id="title" required />
			</div>
			<div className="group">
				<label htmlFor="description">Description:</label>
				<textarea name="description" id="description" required />
			</div>
			<div className="group">
				<label htmlFor="rules">Rules:</label>
				<textarea name="rules" id="rules" required />
			</div>
			<div className="group">
				<label htmlFor="date">Date:</label>
				<input required type="date" name="date" id="title" />
			</div>
			<div className="group">
				<label htmlFor="time">Time:</label>
				<input required type="time" name="time" id="title" />
			</div>
			<div className="group">
				<label htmlFor="location">Location:</label>
				<input required type="text" name="location" id="title" />
			</div>
			<div className="group">
				<label htmlFor="registration-open">Registration Open:</label>
				<input
					type="checkbox"
					name="registrationOpen"
					id="registration-open"
					title="yes"
				/>
			</div>
			<div className="group">
				<label htmlFor="more-details">More_Details:</label>
				<textarea name="more_details" id="more-details" required />
			</div>
			<div className="group">
				<label htmlFor="status">Status:</label>
				<input
					required
					list="statuses"
					name="status"
					id="status"
					pattern={statusOptions.join("|")}
				/>
				<datalist name="statuses" id="statuses">
					{statusOptions.map((ele, ind) => (
						<option value={ele} key={"status-" + ind} />
					))}
				</datalist>
			</div>
			<div className="group">
				<label htmlFor="type">Type:</label>
				<input
					required
					list="types"
					name="type"
					id="type"
					pattern={typeOptions.join("|")}
				/>
				<datalist id="types">
					{typeOptions.map((ele, ind) => (
						<option value={ele} key={"type-" + ind} />
					))}
				</datalist>
			</div>
			<div className="group">
				<label htmlFor="image">Image:</label>
				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					id="image"
					name="image"
					required
					onChange={(e) => {
						console.log(e.target.files);
						setImageFile(e.target.files[0]);
					}}
				/>
			</div>
			<div className="image-preview">
				{imageFile ? (
					<>
						<img
							src={URL.createObjectURL(imageFile)}
							alt="Uploaded Image"
						/>
						<button
							type="button"
							onClick={() => {
								setImageFile(null);
								inputRef.current.value = "";
							}}
						>
							<MdDelete />
						</button>
					</>
				) : (
					<></>
				)}
			</div>
			<button
				type="submit"
				style={
					loading === 2 || loading === 3
						? {
							backgroundColor:
								loading === 2 ? "green" : "red",
						}
						: {}
				}
			>
				{loading === 0 ? "Loading..." : "Add the event"}
			</button>
		</form>
	);
}

/**
 *
 * @param {MouseEvent} e
 * @param {string} eventId
 * @param {string} token
 * @returns {Promise<boolean>}
 */
async function onDeleteEvent(e, eventId, token) {
	if (!e.isTrusted) {
		return false;
	}

	const result = await fetch("/api/events/delete/" + eventId, {
		method: "delete",
		headers: {
			"Content-Type": "application/json",
			authorization: "Bearer " + token,
		},
	})
		.then((data) => {
			if (data.status === 200) {
				return true;
			} else {
				return false;
			}
		})
		.catch((err) => {
			if (process.env.NODE_ENV === "development")
				console.error("Error in onDeleteEvent function:", err);
			return false;
		});

	return result;
}

function DeleteEventsUI({ token, events, setReloadEvents }) {
	return (
		<>
			{!Array.isArray(events) ? (
				<div className="loading">Loading...</div>
			) : (
				<div className="cards-container">
					{events.map((ele, ind) => {
						const {
							_id,
							title,
							description,
							rules,
							date,
							location,
							registrationOpen,
							more_details,
							status,
							type,
							imageUrl,
						} = ele;
						const onDeleteClick = async (e) => {
							const deleted = await onDeleteEvent(e, _id, token);
							if (deleted) {
								setReloadEvents((prev) => !prev);
							}
						};
						return (
							<Card
								key={ind + _id + ind}
								onDeleteClick={onDeleteClick}
								imageUrl={imageUrl}
								title={title}
								date={date}
								status={status}
								type={type}
							/>
						);
					})}
				</div>
			)}
		</>
	);
}

function Card({
	onDeleteClick,
	imageUrl,
	title,
	date,
	status,
	type,
	editOrDelete,
}) {
	return (
		<div className="card">
			<div className="delete">
				<button className="delete-button" onClick={onDeleteClick}>
					{editOrDelete ? <IoIosCheckmarkCircle /> : <MdDelete />}
				</button>
			</div>
			<img src={imageUrl} alt="Event Image" />
			<div className="card-components">
				<h1>{title}</h1>
				<p>Date: {new Date(date).toLocaleString().split(",")[0]}</p>
				<p>Status: {status}</p>
				<p>Type: {type}</p>
			</div>
		</div>
	);
}

function EditEventsUI({ token, events, setReloadEvents }) {
	const [ticked, setTicked] = useState([{}, -1]);
	const statusOptions = ["Completed", "Not Completed", "On Going", "Other", "Upcoming"];
	const typeOptions = ["CP", "DEV", "FUN", "Other"];
	const [imageFile, setImageFile] = useState("");
	const inputRef = useRef();
	const [loading, setLoading] = useState(1); // 0 = loading, 1 = all ok, 2 = success, 3 = failed,

	return (
		<div className="edit-events-content">
			<div className="cards-container">
				{Array.isArray(events)
					? events.map((ele, ind) => {
						const {
							_id,
							title,
							description,
							rules,
							date,
							location,
							registrationOpen,
							more_details,
							status,
							type,
							imageUrl,
						} = ele;
						const onTickClick = (e, ind) => {
							if (!e.isTrusted) return;
							setTicked([ind < 0 ? {} : ele, ind]);
						};
						return (
							<div
								key={ind + _id + ind}
								className="edit-card-group"
							>
								<div
									className={
										ticked[1] === ind
											? "tick-confirm"
											: "tick-not-confirm"
									}
								>
									<button
										className="tick-confirm-button"
										onClick={(e) => onTickClick(e, -1)}
									>
										<IoIosCheckmarkCircle />
									</button>
								</div>
								<Card
									onDeleteClick={(e) =>
										onTickClick(e, ind)
									}
									imageUrl={imageUrl}
									title={title}
									date={date}
									status={status}
									type={type}
									editOrDelete={"edit"}
								/>
							</div>
						);
					})
					: "Loading..."}
			</div>
			<div className="edit-cards-form">
				{!ticked[0]._id ? (
					<div className="invalid-card">
						Please select a card to edit
					</div>
				) : (
					<form
						onSubmit={async (e) => {
							console.log("Submitting!");
							if (!e.isTrusted) return;
							e.preventDefault();
							const values = Object.fromEntries(
								new FormData(e.target)
							);
							// console.log("formData:", values);
							if (!values.registrationOpen) {
								values.registrationOpen = false;
							} else {
								values.registrationOpen = true;
							}
							if (values.image && values.image.name !== "") {
								const base64Image = await convertToBase64(
									imageFile
								);
								values.image = base64Image;
							} else {
								delete values.image;
								values.imageUrl = ticked[0].imageUrl;
							}
							// console.log("formData:", values);
							console.log(token);
							setLoading(0);
							fetch("/api/events/patch/" + ticked[0]._id, {
								method: "PATCH",
								headers: {
									"Content-Type": "application/json",
									authorization: "Bearer " + token,
								},
								body: JSON.stringify(values),
							}).then((data) => {
								if (data.status < 300 && data.status > 199) {
									setLoading(2);
									setTimeout(() => setLoading(1), 1000);
									setReloadEvents((prev) => !prev);
								} else {
									setLoading(3);
									setTimeout(() => setLoading(1), 1000);
								}
							});
						}}
					>
						<h2>Edit Event</h2>
						<div className="group">
							<label htmlFor="title">Title:</label>
							<input
								type="text"
								name="title"
								id="title"
								defaultValue={ticked[0].title}
								required
							/>
						</div>
						<div className="group">
							<label htmlFor="description">Description:</label>
							<textarea
								name="description"
								id="description"
								defaultValue={ticked[0].description}
								required
							/>
						</div>
						<div className="group">
							<label htmlFor="rules">Rules:</label>
							<textarea
								name="rules"
								id="rules"
								defaultValue={ticked[0].rules}
								required
							/>
						</div>
						<div className="group">
							<label htmlFor="date">Date:</label>
							<input
								required
								defaultValue={ticked[0].date.split("T")[0]}
								type="date"
								name="date"
								id="title"
							/>
						</div>
						<div className="group">
							<label htmlFor="time">Time:</label>
							<input
								required
								defaultValue={ticked[0].time}
								type="time"
								name="time"
								id="title"
							/>
						</div>
						<div className="group">
							<label htmlFor="location">Location:</label>
							<input
								required
								defaultValue={ticked[0].location}
								type="text"
								name="location"
								id="title"
							/>
						</div>
						<div className="group">
							<label htmlFor="registration-open">
								Registration Open:
							</label>
							<input
								defaultChecked={ticked[0].registrationOpen}
								type="checkbox"
								name="registrationOpen"
								id="registration-open"
								title="yes"
							/>
						</div>
						<div className="group">
							<label htmlFor="more-details">More_Details:</label>
							<textarea
								name="more_details"
								id="more-details"
								required
								defaultValue={ticked[0].more_details}
							/>
						</div>
						<div className="group">
							<label htmlFor="status">Status:</label>
							<input
								required
								list="statuses"
								name="status"
								id="status"
								pattern={statusOptions.join("|")}
								defaultValue={ticked[0].status}
							/>
							<datalist name="statuses" id="statuses">
								{statusOptions.map((ele, ind) => (
									<option value={ele} key={"status-" + ind} />
								))}
							</datalist>
						</div>
						<div className="group">
							<label htmlFor="type">Type:</label>
							<input
								required
								list="types"
								name="type"
								id="type"
								pattern={typeOptions.join("|")}
								defaultValue={ticked[0].type}
							/>
							<datalist id="types">
								{typeOptions.map((ele, ind) => (
									<option value={ele} key={"type-" + ind} />
								))}
							</datalist>
						</div>
						<div className="group">
							<label htmlFor="image">Image:</label>
							<input
								ref={inputRef}
								type="file"
								accept="image/*"
								id="image"
								name="image"
								onChange={(e) => {
									console.log(e.target.files);
									setImageFile(e.target.files[0]);
								}}
							/>
						</div>
						<div className="image-preview">
							{imageFile || ticked[0].imageUrl ? (
								<>
									<img
										src={
											imageFile
												? URL.createObjectURL(imageFile)
												: ticked[0].imageUrl
										}
										alt="Uploaded Image"
									/>
									<button
										type="button"
										onClick={() => {
											setImageFile(null);
											inputRef.current.value = "";
										}}
									>
										<MdDelete />
									</button>
								</>
							) : (
								<></>
							)}
						</div>
						<button
							type="submit"
							style={
								loading === 2 || loading === 3
									? {
										backgroundColor:
											loading === 2 ? "green" : "red",
									}
									: {}
							}
						>
							{loading === 0 ? "Loading..." : "Edit the event"}
						</button>
					</form>
				)}
			</div>
		</div>
	);
}
