# CLAUDE.md — Master Project Rules
# Bu fayl Claude Code uchun — har safar o'qiladi
# Yangi pattern/qoida qo'shilsa — DARHOL yangilang

---

## 🏗️ TECH STACK

| Layer   | Stack                                         |
|---------|-----------------------------------------------|
| Backend | NestJS + Prisma + PostgreSQL + Redis          |
| Admin   | Vite + React + AntD + Styled-components + TS  |
| Mobile  | Flutter + Riverpod + GoRouter                 |
| Auth    | JWT (access 15min + refresh 7d) + RBAC        |
| Cache   | Redis (multi-level)                           |
| Docs    | Swagger (auto-generated)                      |

---

## 🔴 UNIVERSAL TAQIQLAR — hamma joyda, istisnasiz

```
❌ TODO / FIXME / HACK komentar — darhol hal qil
❌ console.log / print — logger ishlatilsin
❌ Hardcoded secret, URL, credential
❌ any tipi (TypeScript) — MUTLAQ TAQIQ
❌ Mock data production codeda
❌ N+1 query — Prisma include/select ishlatilsin
❌ Untested critical path — test yozilsin
❌ offset-based pagination — cursor-based ishlatilsin
```

---

## ✅ UNIVERSAL MAJBURIYLAR — hamma joyda

```
✅ Conventional commits: feat/fix/refactor/chore/docs/test
✅ Har yangi funksiya — Swagger yoki docstring
✅ Error har doim typed (custom Error class)
✅ Environment variables — .env.example yangilansin
✅ Har yangi endpoint — integration test
✅ Coverage minimum: 70%
```

---

## 📡 API CONTRACT

### Endpoint format
```
GET    /api/v1/{resource}
POST   /api/v1/{resource}
PATCH  /api/v1/{resource}/:id
DELETE /api/v1/{resource}/:id
```

### Response format — BARCHA endpointlar
```typescript
// Muvaffaqiyatli
{
  data: T | T[],
  meta?: {
    total: number,
    cursor?: string,
    hasNext: boolean
  }
}

// Xato
{
  error: {
    code: string,       // "E1001"
    message: string,    // foydalanuvchi uchun
    details?: object    // validation xatolari
  }
}
```

### Error kodlar
```
E1001 — Unauthorized
E1002 — Forbidden (RBAC)
E1003 — Token expired
E2001 — Resource not found
E2002 — Already exists
E2003 — Business logic violation
E3001 — Validation error
E5001 — Internal server error
```

### Pagination — cursor-based (offset TAQIQ)
```
GET /api/v1/orders?cursor=<last_id>&limit=20&direction=next
```

---

## 🔐 SECURITY STANDARTLARI

```
- Access token:  15 daqiqa
- Refresh token: 7 kun, HttpOnly cookie
- RBAC:          @Roles() decorator har protected endpointda
- Validation:    class-validator har DTO da majburiy
- Rate limiting: /auth/* → 5 req/min | global → 100 req/min
- CORS:          whitelist only
- Helmet:        majburiy
```

---

## 📊 PERFORMANCE BUDGETLAR

```
API response time:     < 200ms (p95)
DB query time:         < 50ms  (p95)
Redis cache hit rate:  > 80%
Flutter first paint:   < 1.5s
Admin bundle size:     < 500KB (gzipped)
```

---

## 📝 COMMIT FORMAT

```
feat(orders): add cursor-based pagination
fix(auth): refresh token rotation bug
refactor(users): extract validation logic
chore(deps): update nestjs to v10
docs(api): add swagger for orders endpoint
test(orders): add integration tests
```

---

## 🌍 ENVIRONMENT

```
Muhitlar: development | staging | production

Har yangi env variable:
1. .env.example ga qo'sh (value emas, key)
2. config/configuration.ts ga qo'sh
3. README.md ga tushuntir
```

---

## 🧪 TEST STANDARTLARI

```
Unit:        har service/usecase uchun
Integration: har endpoint uchun
E2E:         kritik flow (login, payment, order)

Naming: describe('ServiceName') > it('should do X when Y')
```

---
---

