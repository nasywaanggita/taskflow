<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\TasksExport;
use App\Exports\UsersExport;

class ExportController extends Controller
{
    public function exportTasks()
    {
        return Excel::download(new TasksExport, 'tasks-' . date('Y-m-d') . '.csv');
    }

    public function exportUsers()
    {
        return Excel::download(new UsersExport, 'users-' . date('Y-m-d') . '.csv');
    }
}