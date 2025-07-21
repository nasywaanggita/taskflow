"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useTaskStore } from "@/store/tasks";
import { useCategoryStore } from "@/store/categories";
import { exportApi } from "@/lib/api/export";
import Layout from "@/components/layout/Layout";
import TaskCard from "@/components/tasks/TaskCard";
import TaskForm from "@/components/tasks/TaskForm";
import TaskFilters from "@/components/tasks/TaskFilters";
import { Task } from "@/types";
import {
	Plus,
	Search,
	Filter,
	Download,
	FileText,
	Grid3X3,
	List,
	Calendar,
	BarChart3,
} from "lucide-react";
import toast from "react-hot-toast";

export default function TasksPage() {
	const searchParams = useSearchParams();
	const { user } = useAuthStore();
	const { tasks, isLoading, fetchTasks, filters, setFilters } = useTaskStore();
	const { categories, fetchCategories } = useCategoryStore();

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [showFilters, setShowFilters] = useState(false);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [showExportMenu, setShowExportMenu] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	// Initialize data
	useEffect(() => {
		if (user) {
			fetchTasks(user.id);
			fetchCategories();
		}
	}, [user, fetchTasks, fetchCategories, filters]);

	// Handle URL params
	useEffect(() => {
		const categoryParam = searchParams.get("category");
		const newParam = searchParams.get("new");
		const highlightParam = searchParams.get("highlight");

		if (categoryParam) {
			setFilters({ ...filters, category_id: parseInt(categoryParam) });
		}

		if (newParam === "true") {
			setShowCreateForm(true);
		}

		if (highlightParam) {
			// Highlight specific task
			const taskId = parseInt(highlightParam);
			setTimeout(() => {
				const element = document.getElementById(`task-${taskId}`);
				if (element) {
					element.scrollIntoView({ behavior: "smooth" });
					element.classList.add("ring-2", "ring-blue-500");
					setTimeout(() => {
						element.classList.remove("ring-2", "ring-blue-500");
					}, 3000);
				}
			}, 500);
		}
	}, [searchParams, setFilters, filters]);

	// Filter tasks based on search and filters
	const filteredTasks = tasks.filter((task) => {
		if (searchQuery) {
			const searchLower = searchQuery.toLowerCase();
			const matchesSearch =
				task.title.toLowerCase().includes(searchLower) ||
				task.description?.toLowerCase().includes(searchLower) ||
				task.category?.name.toLowerCase().includes(searchLower);

			if (!matchesSearch) return false;
		}

		if (filters.status && task.status !== filters.status) {
			return false;
		}

		if (filters.category_id && task.category_id !== filters.category_id) {
			return false;
		}

		return true;
	});

	// Export functions
	const handleExportCSV = useCallback(async () => {
		if (!user) {
			toast.error("User not found");
			return;
		}

		try {
			setIsExporting(true);
			toast.loading("Exporting tasks...", { id: "export" });

			try {
				const blob = await exportApi.exportTasksCSV(user.id);
				const url = window.URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.href = url;
				link.download = `my_tasks_${
					new Date().toISOString().split("T")[0]
				}.csv`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);

				toast.success("Tasks exported successfully!", { id: "export" });
			} catch (error) {
				// Fallback to client-side export
				exportApi.exportTasksClientSide(
					filteredTasks,
					`my_tasks_${new Date().toISOString().split("T")[0]}.csv`
				);
				toast.success("Tasks exported successfully!", { id: "export" });
			}
		} catch (error) {
			console.error("Export error:", error);
			toast.error("Failed to export tasks", { id: "export" });
		} finally {
			setIsExporting(false);
			setShowExportMenu(false);
		}
	}, [user, filteredTasks]);

	const handleExportJSON = useCallback(async () => {
		if (!user) {
			toast.error("User not found");
			return;
		}

		try {
			setIsExporting(true);
			toast.loading("Exporting tasks as JSON...", { id: "export" });

			const blob = await exportApi.exportTasksJSON(user.id);
			const url = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = `my_tasks_${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(url);

			toast.success("Tasks exported as JSON!", { id: "export" });
		} catch (error) {
			console.error("JSON export error:", error);
			toast.error("Failed to export tasks as JSON", { id: "export" });
		} finally {
			setIsExporting(false);
			setShowExportMenu(false);
		}
	}, [user]);

	// Task handlers
	const handleEditTask = (task: Task) => {
		setEditingTask(task);
		setShowCreateForm(true);
	};

	const handleCloseForm = () => {
		setShowCreateForm(false);
		setEditingTask(null);
	};

	const clearSearch = () => {
		setSearchQuery("");
	};

	const clearFilters = () => {
		setFilters({});
		setSearchQuery("");
	};

	// Calculate stats
	const stats = {
		total: filteredTasks.length,
		completed: filteredTasks.filter((t) => t.status === "done").length,
		inProgress: filteredTasks.filter((t) => t.status === "in_progress").length,
		todo: filteredTasks.filter((t) => t.status === "todo").length,
		completionRate:
			filteredTasks.length > 0
				? Math.round(
						(filteredTasks.filter((t) => t.status === "done").length /
							filteredTasks.length) *
							100
				  )
				: 0,
	};

	if (isLoading) {
		return (
			<Layout>
				<div className="space-y-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="h-24 bg-gray-200 rounded"></div>
							))}
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{[...Array(6)].map((_, i) => (
								<div key={i} className="h-48 bg-gray-200 rounded"></div>
							))}
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
						<p className="text-gray-600">
							Manage and organize your tasks efficiently
						</p>
					</div>

					<div className="flex items-center space-x-3">
						{/* Export Button */}
						{tasks.length > 0 && (
							<button
								onClick={handleExportCSV}
								disabled={isExporting}
								className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
							>
								<FileText className="h-4 w-4" />
								<span>Export CSV</span>
							</button>
						)}

						{/* New Task Button */}
						<button
							onClick={() => setShowCreateForm(true)}
							className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
						>
							<Plus className="h-4 w-4" />
							<span>New Task</span>
						</button>
					</div>
				</div>

				{/* Stats */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="bg-white p-4 rounded-lg border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Total</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.total}
								</p>
							</div>
							<Calendar className="h-8 w-8 text-gray-400" />
						</div>
					</div>

					<div className="bg-white p-4 rounded-lg border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Completed</p>
								<p className="text-2xl font-bold text-green-600">
									{stats.completed}
								</p>
							</div>
							<BarChart3 className="h-8 w-8 text-green-400" />
						</div>
					</div>

					<div className="bg-white p-4 rounded-lg border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">In Progress</p>
								<p className="text-2xl font-bold text-blue-600">
									{stats.inProgress}
								</p>
							</div>
							<div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
								<div className="h-4 w-4 bg-blue-600 rounded-full"></div>
							</div>
						</div>
					</div>

					<div className="bg-white p-4 rounded-lg border border-gray-200">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Progress</p>
								<p className="text-2xl font-bold text-purple-600">
									{stats.completionRate}%
								</p>
							</div>
							<div className="h-8 w-8">
								<div className="relative h-8 w-8">
									<div className="h-8 w-8 rounded-full border-4 border-gray-200"></div>
									<div
										className="absolute top-0 left-0 h-8 w-8 rounded-full border-4 border-purple-600 border-t-transparent transform -rotate-90"
										style={{
											background: `conic-gradient(#9333ea ${
												stats.completionRate * 3.6
											}deg, transparent 0deg)`,
											borderRadius: "50%",
										}}
									></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Search and Filters */}
				<div className="flex flex-col sm:flex-row gap-4">
					{/* Search */}
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<input
							type="text"
							placeholder="Search tasks..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-10 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
						{searchQuery && (
							<button
								onClick={clearSearch}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
							>
								×
							</button>
						)}
					</div>

					{/* Filters Toggle */}
					<button
						onClick={() => setShowFilters(!showFilters)}
						className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
							showFilters
								? "border-blue-500 bg-blue-50 text-blue-700"
								: "border-gray-200 hover:bg-gray-50"
						}`}
					>
						<Filter className="h-4 w-4" />
						<span>Filters</span>
						{(filters.status || filters.category_id) && (
							<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
								Active
							</span>
						)}
					</button>

					{/* View Mode Toggle */}
					<div className="flex border border-gray-200 rounded-lg">
						<button
							onClick={() => setViewMode("grid")}
							className={`p-2 ${
								viewMode === "grid"
									? "bg-gray-100 text-gray-900"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							<Grid3X3 className="h-4 w-4" />
						</button>
						<button
							onClick={() => setViewMode("list")}
							className={`p-2 ${
								viewMode === "list"
									? "bg-gray-100 text-gray-900"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							<List className="h-4 w-4" />
						</button>
					</div>
				</div>

				{/* Filters */}
				{showFilters && <TaskFilters />}

				{/* Clear Filters */}
				{(searchQuery || filters.status || filters.category_id) && (
					<div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
						<div className="flex items-center space-x-4">
							<span className="text-sm text-blue-800">
								Showing {filteredTasks.length} of {tasks.length} tasks
							</span>
							{searchQuery && (
								<span className="text-sm text-blue-600">
									Search: "{searchQuery}"
								</span>
							)}
							{filters.status && (
								<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
									Status: {filters.status}
								</span>
							)}
							{filters.category_id && (
								<span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
									Category:{" "}
									{categories.find((c) => c.id === filters.category_id)?.name}
								</span>
							)}
						</div>
						<button
							onClick={clearFilters}
							className="text-sm text-blue-600 hover:text-blue-800 font-medium"
						>
							Clear all
						</button>
					</div>
				)}

				{/* Tasks */}
				{filteredTasks.length === 0 ? (
					<div className="text-center py-12">
						<div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
							<Calendar className="h-12 w-12 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							{searchQuery || filters.status || filters.category_id
								? "No tasks match your criteria"
								: "No tasks yet"}
						</h3>
						<p className="text-gray-600 mb-4">
							{searchQuery || filters.status || filters.category_id
								? "Try adjusting your search or filters"
								: "Get started by creating your first task"}
						</p>
						{!(searchQuery || filters.status || filters.category_id) && (
							<button
								onClick={() => setShowCreateForm(true)}
								className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
							>
								Create Your First Task
							</button>
						)}
					</div>
				) : (
					<div
						className={
							viewMode === "grid"
								? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
								: "space-y-4"
						}
					>
						{filteredTasks.map((task) => (
							<TaskCard
								key={task.id}
								task={task}
								onEdit={handleEditTask}
								viewMode={viewMode}
							/>
						))}
					</div>
				)}

				{/* Task Form Modal */}
				{showCreateForm && (
					<TaskForm task={editingTask} onClose={handleCloseForm} />
				)}
			</div>
		</Layout>
	);
}