# ═══════════════════════════════════
# BACKEND — NestJS + Prisma + Redis
# ═══════════════════════════════════

## 🏗️ MODUL STRUKTURASI

```
src/
├── modules/
│   └── orders/
│       ├── orders.module.ts
│       ├── orders.controller.ts   ← faqat HTTP, biznes logika YO'Q
│       ├── orders.service.ts      ← biznes logika
│       ├── orders.repository.ts   ← DB queries (Prisma)
│       ├── dto/
│       │   ├── create-order.dto.ts
│       │   └── order-response.dto.ts
│       ├── orders.controller.spec.ts
│       └── orders.service.spec.ts
├── common/
│   ├── filters/       ← GlobalExceptionFilter
│   ├── guards/        ← JwtAuthGuard, RolesGuard
│   ├── decorators/    ← @CurrentUser(), @Roles()
│   ├── interceptors/  ← LoggingInterceptor, TransformInterceptor
│   └── pipes/         ← ValidationPipe
├── config/
└── prisma/            ← PrismaService, migrations
```

## 📐 CONTROLLER QOIDASI

```typescript
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('orders')
export class OrdersController {
  // ✅ Faqat HTTP layer — validation, auth, response
  // ✅ Biznes logika YO'Q — servicedan chaqiriladi
  @Get()
  @Roles(Role.ADMIN, Role.DRIVER)
  @ApiOperation({ summary: '...' })
  async findAll(@Query() query: PaginationDto, @CurrentUser() user: UserEntity) {
    return this.ordersService.findAll(query, user);
  }
}
```

## ⚙️ SERVICE QOIDASI

```typescript
@Injectable()
export class OrdersService {
  async findAll(query: PaginationDto, user: UserEntity) {
    // 1. Cache tekshir
    const cached = await this.redis.get(`orders:${user.id}:${query.cursor}`);
    if (cached) return JSON.parse(cached);
    // 2. DB dan ol
    const orders = await this.ordersRepository.findMany(query, user);
    // 3. Cache saqla
    await this.redis.setex(`orders:${user.id}:${query.cursor}`, 300, JSON.stringify(orders));
    return orders;
  }
}
```

## 🗄️ REPOSITORY (Prisma) QOIDASI

```typescript
// ✅ cursor-based pagination
// ✅ faqat kerakli fieldlar — HECH QACHON select *
// ✅ index ishlatilgan fieldlar bo'yicha filter
async findMany(query: PaginationDto, user: UserEntity) {
  return this.prisma.order.findMany({
    where: { driverId: user.id },
    select: {
      id: true, status: true, cargoFrom: true, cargoTo: true,
      price: true, createdAt: true,
      sender: { select: { name: true, phone: true } },
    },
    take: query.limit + 1,
    cursor: query.cursor ? { id: query.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });
}
```

## 🔴 DTO QOIDASI

```typescript
export class CreateOrderDto {
  @IsString() @MinLength(2) @MaxLength(100)
  @ApiProperty({ example: 'Toshkent' })
  cargoFrom: string;

  @IsNumber() @Min(1) @Max(50000)
  weight: number;

  @IsEnum(CargoType)
  cargoType: CargoType;

  @IsOptional() @IsString()
  description?: string;
}
```

## ⚠️ GLOBAL EXCEPTION FILTER

```
// BARCHA xatoliklar GlobalExceptionFilter orqali o'tadi
// Response: { error: { code: 'E2001', message: '...', details?: {} } }
// Custom: throw new BusinessException('E2001', 'Order not found');
```

## 🗄️ PRISMA / DATABASE QOIDALARI

```
✅ Har yangi model uchun index:
   - Foreign keys (userId, orderId...)
   - Frequently queried (status, createdAt)
   - Composite (userId + status)

✅ Migration naming: YYYYMMDD_description
✅ Soft delete:  deletedAt DateTime?
✅ Timestamps:   createdAt, updatedAt
✅ UUID:         id String @id @default(uuid())

❌ Raw SQL    — faqat extreme case
❌ select *   — faqat kerakli fieldlar
❌ N+1 query  — include/select ishlatilsin
```

