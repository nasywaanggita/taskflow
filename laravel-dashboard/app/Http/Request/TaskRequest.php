<?php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TaskRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|in:todo,in_progress,done',
            'priority' => 'required|in:low,medium,high',
            'category_id' => 'required|exists:categories,id',
            'user_id' => 'required|exists:users,id',
            'deadline' => 'nullable|date|after:now',
        ];
    }

    public function messages()
    {
        return [
            'title.required' => 'Judul task wajib diisi',
            'status.in' => 'Status harus salah satu dari: todo, in_progress, done',
            'priority.in' => 'Priority harus salah satu dari: low, medium, high',
            'category_id.exists' => 'Category yang dipilih tidak valid',
            'user_id.exists' => 'User yang dipilih tidak valid',
            'deadline.after' => 'Deadline harus setelah waktu sekarang',
        ];
    }
}