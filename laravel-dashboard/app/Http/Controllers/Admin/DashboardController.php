<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Task;
use App\Models\Category;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
   // Update app/Http/Controllers/Admin/DashboardController.php - method index
public function index()
{
    $stats = [
        'total_users' => User::count(),
        'total_tasks' => Task::count(),
        'completed_tasks' => Task::where('status', 'done')->count(),
        'pending_tasks' => Task::whereIn('status', ['todo', 'in_progress'])->count(),
        'completion_rate' => $this->getCompletionRate(),
    ];

    $recent_tasks = Task::with(['user', 'category'])
        ->latest()
        ->limit(10)
        ->get();

    // External data sync status
    $sync_status = \App\Models\ExternalDataSync::latest('last_sync_at')->get();

    return view('admin.dashboard', compact('stats', 'recent_tasks', 'sync_status'));
}

    private function getCompletionRate()
    {
        $total = Task::count();
        if ($total === 0) return 0;
        
        $completed = Task::where('status', 'done')->count();
        return round(($completed / $total) * 100, 2);
    }
}