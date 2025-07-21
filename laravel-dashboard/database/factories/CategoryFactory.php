<?php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition()
    {
        $categories = [
            ['name' => 'Work', 'color' => '#3B82F6'],
            ['name' => 'Personal', 'color' => '#10B981'],
            ['name' => 'Shopping', 'color' => '#F59E0B'],
            ['name' => 'Health', 'color' => '#EF4444'],
            ['name' => 'Learning', 'color' => '#8B5CF6'],
        ];
        
        $category = $this->faker->randomElement($categories);
        
        return [
            'name' => $category['name'],
            'slug' => Str::slug($category['name']),
            'color' => $category['color'],
            'description' => $this->faker->sentence(),
        ];
    }
}