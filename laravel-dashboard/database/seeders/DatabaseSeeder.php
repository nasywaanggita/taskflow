<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Task;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Buat admin user
        $admin = User::create([
            'name' => 'Admin TaskFlow',
            'email' => 'admin@taskflow.com',
            'password' => bcrypt('password123'),
        ]);

        // Buat default categories
        $categories = [
            ['name' => 'Work', 'slug' => 'work', 'color' => '#3B82F6'],
            ['name' => 'Personal', 'slug' => 'personal', 'color' => '#10B981'],
            ['name' => 'Shopping', 'slug' => 'shopping', 'color' => '#F59E0B'],
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }

        // Buat sample users dan tasks
        User::factory(10)->create()->each(function ($user) {
            // Assign random categories ke user
            $categories = Category::inRandomOrder()->take(2)->get();
            $user->categories()->attach($categories);

            // Buat tasks untuk user
            Task::factory(rand(3, 8))->create([
                'user_id' => $user->id,
                'category_id' => $categories->random()->id,
            ]);
        });
    }
}