/// Ilova rejimi — dispatcher yoki driver
enum AppMode { dispatcher, driver }

/// Global ilova rejimi
AppMode appMode = AppMode.dispatcher;

bool get isDriverApp => appMode == AppMode.driver;
bool get isDispatcherApp => appMode == AppMode.dispatcher;
