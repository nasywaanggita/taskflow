// database/migrations/2024_01_01_000005_create_external_data_syncs_table.php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('external_data_syncs', function (Blueprint $table) {
            $table->id();
            $table->string('source'); // 'weather', 'news', etc
            $table->timestamp('last_sync_at')->nullable();
            $table->enum('status', ['success', 'failed', 'pending'])->default('pending');
            $table->text('error_message')->nullable();
            $table->integer('records_synced')->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('external_data_syncs');
    }
};