## 🔴 REDIS CACHE STRATEGIYASI

```typescript
// Key format: {module}:{userId}:{variant}
// 'orders:user123:list' | 'balance:user123'

// TTL:
// orders list   → 300s  (5 min)
// order detail  → 600s  (10 min)
// user profile  → 1800s (30 min)
// balance       → 60s   (1 min)

// Invalidation:
await this.redis.del(`orders:${userId}:*`);
```

## 📊 LOGGING (Backend)

```typescript
private readonly logger = new Logger(OrdersService.name);
this.logger.log(`Order created: ${orderId}`);
this.logger.warn(`Slow query: ${duration}ms`);
this.logger.error(`DB error`, error.stack);
// ❌ console.log TAQIQ
```

## 🔒 SCALABILITY (50K+ users)

```
✅ Modular microservice-ready arxitektura
✅ DB: indexing, pooling, read replicas, sharding strategy
✅ Load balancing ready, stateless design
✅ Multi-level caching + invalidation + warming
✅ Monitoring: Winston + Sentry + health checks
✅ Backup & disaster recovery
```

---
---

# ═══════════════════════════════════
# ADMIN PANEL — React + Vite + AntD
# ═══════════════════════════════════

## 🏗️ PAPKA STRUKTURASI (Admin)

```
src/
├── api/
│   ├── client.ts          ← Axios + interceptors
│   └── endpoints/
├── components/
│   ├── common/
│   └── layout/
├── pages/
│   └── orders/
│       ├── OrdersPage.tsx
│       └── components/
├── hooks/                 ← React Query hooks
├── store/                 ← Zustand (minimal)
├── styles/theme.ts        ← AntD theme tokens
├── types/
└── utils/
```

## 🎨 STYLING (Admin)

```typescript
// ✅ Styled-components — komponent stillar
// ✅ AntD theme tokens — AntD komponentlari
// ❌ Inline style={{ }} — TAQIQ
// ❌ !important — TAQIQ

const theme = {
  token: {
    colorPrimary: '#6B46C1', colorSuccess: '#16A34A',
    colorError: '#EF4444',   colorWarning: '#F59E0B',
    borderRadius: 8, fontFamily: 'Outfit, sans-serif',
  },
};
```

## 🔄 REACT QUERY — BARCHA API calls shu pattern

```typescript
// ✅ Custom hook — MAJBURIY
export const useOrders = (params: OrdersParams) =>
  useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Buyurtma yaratildi');
    },
    onError: (e: ApiError) => toast.error(e.message),
  });
};

// ❌ useEffect + fetch — TAQIQ
// ❌ useState loading/error manually — TAQIQ
```

## 📋 KOMPONENT QOIDALARI (Admin)

```
✅ Typed props — MAJBURIY
✅ Default exports — pages
✅ Named exports  — components, hooks, utils
✅ Loading: AntD Skeleton
✅ Empty:   AntD Empty + description
✅ Error:   AntD Result
✅ Memoization kerakli joylarda (memo, useCallback, useMemo)

❌ any tipi
❌ Props drilling 3+ level → Context yoki Zustand
❌ import * from 'antd'   → named import
❌ Moment.js              → dayjs
❌ alert()                → toast
❌ console.log            → logger
```

## ⚡ PERFORMANCE (Admin)

```
✅ Code splitting: React.lazy() + Suspense har sahifa
✅ Bundle: < 500KB gzipped
✅ Virtualization: react-window (10000+ row)
```

---
---

# ═══════════════════════════════════
# MOBILE — Flutter + Riverpod + GoRouter
# ═══════════════════════════════════

## 🏗️ PAPKA STRUKTURASI (Mobile)

```
lib/
├── config/
│   ├── theme.dart           ← AppTheme (BARCHA ranglar)
│   ├── router.dart
│   └── env.dart
├── core/
│   ├── api/
│   │   ├── dio_client.dart
│   │   └── api_endpoints.dart
│   ├── error/
│   │   ├── failures.dart
│   │   └── exceptions.dart
│   └── utils/
├── features/
│   └── orders/
│       ├── data/datasources/
│       ├── data/models/
│       ├── data/repositories/
│       ├── domain/entities/
│       ├── domain/repositories/
│       └── presentation/
│           ├── providers/
│           ├── screens/
│           └── widgets/
├── shared/widgets/
│   ├── app_scaffold.dart
│   ├── order_card.dart
│   └── error_widget.dart
└── main.dart
```

