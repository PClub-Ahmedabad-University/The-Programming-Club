"use client";

import React, { useEffect, useState } from "react";
import { FaTrophy, FaCamera, FaPlus } from "react-icons/fa";
import { MdDelete, MdEdit, MdClose } from "react-icons/md";
import Loader from "@/ui-components/LoaderAdmin";

const WinnersSection = () => {
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
		fetchEvents();
	}, []);

	useEffect(() => {
		if (selectedEvent) {
			fetchWinners(selectedEvent._id);
		}
	}, [selectedEvent]);

	const fetchEvents = async () => {
		try {
			const response = await fetch("/api/events/get");
			const data = await response.json();
			setEvents(data.data);
			setLoading(false);
		} catch (error) {
			setLoading(false);
		}
	};

	const fetchWinners = async (eventId) => {
		try {
			const response = await fetch(`/api/events/winners/get/${eventId}`);
			const data = await response.json();
			if (data.success) {
				setWinners(data.event.winners || []);
			} else {
				setWinners([]);
			}
		} catch (error) {
			setWinners([]);
		}
	};

	const handleAddWinner = async (e) => {
		e.preventDefault();

		if (!formData.name) {
			alert("Please enter a name for the winner");
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
					reader.onerror = (error) => reject(error);
				});
				winnerData.image = base64Image;
			}

			const response = await fetch("/api/events/winners/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					eventTitle: selectedEvent.title,
					eventWinners: [winnerData],
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `Failed to add winner (${response.status})`);
			}

			if (!data.success) {
				throw new Error(data.message || "Failed to add winner");
			}

			setFormData({
				name: "",
				description: "",
				image: null,
				imagePreview: "",
			});
			setShowAddWinner(false);

			await fetchWinners(selectedEvent._id);

			alert("Winner added successfully!");
		} catch (error) {
			alert(error.message || "Failed to add winner");
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteWinner = async (winnerId) => {
		if (!window.confirm("Are you sure you want to delete this winner?")) return;

		try {
			setLoading(true);
			const response = await fetch(
				`/api/events/winners/delete?eventId=${selectedEvent._id}&winnerId=${winnerId}`,
				{
					method: "DELETE",
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to delete winner");
			}

			fetchWinners(selectedEvent._id);
			alert("Winner deleted successfully");
		} catch (error) {
			alert(error.message || "Failed to delete winner");
		} finally {
			setLoading(false);
		}
	};

	const handleEditWinner = async (e) => {
		e.preventDefault();

		if (!formData.name) {
			alert("Please enter a name for the winner");
			return;
		}

		try {
			setLoading(true);

			const updateData = {
				name: formData.name,
				description: formData.description || "",
			};

			if (formData.image && formData.image !== editingWinner.image) {
				const base64Image = await new Promise((resolve, reject) => {
					const reader = new FileReader();
					reader.readAsDataURL(formData.image);
					reader.onload = () => resolve(reader.result);
					reader.onerror = (error) => reject(error);
				});
				updateData.image = base64Image;
			} else if (formData.image === null && editingWinner.image) {
				updateData.image = "";
			}

			const response = await fetch("/api/events/winners/put", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					eventId: selectedEvent._id,
					winnerId: editingWinner._id,
					updateData,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || `Failed to update winner (${response.status})`);
			}

			if (!data.success) {
				throw new Error(data.message || "Failed to update winner");
			}

			setFormData({
				name: "",
				description: "",
				image: null,
				imagePreview: "",
			});
			setEditingWinner(null);

			await fetchWinners(selectedEvent._id);

			alert("Winner updated successfully!");
		} catch (error) {
			alert(error.message || "Failed to update winner");
			alert(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData((prev) => ({ ...prev, image: file }));
			setImagePreview(URL.createObjectURL(file));
		}
	};

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const file = e.dataTransfer.files[0];
			if (file.type.startsWith("image/")) {
				setFormData((prev) => ({ ...prev, image: file }));
				setImagePreview(URL.createObjectURL(file));
			}
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

	const getInitials = (name) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	if (loading) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center z-50">
				<Loader />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-white mb-4">🏆 Winners Management</h1>
					<p className="text-slate-300 text-lg">
						Manage and showcase your event champions
					</p>
				</div>

				{/* Event Selector */}
				<div className="mb-12">
					<h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
						<FaTrophy className="mr-3 text-yellow-400" />
						Select Event
					</h2>
					<div className="flex flex-wrap gap-3">
						{events.map((event, index) => (
							<button
								key={event._id}
								className={`
                  relative px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105
                  ${
						selectedEvent?._id === event._id
							? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/50"
							: "bg-white/10 backdrop-blur-sm text-slate-300 hover:bg-white/20 hover:text-white border border-white/20"
					}
                `}
								onClick={() => setSelectedEvent(event)}
							>
								{event.title}
								{selectedEvent?._id === event._id && (
									<div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-20 animate-pulse"></div>
								)}
							</button>
						))}
					</div>
				</div>

				{/* Winners Section */}
				{selectedEvent && (
					<div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
						<div className="flex justify-between items-center mb-8">
							<h2 className="text-3xl font-bold text-white flex items-center">
								<span className="mr-3">🎉</span>
								Winners - {selectedEvent.title}
							</h2>
							<button
								className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 flex items-center space-x-2"
								onClick={() => {
									setShowAddWinner(true);
									setEditingWinner(null);
									setFormData({ name: "", description: "", image: null });
									setImagePreview("");
								}}
							>
								<FaPlus className="text-sm" />
								<span>Add Winner</span>
							</button>
						</div>

						{winners.length === 0 ? (
							<div className="text-center py-16">
								<div className="bg-white/5 rounded-3xl p-12 inline-block">
									<FaTrophy className="text-6xl text-yellow-400/50 mx-auto mb-6" />
									<h3 className="text-2xl font-semibold text-white mb-3">
										No Winners Yet
									</h3>
									<p className="text-slate-400 text-lg">
										Add the first winner to get started!
									</p>
								</div>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
								{winners.map((winner) => (
									<div
										key={winner._id}
										className="group bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
									>
										<div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center overflow-hidden">
											{winner.image ? (
												<img
													src={winner.image.replace(/\.(heic|heif)(\?.*)?$/i, ".jpg$2")}
													alt={winner.name}
													className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
												/>
											) : (
												<div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
													{getInitials(winner.name)}
												</div>
											)}
											<div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center">
												<FaTrophy className="mr-1" />
												Winner
											</div>
										</div>

										<div className="p-6">
											<h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
												{winner.name}
											</h3>
											{winner.description && (
												<p className="text-slate-300 text-sm leading-relaxed mb-4">
													{winner.description}
												</p>
											)}

											<div className="flex space-x-2">
												<button
													className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 border border-blue-500/30 px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1"
													onClick={() => startEditing(winner)}
												>
													<MdEdit className="text-sm" />
													<span className="text-xs font-medium">
														Edit
													</span>
												</button>
												<button
													className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-center space-x-1"
													onClick={() => handleDeleteWinner(winner._id)}
												>
													<MdDelete className="text-sm" />
													<span className="text-xs font-medium">
														Delete
													</span>
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Modal */}
				{showAddWinner && selectedEvent && (
					<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
						<div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-white/20 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
							<div className="p-8">
								<div className="flex justify-between items-center mb-8">
									<h2 className="text-2xl font-bold text-white">
										{editingWinner ? "✏️ Edit Winner" : "🌟 Add New Winner"}
									</h2>
									<button
										onClick={() => setShowAddWinner(false)}
										className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
									>
										<MdClose className="text-xl" />
									</button>
								</div>

								<form
									onSubmit={editingWinner ? handleEditWinner : handleAddWinner}
									className="space-y-6"
								>
									<div>
										<label className="block text-sm font-semibold text-slate-200 mb-3">
											Winner Name *
										</label>
										<input
											type="text"
											value={formData.name}
											onChange={(e) =>
												setFormData({ ...formData, name: e.target.value })
											}
											className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
											placeholder="Enter winner's name"
											required
										/>
									</div>

									<div>
										<label className="block text-sm font-semibold text-slate-200 mb-3">
											Winner Photo
										</label>
										<div
											className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
												dragActive
													? "border-cyan-400 bg-cyan-500/10"
													: "border-slate-600 hover:border-slate-500 bg-slate-700/30"
											}`}
											onDragEnter={handleDrag}
											onDragLeave={handleDrag}
											onDragOver={handleDrag}
											onDrop={handleDrop}
										>
											<input
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
											/>

											{imagePreview ? (
												<div className="text-center">
													<img
														src={imagePreview.replace(/\.(heic|heif)(\?.*)?$/i, ".jpg$2")}
														alt="Preview"
														className="w-24 h-24 object-cover rounded-xl mx-auto mb-3 border-2 border-white/20"
													/>
													<p className="text-sm text-slate-300">
														Click or drag to replace
													</p>
												</div>
											) : (
												<div className="text-center">
													<div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
														<FaCamera className="text-white text-xl" />
													</div>
													<p className="text-slate-300 font-medium mb-1">
														Upload Photo
													</p>
													<p className="text-sm text-slate-400">
														Drag & drop or click to browse
													</p>
												</div>
											)}
										</div>
									</div>

									<div>
										<label className="block text-sm font-semibold text-slate-200 mb-3">
											Description (Optional)
										</label>
										<textarea
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											rows="3"
											className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
											placeholder="Add a brief description about the winner..."
										/>
									</div>

									<div className="flex space-x-4 pt-4">
										<button
											type="button"
											onClick={() => setShowAddWinner(false)}
											className="flex-1 px-6 py-3 bg-slate-600/50 hover:bg-slate-600/70 text-slate-200 rounded-xl font-semibold transition-all duration-200 border border-slate-500/50"
										>
											Cancel
										</button>
										<button
											type="submit"
											className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-purple-500/25"
										>
											{editingWinner ? "Update Winner" : "Add Winner"}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default WinnersSection;
