<?php
namespace App\Exports;

use App\Models\Task;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TasksExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Task::with(['user', 'category'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Title',
            'Description',
            'Status',
            'Priority',
            'User Name',
            'User Email',
            'Category',
            'Deadline',
            'Created At',
            'Updated At'
        ];
    }

    public function map($task): array
    {
        return [
            $task->id,
            $task->title,
            $task->description,
            $task->status,
            $task->priority,
            $task->user->name,
            $task->user->email,
            $task->category->name,
            $task->deadline ? $task->deadline->format('Y-m-d H:i:s') : '',
            $task->created_at->format('Y-m-d H:i:s'),
            $task->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}