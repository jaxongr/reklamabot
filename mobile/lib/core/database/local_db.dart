import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart' as p;

/// SQLite database helper for offline caching.
class LocalDb {
  static Database? _db;
  static const String _dbName = 'reklama_bot.db';
  static const int _dbVersion = 1;

  /// Get (or create) the database instance.
  Future<Database> get database async {
    if (_db != null) return _db!;
    _db = await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final dir = await getApplicationDocumentsDirectory();
    final path = p.join(dir.path, _dbName);

    return openDatabase(
      path,
      version: _dbVersion,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    // Sessions cache table
    await db.execute('''
      CREATE TABLE IF NOT EXISTS sessions_cache (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT,
        status TEXT DEFAULT 'ACTIVE',
        phone TEXT,
        is_premium INTEGER DEFAULT 0,
        total_groups INTEGER DEFAULT 0,
        active_groups INTEGER DEFAULT 0,
        is_frozen INTEGER DEFAULT 0,
        freeze_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        cached_at TEXT NOT NULL
      )
    ''');

    // Orders cache table
    await db.execute('''
      CREATE TABLE IF NOT EXISTS orders_cache (
        id TEXT PRIMARY KEY,
        source_group_id TEXT,
        source_group_title TEXT,
        sender_name TEXT,
        sender_phone TEXT,
        cargo_from TEXT,
        cargo_to TEXT,
        cargo_type TEXT,
        cargo_weight REAL,
        vehicle_type TEXT,
        price REAL,
        currency TEXT DEFAULT 'UZS',
        description TEXT,
        status TEXT DEFAULT 'NEW',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        cached_at TEXT NOT NULL
      )
    ''');

    // Ads cache table
    await db.execute('''
      CREATE TABLE IF NOT EXISTS ads_cache (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        media_type TEXT DEFAULT 'TEXT',
        status TEXT DEFAULT 'DRAFT',
        is_priority INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        cached_at TEXT NOT NULL
      )
    ''');

    // Key-value settings cache
    await db.execute('''
      CREATE TABLE IF NOT EXISTS kv_cache (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        cached_at TEXT NOT NULL
      )
    ''');
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    // Handle future migrations here
  }

  // ─── Sessions ──────────────────────────────────────────────────

  Future<void> cacheSessions(List<Map<String, dynamic>> sessions) async {
    final db = await database;
    final batch = db.batch();
    final now = DateTime.now().toIso8601String();

    // Clear old cache
    batch.delete('sessions_cache');

    for (final s in sessions) {
      batch.insert('sessions_cache', {
        'id': s['id'],
        'user_id': s['userId'] ?? '',
        'name': s['name'],
        'status': s['status'] ?? 'ACTIVE',
        'phone': s['phone'],
        'is_premium': (s['isPremium'] == true) ? 1 : 0,
        'total_groups': s['totalGroups'] ?? 0,
        'active_groups': s['activeGroups'] ?? 0,
        'is_frozen': (s['isFrozen'] == true) ? 1 : 0,
        'freeze_count': s['freezeCount'] ?? 0,
        'created_at': s['createdAt'] ?? now,
        'updated_at': s['updatedAt'] ?? now,
        'cached_at': now,
      });
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getCachedSessions() async {
    final db = await database;
    return db.query('sessions_cache', orderBy: 'created_at DESC');
  }

  // ─── Orders ────────────────────────────────────────────────────

  Future<void> cacheOrders(List<Map<String, dynamic>> orders) async {
    final db = await database;
    final batch = db.batch();
    final now = DateTime.now().toIso8601String();

    batch.delete('orders_cache');

    for (final o in orders) {
      batch.insert('orders_cache', {
        'id': o['id'],
        'source_group_id': o['sourceGroupId'],
        'source_group_title': o['sourceGroupTitle'],
        'sender_name': o['senderName'],
        'sender_phone': o['senderPhone'],
        'cargo_from': o['cargoFrom'],
        'cargo_to': o['cargoTo'],
        'cargo_type': o['cargoType'],
        'cargo_weight': o['cargoWeight'],
        'vehicle_type': o['vehicleType'],
        'price': o['price'],
        'currency': o['currency'] ?? 'UZS',
        'description': o['description'],
        'status': o['status'] ?? 'NEW',
        'created_at': o['createdAt'] ?? now,
        'updated_at': o['updatedAt'] ?? now,
        'cached_at': now,
      });
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getCachedOrders() async {
    final db = await database;
    return db.query('orders_cache', orderBy: 'created_at DESC');
  }

  // ─── Key-Value ─────────────────────────────────────────────────

  Future<void> setKv(String key, String value) async {
    final db = await database;
    await db.insert(
      'kv_cache',
      {
        'key': key,
        'value': value,
        'cached_at': DateTime.now().toIso8601String(),
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<String?> getKv(String key) async {
    final db = await database;
    final result = await db.query('kv_cache', where: 'key = ?', whereArgs: [key]);
    if (result.isEmpty) return null;
    return result.first['value'] as String?;
  }

  // ─── Cleanup ───────────────────────────────────────────────────

  Future<void> clearAll() async {
    final db = await database;
    await db.delete('sessions_cache');
    await db.delete('orders_cache');
    await db.delete('ads_cache');
    await db.delete('kv_cache');
  }

  Future<void> close() async {
    final db = await database;
    await db.close();
    _db = null;
  }
}

/// Provider for the local database.
final localDbProvider = Provider<LocalDb>((ref) {
  return LocalDb();
});
