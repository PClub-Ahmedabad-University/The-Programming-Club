"use client";

import React, { useEffect, useState } from "react";
import { FaTrophy, FaCamera, FaPlus } from "react-icons/fa";
import { MdDelete, MdEdit, MdClose } from "react-icons/md";
import Loader from "@/ui-components/LoaderAdmin";
import { useUser } from "@/lib/UserContext";

const WinnersSection = () => {

	const { token } = useUser();

	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [winners, setWinners] = useState([]);
	const [showAddWinner, setShowAddWinner] = useState(false);
	const [editingWinner, setEditingWinner] = useState(null);

	const [formData, setFormData] = useState({
		name: "",
		description: "",
		image: null,
	});

	const [imagePreview, setImagePreview] = useState("");
	const [dragActive, setDragActive] = useState(false);

	useEffect(() => {
		if (token) fetchEvents();
	}, [token]);

	useEffect(() => {
		if (selectedEvent) fetchWinners(selectedEvent._id);
	}, [selectedEvent]);

	const fetchEvents = async () => {

		try {

			const response = await fetch("/api/events/get", {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			setEvents(data.data || []);

		} catch {
			setEvents([]);
		}
	};

	const fetchWinners = async (eventId) => {

		try {

			const response = await fetch(`/api/events/winners/get/${eventId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			const data = await response.json();

			if (data.success) setWinners(data.event.winners || []);
			else setWinners([]);

		} catch {
			setWinners([]);
		}
	};

	const handleAddWinner = async (e) => {

		e.preventDefault();

		if (!formData.name) {
			alert("Please enter winner name");
			return;
		}

		try {

			setLoading(true);

			const winnerData = {
				name: formData.name,
				description: formData.description || "",
				position: 1,
			};

			if (formData.image) {

				const base64Image = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.readAsDataURL(formData.image);
					reader.onload = () => resolve(reader.result);
					reader.onerror = reject;
				});

				winnerData.image = base64Image;
			}

			const response = await fetch("/api/events/winners/add", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					eventTitle: selectedEvent.title,
					eventWinners: [winnerData],
				}),
			});

			const data = await response.json();

			if (!data.success) throw new Error(data.message);

			setFormData({ name: "", description: "", image: null });
			setImagePreview("");
			setShowAddWinner(false);

			await fetchWinners(selectedEvent._id);

			alert("Winner added");

		} catch (err) {
			alert(err.message || "Failed to add winner");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteWinner = async (winnerId) => {

		if (!confirm("Delete winner?")) return;

		try {

			setLoading(true);

			const response = await fetch(
				`/api/events/winners/delete?eventId=${selectedEvent._id}&winnerId=${winnerId}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			const data = await response.json();

			if (!data.success) throw new Error();

			fetchWinners(selectedEvent._id);

		} catch {
			alert("Failed to delete winner");
		} finally {
			setLoading(false);
		}
	};

	const handleEditWinner = async (e) => {

		e.preventDefault();

		if (!formData.name) {
			alert("Enter winner name");
			return;
		}

		try {

			setLoading(true);

			const updateData = {
				name: formData.name,
				description: formData.description || "",
			};

			if (formData.image) {

				const base64Image = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.readAsDataURL(formData.image);
					reader.onload = () => resolve(reader.result);
					reader.onerror = reject;
				});

				updateData.image = base64Image;
			}

			const response = await fetch("/api/events/winners/put", {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					eventId: selectedEvent._id,
					winnerId: editingWinner._id,
					updateData,
				}),
			});

			const data = await response.json();

			if (!data.success) throw new Error();

			setEditingWinner(null);
			setShowAddWinner(false);

			await fetchWinners(selectedEvent._id);

		} catch {
			alert("Failed to update winner");
		} finally {
			setLoading(false);
		}
	};

	const handleImageChange = (e) => {

		const file = e.target.files[0];

		if (file) {
			setFormData(prev => ({ ...prev, image: file }));
			setImagePreview(URL.createObjectURL(file));
		}
	};

	const startEditing = (winner) => {

		setEditingWinner(winner);

		setFormData({
			name: winner.name,
			description: winner.description || "",
			image: null,
		});

		setImagePreview(winner.image || "");

		setShowAddWinner(true);
	};

	const getInitials = (name) =>
		name
			.split(" ")
			.map(n => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);

	if (loading) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
				<Loader />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-slate-900 p-6">

			<h1 className="text-3xl text-white mb-8 text-center">
				Winners Management
			</h1>

			<div className="flex flex-wrap gap-3 mb-10 justify-center">

				{events.map(event => (
					<button
						key={event._id}
						className={`px-4 py-2 rounded ${
							selectedEvent?._id === event._id
								? "bg-purple-600 text-white"
								: "bg-gray-700 text-gray-200"
						}`}
						onClick={() => setSelectedEvent(event)}
					>
						{event.title}
					</button>
				))}

			</div>

			{selectedEvent && (
				<div className="max-w-6xl mx-auto">

					<div className="flex justify-between mb-6">

						<h2 className="text-white text-xl">
							Winners - {selectedEvent.title}
						</h2>

						<button
							onClick={() => {
								setShowAddWinner(true);
								setEditingWinner(null);
								setFormData({ name: "", description: "", image: null });
								setImagePreview("");
							}}
							className="bg-blue-600 px-4 py-2 rounded text-white"
						>
							Add Winner
						</button>

					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

						{winners.map(winner => (

							<div key={winner._id} className="bg-gray-800 rounded-lg p-4">

								<div className="h-40 flex items-center justify-center bg-gray-700 mb-4">

									{winner.image ? (
										<img
											src={winner.image}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="text-white text-2xl">
											{getInitials(winner.name)}
										</div>
									)}

								</div>

								<h3 className="text-white font-semibold mb-2">
									{winner.name}
								</h3>

								<p className="text-gray-400 text-sm mb-4">
									{winner.description}
								</p>

								<div className="flex gap-2">

									<button
										onClick={() => startEditing(winner)}
										className="bg-blue-600 px-3 py-1 rounded text-white"
									>
										<MdEdit />
									</button>

									<button
										onClick={() => handleDeleteWinner(winner._id)}
										className="bg-red-600 px-3 py-1 rounded text-white"
									>
										<MdDelete />
									</button>

								</div>

							</div>

						))}

					</div>

				</div>
			)}

		</div>
	);
};

export default WinnersSection;