## 🎨 DIZAYN STANDARTLARI — AppTheme (O'ZGARTIRILMAYDI)

```dart
// ✅ FAQAT AppTheme.* ishlatilsin
// ❌ const Color(0xFF...) — MUTLAQ TAQIQ

AppTheme.primary        // #6B46C1 — asosiy binafsha
AppTheme.accent         // #2DD4A8 — teal
AppTheme.textPrimary    // #1A1A2E
AppTheme.textSecondary  // #999999
AppTheme.textHint       // #BBBBBB
AppTheme.bgBody         // #FAF9FE
AppTheme.cardBg         // #FFFFFF
AppTheme.cardBorder     // #F0EEF5
AppTheme.errorColor     // #EF4444
AppTheme.successColor   // #16A34A
AppTheme.warningColor   // #F59E0B
AppTheme.walletGradient // binafsha gradient
AppTheme.testrGradient  // yashil gradient

// Radius
AppTheme.radiusSmall   // 8  — badge, pill
AppTheme.radiusMedium  // 12 — input, button
AppTheme.radiusLarge   // 16 — card
AppTheme.radiusXLarge  // 24 — bottom sheet, banner

// Spacing
AppTheme.spacingXS // 4
AppTheme.spacingS  // 8
AppTheme.spacingM  // 16
AppTheme.spacingL  // 24
AppTheme.spacingXL // 32

// Font: Outfit (GoogleFonts, theme orqali)
```

## 📱 SCREEN TEMPLATE — BARCHA ekranlar

```dart
import '../../config/theme.dart';
import '../../shared/widgets/app_scaffold.dart';

class XyzScreen extends ConsumerStatefulWidget {
  const XyzScreen({super.key});
  @override
  ConsumerState<XyzScreen> createState() => _XyzScreenState();
}

class _XyzScreenState extends ConsumerState<XyzScreen> {
  @override
  Widget build(BuildContext context) {
    final dataAsync = ref.watch(xyzProvider);
    return Scaffold(
      backgroundColor: AppTheme.bgBody,
      appBar: AppBar(
        // Tab screens: hamburger
        leading: IconButton(
          icon: const Icon(Icons.menu),
          onPressed: () =>
              ref.read(scaffoldKeyProvider).currentState?.openDrawer(),
        ),
        title: const Text('Sarlavha'),
      ),
      body: RefreshIndicator(
        color: AppTheme.primary,
        onRefresh: () => ref.refresh(xyzProvider.future),
        child: dataAsync.when(
          loading: () => const Center(
            child: CircularProgressIndicator(color: AppTheme.primary),
          ),
          error: (e, _) => Center(
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              const Icon(Icons.error_outline, color: AppTheme.errorColor, size: 48),
              Text(e.toString()),
              ElevatedButton(
                onPressed: () => ref.refresh(xyzProvider.future),
                child: const Text('Qayta yuklash'),
              ),
            ]),
          ),
          data: (items) => items.isEmpty
              ? const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.inbox_outlined, size: 48),
                  Text("Ma'lumot topilmadi"),
                ]))
              : ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (_, i) => ItemCard(item: items[i]),
                ),
        ),
      ),
    );
  }
}
```

## 🃏 ORDER CARD STANDARTLARI (O'ZGARTIRILMAYDI)

```dart
decoration: BoxDecoration(
  color: AppTheme.cardBg,
  borderRadius: BorderRadius.circular(AppTheme.radiusLarge),
  border: Border.all(color: AppTheme.cardBorder, width: 1),
  boxShadow: [BoxShadow(
    color: const Color(0x05000000), // MINIMAL
    blurRadius: 8, offset: const Offset(0, 2),
  )],
),

// Tarkib:
// 1. Sender:  CircleAvatar (initial) + ism + mashina badge
// 2. Route:   A (primary) → dotted → B (accent) + from/to
// 3. Info:    sana + og'irlik + scope badge
// 4. Bottom:  narx + "Qabul qilish" (FAQAT status == NEW)

// ❌ Gradient card backgroundda — TAQIQ
// ❌ Gradient faqat wallet va testr result
```

