<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExternalDataSync extends Model
{
    protected $fillable = [
        'source',
        'last_sync_at',
        'status',
        'error_message',
        'records_synced',
    ];

    protected $casts = [
        'last_sync_at' => 'datetime',
    ];
}