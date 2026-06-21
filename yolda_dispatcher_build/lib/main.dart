import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'config/theme.dart';
import 'app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: YoldaDispatcherApp()));
}

class YoldaDispatcherApp extends StatelessWidget {
  const YoldaDispatcherApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: "Yo'lda Dispatcher",
      theme: AppTheme.light,
      debugShowCheckedModeBanner: false,
      routerConfig: appRouter,
    );
  }
}
