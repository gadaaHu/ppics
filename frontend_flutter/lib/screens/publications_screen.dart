import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_shell.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class PublicationsScreen extends StatefulWidget {
  const PublicationsScreen({super.key});
  @override
  State<PublicationsScreen> createState() => _PublicationsScreenState();
}

class _PublicationsScreenState extends State<PublicationsScreen> {
  final _api = ApiService();
  List _pubs = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final r = await _api.getPublications();
      setState(() { _pubs = r.data['data'] ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  Future<void> _delete(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Publication'),
        content: const Text('Delete this publication?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm != true) return;
    try {
      await _api.deletePublication(id);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _showCreateDialog() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final authorCtrl = TextEditingController();
    String? selectedLang = 'Amharic';
    final langs = ['Amharic', 'Afaan Oromo', 'English', 'Other'];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Add Publication'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title')),
                const SizedBox(height: 8),
                TextField(controller: authorCtrl, decoration: const InputDecoration(labelText: 'Author')),
                const SizedBox(height: 8),
                TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Description'), maxLines: 2),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: selectedLang,
                  decoration: const InputDecoration(labelText: 'Language'),
                  items: langs.map((l) => DropdownMenuItem(value: l, child: Text(l))).toList(),
                  onChanged: (v) => setDialogState(() => selectedLang = v),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                if (titleCtrl.text.isEmpty) return;
                Navigator.pop(ctx);
                try {
                  await _api.createPublication({
                    'title': titleCtrl.text,
                    'description': descCtrl.text,
                    'author': authorCtrl.text,
                    'language': selectedLang,
                  });
                  _load();
                } catch (e) {
                  if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isAdmin = ['admin', 'leader'].contains(auth.currentUser?['role']);

    return AppShell(
      currentRoute: '/publications',
      floatingActionButton: isAdmin
          ? FloatingActionButton(onPressed: _showCreateDialog, child: const Icon(Icons.add))
          : null,
      child: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: _pubs.isEmpty
                  ? const Center(child: Text('No publications found'))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _pubs.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (_, i) {
                        final p = _pubs[i];
                        return Card(
                          child: ListTile(
                            leading: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.orange.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(Icons.picture_as_pdf, color: Colors.orange),
                            ),
                            title: Text(p['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (p['description'] != null)
                                  Text(p['description'], maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12)),
                                Row(
                                  children: [
                                    if (p['category'] != null) Text('• ${p['category']}', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                    const SizedBox(width: 8),
                                    if (p['language'] != null) Text('• ${p['language']}', style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                  ],
                                ),
                              ],
                            ),
                            isThreeLine: true,
                            trailing: isAdmin
                                ? IconButton(
                                    icon: const Icon(Icons.delete, color: Colors.red, size: 20),
                                    onPressed: () => _delete(p['id']),
                                  )
                                : null,
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
