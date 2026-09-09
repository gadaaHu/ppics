import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_shell.dart';

class HierarchyScreen extends StatefulWidget {
  const HierarchyScreen({super.key});
  @override
  State<HierarchyScreen> createState() => _HierarchyScreenState();
}

class _HierarchyScreenState extends State<HierarchyScreen> {
  final _api = ApiService();
  List _hierarchy = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final r = await _api.getHierarchy();
      setState(() { _hierarchy = r.data['data'] ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return AppShell(
      currentRoute: '/hierarchy',
      child: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: _hierarchy.isEmpty
                  ? const Center(child: Text('No hierarchy data found'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _hierarchy.length,
                      itemBuilder: (_, di) {
                        final district = _hierarchy[di];
                        final cooperatives = district['cooperatives'] as List? ?? [];
                        return ExpansionTile(
                          leading: const Icon(Icons.location_city, color: AppTheme.primary),
                          title: Text(
                            district['district_name'] ?? 'District',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          subtitle: Text('${cooperatives.length} Cooperatives'),
                          children: cooperatives.map<Widget>((coop) {
                            final families = coop['families'] as List? ?? [];
                            return Padding(
                              padding: const EdgeInsets.only(left: 20),
                              child: ExpansionTile(
                                leading: const Icon(Icons.people, color: AppTheme.accent),
                                title: Text(coop['cooperative_name'] ?? 'Cooperative'),
                                subtitle: Text('${families.length} Families'),
                                children: families.map<Widget>((fam) {
                                  final members = fam['members'] as List? ?? [];
                                  return Padding(
                                    padding: const EdgeInsets.only(left: 20),
                                    child: ListTile(
                                      dense: true,
                                      leading: const Icon(Icons.family_restroom, size: 18, color: AppTheme.accent),
                                      title: Text(fam['family_name'] ?? 'Family'),
                                      subtitle: Text('${members.length} members'),
                                    ),
                                  );
                                }).toList(),
                              ),
                            );
                          }).toList(),
                        );
                      },
                    ),
            ),
    );
  }
}
