
@extends('layouts.admin')

@section('content')
<div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">Categories Management</h1>
    <a href="{{ route('admin.categories.create') }}" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Category
    </a>
</div>

<div class="bg-white rounded-lg shadow">
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasks Count</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                @foreach($categories as $category)
                <tr>
                    <td class="px-6 py-4">
                        <div class="flex items-center">
                            <div class="w-4 h-4 rounded mr-3" style="background-color: {{ $category->color }}"></div>
                            {{ $category->name }}
                        </div>
                    </td>
                    <td class="px-6 py-4">{{ $category->color }}</td>
                    <td class="px-6 py-4">{{ $category->tasks_count }}</td>
                    <td class="px-6 py-4 space-x-2">
                        <a href="{{ route('admin.categories.show', $category) }}" class="text-blue-600 hover:text-blue-800">View</a>
                        <a href="{{ route('admin.categories.edit', $category) }}" class="text-green-600 hover:text-green-800">Edit</a>
                        <form method="POST" action="{{ route('admin.categories.destroy', $category) }}" class="inline">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="text-red-600 hover:text-red-800" onclick="return confirm('Are you sure?')">Delete</button>
                        </form>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    <div class="px-6 py-4">
        {{ $categories->links() }}
    </div>
</div>
@endsection