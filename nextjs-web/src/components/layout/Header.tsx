"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useTaskStore } from "@/store/tasks";
import {
	Bell,
	Search,
	User,
	LogOut,
	Settings,
	X,
	CheckCircle,
	Clock,
	AlertTriangle,
} from "lucide-react";
import { weatherApi } from "@/lib/api/weather";
import { WeatherData } from "@/types";
import toast from "react-hot-toast";

export default function Header() {
	const { user, logout } = useAuthStore();
	const { tasks } = useTaskStore();
	const router = useRouter();
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [showUserMenu, setShowUserMenu] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<any[]>([]);
	const [showSearchResults, setShowSearchResults] = useState(false);
	const searchRef = useRef<HTMLDivElement>(null);
	const userMenuRef = useRef<HTMLDivElement>(null);
	const notificationRef = useRef<HTMLDivElement>(null);

	// Fetch weather data
	useEffect(() => {
		const fetchWeather = async () => {
			try {
				const response = await weatherApi.getWeather("Jakarta");
				setWeather(response.data);
			} catch (error) {
				console.error("Failed to fetch weather:", error);
			}
		};

		fetchWeather();
		// Refresh weather every 30 minutes
		const interval = setInterval(fetchWeather, 30 * 60 * 1000);
		return () => clearInterval(interval);
	}, []);

	// Search functionality
	useEffect(() => {
		if (searchQuery.trim()) {
			const filtered = tasks
				.filter(
					(task) =>
						task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
						task.description
							?.toLowerCase()
							.includes(searchQuery.toLowerCase()) ||
						task.category?.name
							.toLowerCase()
							.includes(searchQuery.toLowerCase())
				)
				.slice(0, 5);
			setSearchResults(filtered);
			setShowSearchResults(true);
		} else {
			setSearchResults([]);
			setShowSearchResults(false);
		}
	}, [searchQuery, tasks]);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setShowSearchResults(false);
			}
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setShowUserMenu(false);
			}
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target as Node)
			) {
				setShowNotifications(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Calculate notifications
	const getNotifications = () => {
		const today = new Date();
		const notifications = [];

		// Overdue tasks
		const overdueTasks = tasks.filter((task) => {
			if (!task.deadline || task.status === "done") return false;
			return new Date(task.deadline) < today;
		});

		if (overdueTasks.length > 0) {
			notifications.push({
				id: "overdue",
				type: "error",
				title: `${overdueTasks.length} Overdue Task${
					overdueTasks.length > 1 ? "s" : ""
				}`,
				message: `You have ${overdueTasks.length} task${
					overdueTasks.length > 1 ? "s" : ""
				} past their deadline`,
				icon: AlertTriangle,
				color: "text-red-600",
				bg: "bg-red-50",
				time: "Now",
			});
		}

		// Tasks due soon (within 24 hours)
		const dueSoonTasks = tasks.filter((task) => {
			if (!task.deadline || task.status === "done") return false;
			const deadline = new Date(task.deadline);
			const timeDiff = deadline.getTime() - today.getTime();
			const hoursDiff = timeDiff / (1000 * 3600);
			return hoursDiff > 0 && hoursDiff <= 24;
		});

		if (dueSoonTasks.length > 0) {
			notifications.push({
				id: "due-soon",
				type: "warning",
				title: `${dueSoonTasks.length} Task${
					dueSoonTasks.length > 1 ? "s" : ""
				} Due Soon`,
				message: `${dueSoonTasks.length} task${
					dueSoonTasks.length > 1 ? "s are" : " is"
				} due within 24 hours`,
				icon: Clock,
				color: "text-yellow-600",
				bg: "bg-yellow-50",
				time: "2h ago",
			});
		}

		// Recently completed tasks
		const recentlyCompleted = tasks.filter((task) => {
			if (task.status !== "done") return false;
			const updatedDate = new Date(task.updated_at);
			const timeDiff = today.getTime() - updatedDate.getTime();
			const hoursDiff = timeDiff / (1000 * 3600);
			return hoursDiff <= 6; // Last 6 hours
		});

		if (recentlyCompleted.length > 0) {
			notifications.push({
				id: "completed",
				type: "success",
				title: `${recentlyCompleted.length} Task${
					recentlyCompleted.length > 1 ? "s" : ""
				} Completed`,
				message: `Great job! You completed ${recentlyCompleted.length} task${
					recentlyCompleted.length > 1 ? "s" : ""
				} today`,
				icon: CheckCircle,
				color: "text-green-600",
				bg: "bg-green-50",
				time: "1h ago",
			});
		}

		return notifications;
	};

	const notifications = getNotifications();

	const handleLogout = async () => {
		try {
			await logout();
			setShowUserMenu(false);
			toast.success("Logged out successfully");
			router.push("/auth/login");
		} catch (error) {
			toast.error("Failed to logout");
		}
	};

	const handleSearchResultClick = (taskId: number) => {
		setSearchQuery("");
		setShowSearchResults(false);
		router.push(`/tasks?highlight=${taskId}`);
	};

	const clearSearch = () => {
		setSearchQuery("");
		setShowSearchResults(false);
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "done":
				return <CheckCircle className="h-4 w-4 text-green-500" />;
			case "in_progress":
				return <Clock className="h-4 w-4 text-blue-500" />;
			default:
				return <div className="h-4 w-4 rounded-full bg-gray-400"></div>;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "high":
				return "text-red-600";
			case "medium":
				return "text-yellow-600";
			default:
				return "text-green-600";
		}
	};

	return (
		<header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
			<div className="flex items-center justify-between px-6 py-4">
				{/* Left side - Search */}
				<div className="flex items-center space-x-4 flex-1 max-w-md">
					<div className="relative w-full" ref={searchRef}>
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<input
							type="text"
							placeholder="Search tasks..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{searchQuery && (
							<button
								onClick={clearSearch}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								<X className="h-4 w-4" />
							</button>
						)}

						{/* Search Results Dropdown */}
						{showSearchResults && (
							<div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
								{searchResults.length > 0 ? (
									<div className="py-2">
										{searchResults.map((task) => (
											<button
												key={task.id}
												onClick={() => handleSearchResultClick(task.id)}
												className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
											>
												<div className="flex items-center space-x-3">
													{getStatusIcon(task.status)}
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900 truncate">
															{task.title}
														</p>
														<div className="flex items-center space-x-2 mt-1">
															{task.category && (
																<span className="text-xs text-gray-500">
																	{task.category.name}
																</span>
															)}
															<span
																className={`text-xs ${getPriorityColor(
																	task.priority
																)}`}
															>
																{task.priority}
															</span>
														</div>
													</div>
												</div>
											</button>
										))}
									</div>
								) : (
									<div className="px-4 py-6 text-center text-gray-500 text-sm">
										No tasks found for "{searchQuery}"
									</div>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Right side - Weather, Notifications, User */}
				<div className="flex items-center space-x-4">
					{/* Weather Widget */}
					{weather && (
						<div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
							<span>🌤️</span>
							<span>{weather.location}</span>
							<span className="font-medium">
								{Math.round(weather.temperature)}°C
							</span>
							<span className="capitalize">{weather.description}</span>
						</div>
					)}

					{/* Notifications */}
					<div className="relative" ref={notificationRef}>
						<button
							onClick={() => setShowNotifications(!showNotifications)}
							className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
						>
							<Bell className="h-5 w-5" />
							{notifications.length > 0 && (
								<span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
									{notifications.length}
								</span>
							)}
						</button>

						{/* Notifications Dropdown */}
						{showNotifications && (
							<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
								<div className="px-4 py-2 border-b border-gray-100">
									<h3 className="text-sm font-semibold text-gray-900">
										Notifications
									</h3>
								</div>

								{notifications.length > 0 ? (
									<div className="py-2">
										{notifications.map((notification) => (
											<div
												key={notification.id}
												className={`px-4 py-3 hover:bg-gray-50 ${
													notification.bg
												} border-l-4 border-l-${
													notification.type === "error"
														? "red"
														: notification.type === "warning"
														? "yellow"
														: "green"
												}-500`}
											>
												<div className="flex items-start space-x-3">
													<notification.icon
														className={`h-5 w-5 ${notification.color} mt-0.5`}
													/>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium text-gray-900">
															{notification.title}
														</p>
														<p className="text-xs text-gray-600 mt-1">
															{notification.message}
														</p>
														<p className="text-xs text-gray-400 mt-1">
															{notification.time}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="px-4 py-6 text-center text-gray-500 text-sm">
										No new notifications
									</div>
								)}
							</div>
						)}
					</div>

					{/* User Menu */}
					<div className="relative" ref={userMenuRef}>
						<button
							onClick={() => setShowUserMenu(!showUserMenu)}
							className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
								{user?.name?.charAt(0).toUpperCase() || "U"}
							</div>
							<span className="hidden md:block text-sm font-medium text-gray-700">
								{user?.name || "User"}
							</span>
						</button>

						{/* User Dropdown */}
						{showUserMenu && (
							<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
								<div className="px-4 py-2 border-b border-gray-100">
									<p className="text-sm font-medium text-gray-900">
										{user?.name}
									</p>
									<p className="text-xs text-gray-500">{user?.email}</p>
								</div>

								<div className="border-t border-gray-100 mt-1">
									<button
										onClick={handleLogout}
										className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
									>
										<LogOut className="h-4 w-4" />
										<span>Sign out</span>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
