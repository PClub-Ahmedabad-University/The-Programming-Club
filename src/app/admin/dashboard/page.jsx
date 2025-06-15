"use client";

import React, { useEffect, useRef, useState } from "react";
import "@/app/Styles/AdminNavbar.css";
import { MdDelete, MdEdit } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { MdAdd } from "react-icons/md";
import { FaTrophy } from "react-icons/fa";
import WinnersSection from "./WinnersSection";
import GetParticipantsSection from "./GetParticipantsSection";
import MembersSection from "./MembersSection";

export default function page() {
	const [selected, setSelected] = useState(0);
	const [userToken, setUserToken] = useState("");
	const [showUI, setShowUI] = useState(1);
	const [loading, setLoading] = useState(false);
	const contents = useRef([
		<EventsSection />,
		<MembersSection />,
		<GallerySection token={userToken} />,
		<NoticeSection />,
		<WinnersSection token={userToken} />,
		<GetParticipantsSection />,
	]);
	useEffect(() => {
		if (localStorage.getItem("token")) {
			(async () => {
				await fetch("/api/auth/validate", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						authorization: "Bearer " + localStorage.getItem("token"),
					},
				})
					.then((data) => {
						if (data.status === 200) {
							setShowUI(2);
							setUserToken(localStorage.getItem("token"));
						} else {
							setShowUI(0);
						}
					})
					.catch((err) => {
						setShowUI(0);
					});
			})();
		} else {
			setShowUI(0);
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
							<li
								className={selected === 5 ? "selected" : ""}
								onClick={() => setSelected(5)}
							>
								Get Participants
							</li>
						</ul>
					</nav>
					<main className="dashboard-content">
						{selected === 0 && <EventsSection token={userToken} />}
						{selected === 1 && <MembersSection />}
						{selected === 2 && <GallerySection token={userToken} />}
						{selected === 3 && <NoticeSection />}
						{selected === 4 && <WinnersSection token={userToken} />}
						{selected === 5 && <GetParticipantsSection />}
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
		setLoading(true);
		fetch("/api/notice")
			.then((res) => res.json())
			.then((data) => {
				setNotice(data || { show: false, link: "", message: "" });
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const handleChange = (e) => {
		setLoading(true);
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
		<div
			style={{
				background: "linear-gradient(90deg, #026C71 0%, #004457 100%)",
				color: "white",
				padding: "2rem",
				borderRadius: "12px",
				margin: "2rem 0",
				maxWidth: 500,
			}}
		>
			<h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "1rem" }}>
				Edit Notice
			</h2>
			<form
				onSubmit={handleSave}
				style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
			>
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
						style={{
							width: "100%",
							padding: "0.5rem",
							borderRadius: 6,
							border: "none",
							marginTop: 4,
						}}
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
						style={{
							width: "100%",
							padding: "0.5rem",
							borderRadius: 6,
							border: "none",
							marginTop: 4,
						}}
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
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ padding: "2rem", color: "white" }}>
			<h2>Gallery Event Manager</h2>
			{/* Add new event */}
			<form
				onSubmit={handleAddEvent}
				style={{
					marginBottom: "2rem",
					background: "#222",
					padding: "1rem",
					borderRadius: 8,
				}}
			>
				<input
					type="text"
					placeholder="New Event Name"
					value={newEventName}
					onChange={(e) => setNewEventName(e.target.value)}
					style={{ marginRight: 8 }}
					required
				/>
				<input
					type="file"
					accept="image/*"
					multiple
					onChange={(e) => setNewEventImages(e.target.files)}
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
				{events.map((ev) => (
					<li
						key={ev._id}
						style={{
							cursor: "pointer",
							fontWeight:
								selectedEvent && selectedEvent._id === ev._id ? "bold" : "normal",
							color:
								selectedEvent && selectedEvent._id === ev._id ? "#36d1c4" : "white",
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
					<div
						style={{
							display: "flex",
							flexWrap: "wrap",
							gap: "1rem",
							marginBottom: "1rem",
						}}
					>
						{selectedEvent.imageUrls.map((url, idx) => (
							<div key={idx} style={{ position: "relative" }}>
								<img
									src={url}
									alt={`Gallery ${idx}`}
									style={{
										width: 160,
										height: 120,
										objectFit: "cover",
										borderRadius: 6,
										background: "#111",
									}}
								/>
								<button
									onClick={async () => {
										if (!window.confirm("Delete this image?")) return;
										setLoading(true);
										try {
											const res = await fetch(
												`/api/gallery/patch/${selectedEvent._id}`,
												{
													method: "PATCH",
													headers: {
														"Content-Type": "application/json",
														authorization: "Bearer " + token,
													},
													body: JSON.stringify({
														removeImageUrls: [url],
													}),
												}
											);
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
							onChange={(e) => setNewImages(e.target.files)}
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

<MembersSection />;
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
					<li className={selected === 0 ? "selected" : ""} onClick={() => setSelected(0)}>
						Add
					</li>
					<li className={selected === 1 ? "selected" : ""} onClick={() => setSelected(1)}>
						Delete
					</li>
					<li className={selected === 2 ? "selected" : ""} onClick={() => setSelected(2)}>
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
					<EditEventsUI token={token} events={events} setReloadEvents={setReloadEvents} />
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
				if (!e.isTrusted) return;
				e.preventDefault();
				const values = Object.fromEntries(new FormData(e.target));
				if (!values.registrationOpen) {
					values.registrationOpen = false;
				} else {
					values.registrationOpen = true;
				}
				if (values.image) {
					const base64Image = await convertToBase64(imageFile);
					values.image = base64Image;
				}
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
				<label htmlFor="duration">Duration (hours):</label>
				<input required type="time" name="duration" id="title" />
			</div>

			<div className="group">
				<label htmlFor="capacity">Capacity:</label>
				<input required type="number" name="capacity" id="title" />
			</div>
			<div className="group">
				<label htmlFor="location">Location:</label>
				<input required type="text" name="location" id="title" />
			</div>
			<div className="group">
				<label htmlFor="form-link">Form Link:</label>
				<input type="text" name="formLink" id="form-link" />
			</div>
			<div className="group">
				<label htmlFor="registration-open">Registration Open:</label>
				<input type="checkbox" name="registrationOpen" id="registration-open" title="yes" />
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
					className="bg-gray-800 px-7 py-12 rounded-md text-center"
					accept="image/*"
					id="image"
					name="image"
					required
					onChange={(e) => setImageFile(e.target.files[0])}
				/>
			</div>
			<div className="image-preview">
				{imageFile ? (
					<>
						<img src={URL.createObjectURL(imageFile)} alt="Uploaded Image" />
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
								backgroundColor: loading === 2 ? "green" : "red",
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

function Card({ onDeleteClick, imageUrl, title, date, status, type, editOrDelete }) {
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
	const statusOptions = ["completed", "not-completed", "ongoing"];
	const typeOptions = ["CP", "DEV", "FUN"];
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
								formLink,
							} = ele;
							const onTickClick = (e, ind) => {
								if (!e.isTrusted) return;
								setTicked([ind < 0 ? {} : ele, ind]);
							};
							return (
								<div key={ind + _id + ind} className="edit-card-group">
									<div
										className={
											ticked[1] === ind ? "tick-confirm" : "tick-not-confirm"
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
										onDeleteClick={(e) => onTickClick(e, ind)}
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
					<div className="invalid-card">Please select a card to edit</div>
				) : (
					<form
						onSubmit={async (e) => {
							if (!e.isTrusted) return;
							e.preventDefault();
							const values = Object.fromEntries(new FormData(e.target));
							if (!values.registrationOpen) {
								values.registrationOpen = false;
							} else {
								values.registrationOpen = true;
							}
							if (values.image && values.image.name !== "") {
								const base64Image = await convertToBase64(imageFile);
								values.image = base64Image;
							} else {
								delete values.image;
								values.imageUrl = ticked[0].imageUrl;
							}
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
							<label htmlFor="more-details">More Details:</label>
							<textarea
								name="more_details"
								id="more-details"
								defaultValue={ticked[0].more_details}
								required
							/>
						</div>
						<div className="group">
							<label htmlFor="status">Status:</label>
							<input
								required
								list="statuses"
								name="status"
								id="status"
								defaultValue={ticked[0].status}
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
								defaultValue={ticked[0].type}
								pattern={typeOptions.join("|")}
							/>
							<datalist id="types">
								{typeOptions.map((ele, ind) => (
									<option value={ele} key={"type-" + ind} />
								))}
							</datalist>
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
								id="date"
							/>
						</div>
						<div className="group">
							<label htmlFor="time">Time:</label>
							<input
								required
								defaultValue={ticked[0].time}
								type="time"
								name="time"
								id="time"
							/>
						</div>
						<div className="group">
							<label htmlFor="location">Location:</label>
							<input
								required
								defaultValue={ticked[0].location}
								type="text"
								name="location"
								id="location"
							/>
						</div>
						<div className="group">
							<label htmlFor="duration">Duration:</label>
							<input
								defaultValue={ticked[0].duration}
								type="time"
								name="duration"
								id="duration"
							/>
						</div>
						<div className="group">
							<label htmlFor="capacity">Capacity:</label>
							<input
								defaultValue={ticked[0].capacity}
								type="number"
								name="capacity"
								id="capacity"
							/>
						</div>
						<div className="group">
							<label htmlFor="form-link">Google Form Link:</label>
							<input
								defaultValue={ticked[0].formLink ?? ""}
								type="text"
								name="formLink"
								id="form-link"
							/>
						</div>
						<div className="group">
							<label htmlFor="registration-open">Registration Open:</label>
							<input
								type="checkbox"
								name="registrationOpen"
								id="registration-open"
								defaultChecked={ticked[0].registrationOpen}
							/>
						</div>
						<div className="group">
							<label htmlFor="image">Image:</label>
							<input
								ref={inputRef}
								type="file"
								accept="image/*"
								id="image"
								name="image"
								onChange={(e) => setImageFile(e.target.files[0])}
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
											backgroundColor: loading === 2 ? "green" : "red",
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
