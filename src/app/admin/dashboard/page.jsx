"use client";

import React, { useEffect, useRef, useState } from "react";
import "@/app/Styles/AdminNavbar.css";
import { MdDelete } from "react-icons/md";
import { IoIosCheckmarkCircle } from "react-icons/io";

export default function page() {
	const [selected, setSelected] = useState(0);
	const [userToken, setUserToken] = useState(
		process.env.NODE_ENV === "development"
			? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjM0NTYsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTA1MjY4OX0.ZseUkpPfIXL_eud2mzxgbvheoLEPZN0hv6kOBLPneb0"
			: ""
	);
	const [showUI, setShowUI] = useState(1);
	const contents = useRef([<EventsSection token={userToken} />, <></>]);

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
								Events
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

async function convertToBase64(file) {
	const fileReader = new FileReader();
	return await new Promise((resolve, reject) => {
		fileReader.onload = () => resolve(fileReader.result);
		fileReader.onerror = reject;
		fileReader.readAsDataURL(file);
	});
}

function EventsSection({ token }) {
	const [selected, setSelected] = useState(0);
	const [events, setEvents] = useState();
	const [reloadEvents, setReloadEvents] = useState(false);

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
	const statusOptions = ["Complete", "Not Complete", "On Going", "Other"];
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
	const statusOptions = ["Complete", "Not Complete", "On Going", "Other"];
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
							console.log("formData:", values);
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
							console.log("formData:", values);
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
