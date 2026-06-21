import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:intl/intl.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../config/silk_theme.dart';
import '../../config/strings.dart';
import '../../core/data/uzbekistan_cities.dart';
import '../../core/models/order.dart';
import '../../widgets/app_scaffold.dart';
import '../orders/orders_provider.dart';
import 'map_provider.dart';

String _timeAgo(DateTime? d) {
  if (d == null) return '';
  final diff = DateTime.now().difference(d);
  if (diff.inMinutes < 1) return 'hozirgina';
  if (diff.inMinutes < 60) return '${diff.inMinutes} min';
  if (diff.inHours < 24) return '${diff.inHours} soat';
  return DateFormat('dd.MM HH:mm').format(d);
}

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final MapController _mapController = MapController();
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(mapProvider.notifier).loadMapData();
      ref.read(mapProvider.notifier).startAutoRefresh();
      ref.listenManual(mapProvider, (prev, next) {
        if (prev?.routeInfo == null &&
            next.routeInfo != null &&
            next.routeInfo!.points.length >= 2) {
          try {
            final bounds = LatLngBounds.fromPoints(next.routeInfo!.points);
            _mapController.fitCamera(
              CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(60)),
            );
          } catch (_) {}
        }
      });
    });
  }

  @override
  void dispose() {
    ref.read(mapProvider.notifier).stopAutoRefresh();
    _mapController.dispose();
    super.dispose();
  }

  void _onClusterTap(CityCluster cluster) {
    _mapController.move(cluster.coord, 9);
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _ClusterSheet(
        cluster: cluster,
        onOrderTap: (order) {
          Navigator.of(ctx).pop();
          Future.delayed(const Duration(milliseconds: 250), () {
            if (mounted) ref.read(mapProvider.notifier).selectOrder(order);
          });
        },
      ),
    );
  }

  void _clearRoute() {
    ref.read(mapProvider.notifier).selectOrder(null);
    _mapController.move(const LatLng(41.0, 64.5), 5.8);
  }

  Future<void> _acceptOrder(Order order) async {
    try {
      await ref.read(ordersProvider.notifier).acceptOrder(order.id);
      if (mounted) {
        _clearRoute();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Buyurtma qabul qilindi!'),
            backgroundColor: SilkTheme.successOf(context),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Xato: $e'),
            backgroundColor: SilkTheme.dangerOf(context),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final ms = ref.watch(mapProvider);
    final isDark = SilkTheme.isDark(context);
    final showRoute = ms.hasRoute;
    final selected = ms.selectedOrder;

    return Scaffold(
      backgroundColor: SilkTheme.bgOf(context),
      appBar: AppBar(
        backgroundColor: SilkTheme.bgOf(context),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: Icon(Icons.menu, color: SilkTheme.inkOf(context)),
          onPressed: () =>
              ref.read(scaffoldKeyProvider).currentState?.openDrawer(),
        ),
        title: Text(AppStrings.harita, style: SilkTheme.screenTitle(context)),
        actions: [
          if (ms.isLoading || ms.routeLoading)
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: SilkTheme.brandOf(context),
                ),
              ),
            )
          else
            IconButton(
              icon: Icon(Icons.refresh, color: SilkTheme.inkOf(context)),
              onPressed: () => ref.read(mapProvider.notifier).loadMapData(),
            ),
        ],
      ),
      body: Stack(
        children: [
          // ═══ Haqiqiy xarita (flutter_map + CartoDB) ═══
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: const LatLng(41.0, 64.5),
              initialZoom: 5.8,
              minZoom: 4,
              maxZoom: 15,
            ),
            children: [
              TileLayer(
                urlTemplate: isDark
                    ? 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
                    : 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
                userAgentPackageName: 'com.yolda.app',
              ),
              if (showRoute)
                PolylineLayer(polylines: [
                  Polyline(
                    points: ms.routeInfo!.points,
                    color: SilkTheme.brandOf(context),
                    strokeWidth: 4,
                  ),
                ]),
              if (showRoute)
                MarkerLayer(markers: _routeEndpoints(ms))
              else ...[
                MarkerLayer(markers: _clusterMarkers(ms)),
                if (_filter == 'all' || _filter == 'online')
                  MarkerLayer(markers: _onlineMarkers(ms)),
              ],
            ],
          ),

          // ═══ Order detail card (xarita ustida) ═══
          if (selected != null)
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: _RouteDetailCard(
                order: selected,
                route: ms.routeInfo,
                loading: ms.routeLoading,
                onClose: _clearRoute,
                onAccept: () => _acceptOrder(selected),
                onCall:
                    selected.phone != null ? () => _callPhone(selected.phone!) : null,
              ),
            ),

          // ═══ Filter + Legend ═══
          if (!showRoute && selected == null) ...[
            Positioned(
              top: 12,
              left: 12,
              right: 12,
              child: _filterChips(ms),
            ),
            Positioned(
              bottom: 16,
              left: 16,
              right: 16,
              child: _legend(context),
            ),
          ],
        ],
      ),
    );
  }

  void _callPhone(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) await launchUrl(uri);
  }

  // ═══ ROUTE ENDPOINTS ═══
  List<Marker> _routeEndpoints(MapState ms) {
    final o = ms.selectedOrder!;
    final from = findCityCoord(o.cargoFrom);
    final to = findCityCoord(o.cargoTo);
    return [
      if (from != null)
        Marker(
          point: from,
          width: 86,
          height: 46,
          child: _pinLabel(o.cargoFrom ?? 'A', SilkTheme.brandOf(context)),
        ),
      if (to != null)
        Marker(
          point: to,
          width: 86,
          height: 46,
          child: _pinLabel(o.cargoTo ?? 'B', SilkTheme.accentOf(context)),
        ),
    ];
  }

  Widget _pinLabel(String text, Color color) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
            ),
            child: Text(
              text,
              overflow: TextOverflow.ellipsis,
              style: SilkTheme.body(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
          Icon(Icons.location_on, color: color, size: 22),
        ],
      );

  // ═══ CLUSTER MARKERS (Silk Road colored) ═══
  List<Marker> _clusterMarkers(MapState ms) {
    return ms.clusters.map((c) {
      List<Order> orders = c.orders;
      if (_filter == 'cargo') {
        orders = orders.where((o) => o.type == OrderType.cargo).toList();
      } else if (_filter == 'driver') {
        orders = orders.where((o) => o.type == OrderType.driver).toList();
      }
      if (orders.isEmpty) return null;
      final count = orders.length;
      final sz = count > 50
          ? 52.0
          : count > 20
              ? 44.0
              : count > 5
                  ? 38.0
                  : 32.0;
      final hasDriver = orders.any((o) => o.type == OrderType.driver);
      final hasCargo = orders.any((o) => o.type == OrderType.cargo);
      final color = hasDriver && hasCargo
          ? SilkTheme.brandOf(context)
          : hasDriver
              ? SilkTheme.accentOf(context)
              : SilkTheme.brandOf(context);
      return Marker(
        point: c.coord,
        width: sz + 20,
        height: sz + 14,
        child: GestureDetector(
          onTap: () => _onClusterTap(
              CityCluster(cityName: c.cityName, coord: c.coord, orders: orders)),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: sz,
                height: sz,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(
                    colors: [color, color.withOpacity(0.75)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  border: Border.all(
                    color: SilkTheme.surfaceOf(context),
                    width: 2,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: color.withOpacity(0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Text(
                  '$count',
                  style: SilkTheme.display(
                    fontSize: count > 9 ? 13 : 14,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
              Text(
                c.cityName,
                overflow: TextOverflow.ellipsis,
                style: SilkTheme.body(
                  fontSize: 9,
                  fontWeight: FontWeight.w600,
                  color: SilkTheme.inkOf(context),
                ),
              ),
            ],
          ),
        ),
      );
    }).whereType<Marker>().toList();
  }

  // ═══ ONLINE MARKERS (silk success + pulse ring) ═══
  List<Marker> _onlineMarkers(MapState ms) =>
      ms.onlineDrivers.map((d) {
        final success = SilkTheme.successOf(context);
        return Marker(
          point: LatLng(d.lat, d.lng),
          width: 40,
          height: 40,
          child: Tooltip(
            message: '${d.fullName ?? 'Haydovchi'} • ${d.vehicleType ?? ''}',
            child: _OnlinePulse(color: success),
          ),
        );
      }).toList();

  // ═══ FILTER CHIPS (Silk pill) ═══
  Widget _filterChips(MapState ms) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _chip('Barchasi', 'all'),
          const SizedBox(width: 6),
          _chip('Yuklar', 'cargo'),
          const SizedBox(width: 6),
          _chip('Haydovchilar', 'driver'),
          const SizedBox(width: 6),
          _chip('Online', 'online'),
        ],
      ),
    );
  }

  Widget _chip(String label, String key) {
    final on = _filter == key;
    final ink = SilkTheme.inkOf(context);
    final bg = SilkTheme.bgOf(context);
    return GestureDetector(
      onTap: () => setState(() => _filter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 9),
        decoration: BoxDecoration(
          color:
              on ? ink : SilkTheme.surfaceOf(context).withOpacity(0.94),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: on ? ink : SilkTheme.borderOf(context),
            width: 1,
          ),
        ),
        child: Text(
          label,
          style: SilkTheme.body(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color: on ? bg : SilkTheme.mutedOf(context),
          ),
        ),
      ),
    );
  }

  Widget _legend(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: SilkTheme.surfaceOf(context).withOpacity(0.92),
            borderRadius: BorderRadius.circular(16),
            border:
                Border.all(color: SilkTheme.borderOf(context), width: 1),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _legendItem(
                color: SilkTheme.inkOf(context),
                label: "E'lonlar",
                value: '${ref.watch(mapProvider).clusters.fold<int>(0, (a, b) => a + b.orders.length)}',
              ),
              Container(
                width: 1,
                height: 12,
                margin: const EdgeInsets.symmetric(horizontal: 14),
                color: SilkTheme.borderOf(context),
              ),
              _legendItem(
                color: SilkTheme.successOf(context),
                label: 'Online',
                value: '${ref.watch(mapProvider).onlineDrivers.length}',
                pulse: true,
              ),
            ],
          ),
        ),
        Material(
          color: SilkTheme.surfaceOf(context).withOpacity(0.92),
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: () => _mapController.move(const LatLng(41.0, 64.5), 5.8),
            child: Container(
              width: 42,
              height: 42,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: SilkTheme.borderOf(context),
                  width: 1,
                ),
              ),
              child: Icon(
                Icons.my_location,
                size: 16,
                color: SilkTheme.inkOf(context),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _legendItem({
    required Color color,
    required String label,
    required String value,
    bool pulse = false,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (pulse)
          _OnlinePulse(color: color, size: 10, iconSize: 0)
        else
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
        const SizedBox(width: 6),
        Text(
          label,
          style: SilkTheme.body(
            fontSize: 11,
            color: SilkTheme.mutedOf(context),
          ),
        ),
        const SizedBox(width: 6),
        Text(
          value,
          style: SilkTheme.mono(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: SilkTheme.inkOf(context),
          ),
        ),
      ],
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// Online pulse dot
// ═══════════════════════════════════════════════════════════════

class _OnlinePulse extends StatefulWidget {
  final Color color;
  final double size;
  final double iconSize;
  const _OnlinePulse({
    required this.color,
    this.size = 22,
    this.iconSize = 18,
  });

  @override
  State<_OnlinePulse> createState() => _OnlinePulseState();
}

class _OnlinePulseState extends State<_OnlinePulse>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size * 1.6,
      height: widget.size * 1.6,
      child: Stack(
        alignment: Alignment.center,
        children: [
          AnimatedBuilder(
            animation: _ctrl,
            builder: (_, __) {
              final t = _ctrl.value;
              return Transform.scale(
                scale: 0.9 + (2.4 - 0.9) * t,
                child: Opacity(
                  opacity: (0.6 * (1 - t)).clamp(0.0, 1.0),
                  child: Container(
                    width: widget.size,
                    height: widget.size,
                    decoration: BoxDecoration(
                      color: widget.color,
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
              );
            },
          ),
          Container(
            width: widget.size,
            height: widget.size,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: widget.color,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: widget.color.withOpacity(0.4),
                  blurRadius: 8,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: widget.iconSize > 0
                ? Icon(Icons.directions_car,
                    size: widget.iconSize, color: Colors.white)
                : null,
          ),
        ],
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// ROUTE DETAIL CARD (xarita ustida)
// ═══════════════════════════════════════════════════════════════

class _RouteDetailCard extends StatelessWidget {
  final Order order;
  final RouteInfo? route;
  final bool loading;
  final VoidCallback onClose;
  final VoidCallback onAccept;
  final VoidCallback? onCall;

  const _RouteDetailCard({
    required this.order,
    this.route,
    this.loading = false,
    required this.onClose,
    required this.onAccept,
    this.onCall,
  });

  @override
  Widget build(BuildContext context) {
    final isDriver = order.type == OrderType.driver;
    final typeColor = isDriver
        ? SilkTheme.accentOf(context)
        : SilkTheme.brandOf(context);

    return Container(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.52,
      ),
      decoration: BoxDecoration(
        color: SilkTheme.surfaceOf(context),
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        border: Border.all(color: SilkTheme.borderOf(context), width: 1),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(SilkTheme.radiusCard),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: typeColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Icon(
                      isDriver
                          ? Icons.local_shipping_rounded
                          : Icons.inventory_2_rounded,
                      size: 13,
                      color: typeColor,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      isDriver ? 'Haydovchi' : 'Yuk',
                      style: SilkTheme.body(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: typeColor,
                      ),
                    ),
                  ]),
                ),
                if (order.vehicleType != null) ...[
                  const SizedBox(width: 8),
                  Text(
                    order.vehicleType!,
                    style: SilkTheme.body(
                      fontSize: 11,
                      color: SilkTheme.mutedOf(context),
                    ),
                  ),
                ],
                if (order.messageDate != null) ...[
                  const SizedBox(width: 8),
                  Text(
                    _timeAgo(order.messageDate),
                    style: SilkTheme.body(
                      fontSize: 10,
                      color: SilkTheme.muted2Of(context),
                    ),
                  ),
                ],
                if (order.scope == OrderScope.import_ ||
                    order.scope == OrderScope.export_) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: SilkTheme.accent2Of(context).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Text(
                      order.scope == OrderScope.import_
                          ? 'Import'
                          : 'Eksport',
                      style: SilkTheme.body(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: SilkTheme.accentOf(context),
                      ),
                    ),
                  ),
                ],
                const Spacer(),
                GestureDetector(
                  onTap: onClose,
                  child: Container(
                    width: 28,
                    height: 28,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: SilkTheme.softOf(context),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.close_rounded,
                      size: 16,
                      color: SilkTheme.mutedOf(context),
                    ),
                  ),
                ),
              ]),
              const SizedBox(height: 14),

              // Route card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: SilkTheme.softOf(context),
                  borderRadius: BorderRadius.circular(SilkTheme.radiusRoute),
                  border:
                      Border.all(color: SilkTheme.borderOf(context), width: 1),
                ),
                child: Column(
                  children: [
                    _routeRow(context, order.cargoFrom ?? '—',
                        SilkTheme.brandOf(context), false),
                    Padding(
                      padding: const EdgeInsets.only(left: 5),
                      child: Row(children: [
                        Column(
                          children: [
                            for (int i = 0; i < 3; i++)
                              Container(
                                width: 2,
                                height: 4,
                                margin: const EdgeInsets.only(bottom: 2),
                                color: SilkTheme.borderOf(context),
                              ),
                          ],
                        ),
                        const SizedBox(width: 12),
                        if (loading)
                          Row(mainAxisSize: MainAxisSize.min, children: [
                            SizedBox(
                              width: 12,
                              height: 12,
                              child: CircularProgressIndicator(
                                strokeWidth: 1.5,
                                color: SilkTheme.brandOf(context),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              "Yo'l hisoblanmoqda...",
                              style: SilkTheme.body(
                                fontSize: 11,
                                color: SilkTheme.muted2Of(context),
                              ),
                            ),
                          ])
                        else if (route != null)
                          Row(mainAxisSize: MainAxisSize.min, children: [
                            _routeChip(
                              Icons.route_rounded,
                              route!.distanceText,
                              SilkTheme.brandOf(context),
                            ),
                            const SizedBox(width: 6),
                            _routeChip(
                              Icons.schedule_rounded,
                              route!.durationText,
                              SilkTheme.mutedOf(context),
                            ),
                          ]),
                      ]),
                    ),
                    _routeRow(context, order.cargoTo ?? '—',
                        SilkTheme.accentOf(context), true),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Tags
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  if (order.price != null)
                    _tag(context, order.price!, SilkTheme.successOf(context)),
                  if (order.cargoWeight != null) _tag(context, order.cargoWeight!),
                  if (order.vehicleCapacity != null)
                    _tag(context, order.vehicleCapacity!),
                  if (order.cargoType != null) _tag(context, order.cargoType!),
                  if (order.senderName != null) _tag(context, order.senderName!),
                ],
              ),

              if (order.messageText.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(
                  order.messageText,
                  maxLines: 5,
                  overflow: TextOverflow.ellipsis,
                  style: SilkTheme.body(
                    fontSize: 12,
                    color: SilkTheme.mutedOf(context),
                    height: 1.5,
                  ),
                ),
              ],
              const SizedBox(height: 14),

              // Action buttons
              Row(
                children: [
                  if (onCall != null)
                    Expanded(
                      child: SizedBox(
                        height: 42,
                        child: OutlinedButton.icon(
                          onPressed: onCall,
                          icon: const Icon(Icons.phone_rounded, size: 16),
                          label: Text(
                            order.phone ?? '',
                            style: SilkTheme.body(fontSize: 12),
                          ),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: SilkTheme.inkOf(context),
                            backgroundColor: SilkTheme.surfaceOf(context),
                            side: BorderSide(
                              color: SilkTheme.borderOf(context),
                              width: 1,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.circular(SilkTheme.radiusBtn),
                            ),
                          ),
                        ),
                      ),
                    ),
                  if (onCall != null) const SizedBox(width: 8),
                  Expanded(
                    child: SizedBox(
                      height: 42,
                      child: ElevatedButton.icon(
                        onPressed: onAccept,
                        icon: const Icon(Icons.check_rounded, size: 16),
                        label: Text(
                          'Qabul qilish',
                          style: SilkTheme.body(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: SilkTheme.bgOf(context),
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: SilkTheme.inkOf(context),
                          foregroundColor: SilkTheme.bgOf(context),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(999),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _routeRow(
      BuildContext context, String city, Color dotColor, bool isEnd) {
    return Row(children: [
      Container(
        width: 11,
        height: 11,
        decoration: BoxDecoration(
          color: dotColor,
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(color: dotColor.withOpacity(0.3), blurRadius: 4),
          ],
        ),
      ),
      const SizedBox(width: 10),
      Expanded(
        child: Text(
          city,
          style: SilkTheme.cardCity(context),
        ),
      ),
    ]);
  }

  Widget _routeChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 3),
        Text(
          text,
          style: SilkTheme.body(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: color,
          ),
        ),
      ]),
    );
  }

  Widget _tag(BuildContext context, String text, [Color? color]) {
    final c = color ?? SilkTheme.mutedOf(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: c.withOpacity(0.10),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        text,
        style: SilkTheme.body(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: c,
        ),
      ),
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// CLUSTER BOTTOM SHEET
// ═══════════════════════════════════════════════════════════════

class _ClusterSheet extends StatelessWidget {
  final CityCluster cluster;
  final ValueChanged<Order> onOrderTap;

  const _ClusterSheet({required this.cluster, required this.onOrderTap});

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.5,
      minChildSize: 0.2,
      maxChildSize: 0.85,
      builder: (context, sc) => Container(
        decoration: BoxDecoration(
          color: SilkTheme.bgOf(context),
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(SilkTheme.radiusHero),
          ),
        ),
        child: Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: SilkTheme.muted2Of(context),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 4),
              child: Row(children: [
                Icon(Icons.location_on,
                    color: SilkTheme.brandOf(context), size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    cluster.cityName,
                    style: SilkTheme.screenTitle(context),
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: SilkTheme.brandOf(context).withOpacity(0.10),
                    borderRadius: BorderRadius.circular(SilkTheme.radiusSmall),
                  ),
                  child: Text(
                    '${cluster.orders.length} ta',
                    style: SilkTheme.body(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: SilkTheme.brandOf(context),
                    ),
                  ),
                ),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
              child: Row(children: [
                _dot(context, 'Yuk', cluster.cargoCount,
                    SilkTheme.brandOf(context)),
                const SizedBox(width: 12),
                _dot(context, 'Haydovchi', cluster.driverCount,
                    SilkTheme.accentOf(context)),
              ]),
            ),
            Divider(color: SilkTheme.borderOf(context), height: 1),
            Expanded(
              child: ListView.separated(
                controller: sc,
                padding: const EdgeInsets.all(16),
                itemCount: cluster.orders.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (_, i) {
                  final o = cluster.orders[i];
                  final isD = o.type == OrderType.driver;
                  final col = isD
                      ? SilkTheme.accentOf(context)
                      : SilkTheme.brandOf(context);
                  return Material(
                    color: SilkTheme.surfaceOf(context),
                    borderRadius: BorderRadius.circular(SilkTheme.radiusLarge),
                    child: InkWell(
                      borderRadius:
                          BorderRadius.circular(SilkTheme.radiusLarge),
                      onTap: () => onOrderTap(o),
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          borderRadius:
                              BorderRadius.circular(SilkTheme.radiusLarge),
                          border: Border.all(
                              color: SilkTheme.borderOf(context), width: 1),
                        ),
                        child: Row(children: [
                          Container(
                            width: 36,
                            height: 36,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: col.withOpacity(0.12),
                              borderRadius: BorderRadius.circular(
                                  SilkTheme.radiusSmall),
                            ),
                            child: Icon(
                              isD ? Icons.local_shipping : Icons.inventory_2,
                              size: 18,
                              color: col,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${o.cargoFrom ?? '—'} → ${o.cargoTo ?? '—'}',
                                  style: SilkTheme.body(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: SilkTheme.inkOf(context),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Row(children: [
                                  if (o.vehicleType != null)
                                    Text(
                                      o.vehicleType!,
                                      style: SilkTheme.body(
                                        fontSize: 11,
                                        color: SilkTheme.muted2Of(context),
                                      ),
                                    ),
                                  if (o.vehicleType != null && o.price != null)
                                    Text(' • ',
                                        style: SilkTheme.body(
                                          fontSize: 11,
                                          color: SilkTheme.muted2Of(context),
                                        )),
                                  if (o.price != null)
                                    Text(
                                      o.price!,
                                      style: SilkTheme.body(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: SilkTheme.brandOf(context),
                                      ),
                                    ),
                                  if (o.messageDate != null) ...[
                                    const Spacer(),
                                    Text(
                                      _timeAgo(o.messageDate),
                                      style: SilkTheme.body(
                                        fontSize: 10,
                                        color: SilkTheme.muted2Of(context),
                                      ),
                                    ),
                                  ],
                                ]),
                              ],
                            ),
                          ),
                          Icon(Icons.chevron_right,
                              size: 18,
                              color: SilkTheme.muted2Of(context)),
                        ]),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _dot(BuildContext context, String t, int n, Color c) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: c, shape: BoxShape.circle),
          ),
          const SizedBox(width: 4),
          Text(
            '$t: $n',
            style: SilkTheme.body(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: c,
            ),
          ),
        ],
      );
}
