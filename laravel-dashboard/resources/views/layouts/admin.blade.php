<!-- resources/views/layouts/admin.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TaskFlow Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <nav class="bg-blue-600 text-white p-4">
        <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-xl font-bold">TaskFlow Admin</h1>
            <div class="space-x-4">
                <a href="{{ route('admin.dashboard') }}" class="hover:text-blue-200">Dashboard</a>
                <a href="{{ route('admin.users.index') }}" class="hover:text-blue-200">Users</a>
                <a href="{{ route('admin.categories.index') }}" class="hover:text-blue-200">Categories</a>
            </div>
        </div>
    </nav>

    <main class="container mx-auto py-8">
        @yield('content')
    </main>
</body>
</html>