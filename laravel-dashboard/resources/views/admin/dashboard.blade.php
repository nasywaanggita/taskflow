@extends('layouts.admin')

@section('content')
<!-- EXPORT BUTTONS -->
<div class="flex space-x-4 mb-8">
    <a href="{{ route('admin.export.tasks') }}" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Export Tasks CSV
    </a>
    <a href="{{ route('admin.export.users') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Export Users CSV
    </a>
</div>

<!-- SUMMARY STATISTICS -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700">Total Users</h3>
        <p class="text-3xl font-bold text-blue-600">{{ $stats['total_users'] }}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700">Total Tasks</h3>
        <p class="text-3xl font-bold text-green-600">{{ $stats['total_tasks'] }}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700">Completed</h3>
        <p class="text-3xl font-bold text-purple-600">{{ $stats['completed_tasks'] }}</p>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700">Completion Rate</h3>
        <p class="text-3xl font-bold text-orange-600">{{ $stats['completion_rate'] }}%</p>
    </div>
</div>

<!-- RECENT TASKS TABLE -->
<div class="bg-white rounded-lg shadow mb-8">
    <div class="p-6 border-b">
        <h2 class="text-xl font-semibold">Recent Tasks</h2>
    </div>
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @foreach($recent_tasks as $task)
                <tr>
                    <td class="px-6 py-4">{{ $task->title }}</td>
                    <td class="px-6 py-4">{{ $task->user->name }}</td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs rounded-full" style="background-color: {{ $task->category->color }}20; color: {{ $task->category->color }};">
                            {{ $task->category->name }}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 text-xs rounded-full 
                            @if($task->status === 'done') bg-green-100 text-green-800
                            @elseif($task->status === 'in_progress') bg-yellow-100 text-yellow-800
                            @else bg-gray-100 text-gray-800 @endif">
                            {{ ucfirst(str_replace('_', ' ', $task->status)) }}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500">{{ $task->created_at->diffForHumans() }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

<!-- EXTERNAL SYNC STATUS -->
<div class="bg-white rounded-lg shadow">
    <div class="p-6 border-b">
        <h2 class="text-xl font-semibold">External Data Sync Status</h2>
    </div>
    <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @forelse($sync_status as $sync)
            <div class="border rounded-lg p-4">
                <h3 class="font-semibold text-lg capitalize">{{ $sync->source }}</h3>
                <div class="flex items-center mt-2">
                    <span class="px-2 py-1 text-xs rounded-full 
                        @if($sync->status === 'success') bg-green-100 text-green-800
                        @elseif($sync->status === 'failed') bg-red-100 text-red-800
                        @else bg-yellow-100 text-yellow-800 @endif">
                        {{ ucfirst($sync->status) }}
                    </span>
                </div>
                <p class="text-sm text-gray-600 mt-2">
                    Last sync: {{ $sync->last_sync_at ? $sync->last_sync_at->diffForHumans() : 'Never' }}
                </p>
                <p class="text-sm text-gray-600">
                    Records: {{ $sync->records_synced }}
                </p>
                @if($sync->error_message)
                <p class="text-sm text-red-600 mt-1">{{ $sync->error_message }}</p>
                @endif
            </div>
            @empty
            <p class="text-gray-500">No sync data available</p>
            @endforelse
        </div>
    </div>
</div>
@endsection
