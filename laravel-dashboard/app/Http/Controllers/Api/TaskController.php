<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Http\Requests\TaskRequest;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['user', 'category']);
        
        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        
        $tasks = $query->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }

    public function store(TaskRequest $request)
    {
        $task = Task::create($request->validated());
        $task->load(['user', 'category']);
        
        return response()->json([
            'success' => true,
            'message' => 'Task berhasil dibuat',
            'data' => $task
        ], 201);
    }

    public function show(Task $task)
    {
        $task->load(['user', 'category']);
        
        return response()->json([
            'success' => true,
            'data' => $task
        ]);
    }

    public function update(TaskRequest $request, Task $task)
    {
        $task->update($request->validated());
        $task->load(['user', 'category']);
        
        return response()->json([
            'success' => true,
            'message' => 'Task berhasil diupdate',
            'data' => $task
        ]);
    }

    public function destroy(Task $task)
    {
        $task->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Task berhasil dihapus'
        ]);
    }

    public function complete(Task $task)
    {
        $task->update(['status' => 'done']);
        $task->load(['user', 'category']);
        
        return response()->json([
            'success' => true,
            'message' => 'Task berhasil diselesaikan',
            'data' => $task
        ]);
    }
}