## 🔄 PROVIDER STANDARTLARI (Riverpod)

```dart
// ✅ AsyncValue pattern — MAJBURIY
@riverpod
Future<List<Order>> orders(OrdersRef ref) async {
  final result = await ref.read(ordersRepositoryProvider).getOrders();
  return result.fold((failure) => throw failure, (orders) => orders);
}

// ✅ Mavjud providerlar — QAYTA YARATMA
// ordersProvider        — Buyurtmalar
// acceptedOrdersProvider — Qabul qilinganlar
// balanceProvider        — Balans
// chatProvider           — Chat
// notificationsProvider  — Bildirishnomalar
// supportProvider        — Qo'llab-quvvatlash
// authStateProvider      — Foydalanuvchi
// scaffoldKeyProvider    — Drawer
```

## 🌐 REPOSITORY PATTERN

```dart
abstract class OrdersRepository {
  Future<Either<Failure, List<Order>>> getOrders();
  Future<Either<Failure, Order>> createOrder(CreateOrderDto dto);
}

sealed class Failure {
  const Failure(this.message);
  final String message;
}
class NetworkFailure extends Failure { const NetworkFailure(super.message); }
class ServerFailure  extends Failure { const ServerFailure(super.message); }
class CacheFailure   extends Failure { const CacheFailure(super.message); }
class AuthFailure    extends Failure { const AuthFailure(super.message); }
```

## 🧭 NAVIGATSIYA (O'ZGARTIRILMAYDI)

```dart
// Tab screens (bottom nav)
context.go('/orders');
context.go('/accepted');
context.go('/chat');
context.go('/balance');

// Drawer screens
context.push('/archive');
context.push('/notifications');
context.push('/support');
context.push('/subscribe');

// Drawer ochish
ref.read(scaffoldKeyProvider).currentState?.openDrawer();

// ❌ Navigator.push — TAQIQ
```

## 🔐 ROLE TEKSHIRISH — YAGONA STANDART

```dart
// ✅ FAQAT bu usul
final user = ref.read(authStateProvider).user;
if (user?.role.value == 'DRIVER') { ... }
if (user?.role.value == 'ADMIN')  { ... }

// ❌ user.isDriver — TAQIQ
// ❌ Turli joyda turlicha — TAQIQ
```

## 🔌 OFFLINE SUPPORT

```
✅ Hive local cache — list screens
✅ Optimistic UI — action buttons
✅ Sync on reconnect — connectivity_plus

Cache TTL:
orders list  → 5 min | order detail → 10 min
user profile → 30 min | balance → 1 min
```

## 🚫 FLUTTER TAQIQLAR — TO'LIQ RO'YXAT

```
❌ Color(0xFF...)             → AppTheme.*
❌ Kuchli shadows             → minimal yoki yo'q
❌ Card backgroundda gradient → faqat wallet/testr
❌ Mock data                  → real provider/API
❌ Navigator.push             → GoRouter
❌ setState provider o'rnida  → Riverpod
❌ print()                    → debugPrint()
❌ Inconsistent role check    → user?.role.value == 'X'
❌ Hardcoded string           → constants.dart
```

---
---

# ═══════════════════════════════════
# INFRASTRUCTURE & DEVOPS
# ═══════════════════════════════════

```
✅ CI/CD:          automated testing & deployment
✅ Analytics:      metrics tracking
✅ i18n:           infrastructure ready
✅ Monitoring:     Winston + Sentry + health checks
✅ Backup:         strategy & disaster recovery
✅ Code standards: ESLint, Prettier, Husky
✅ Docs:           Swagger, README per module, ADR
✅ Accessibility:  WCAG, keyboard nav, screen readers
✅ Performance:    code splitting, lazy loading, memoization
✅ UX:             error boundaries, toast, loading, offline
```
