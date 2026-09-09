import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_shell.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ELearningScreen extends StatefulWidget {
  const ELearningScreen({super.key});
  @override
  State<ELearningScreen> createState() => _ELearningScreenState();
}

class _ELearningScreenState extends State<ELearningScreen> {
  final _api = ApiService();
  List _materials = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final r = await _api.getELearning();
      setState(() { _materials = r.data['data'] ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  Future<void> _delete(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Material'),
        content: const Text('Delete this e-learning material?'),
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
      await _api.deleteELearning(id);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _showCreateDialog() {
    final titleCtrl = TextEditingController();
    final authorCtrl = TextEditingController();
    final urlCtrl = TextEditingController();
    String? selectedType = 'document';
    final types = ['document', 'video', 'audio'];

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Add E-Learning Material'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title')),
                const SizedBox(height: 8),
                TextField(controller: authorCtrl, decoration: const InputDecoration(labelText: 'Author')),
                const SizedBox(height: 8),
                TextField(controller: urlCtrl, decoration: const InputDecoration(labelText: 'URL or Link')),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: selectedType,
                  decoration: const InputDecoration(labelText: 'Material Type'),
                  items: types.map((t) => DropdownMenuItem(value: t, child: Text(t))).toList(),
                  onChanged: (v) => setDialogState(() => selectedType = v),
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
                  await _api.createELearning({
                    'title': titleCtrl.text,
                    'author': authorCtrl.text,
                    'url': urlCtrl.text,
                    'material_type': selectedType,
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
      currentRoute: '/elearning',
      floatingActionButton: isAdmin
          ? FloatingActionButton(onPressed: _showCreateDialog, child: const Icon(Icons.add))
          : null,
      child: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _load,
              child: _materials.isEmpty
                  ? const Center(child: Text('No e-learning materials found'))
                  : GridView.builder(
                      padding: const EdgeInsets.all(16),
                      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                        maxCrossAxisExtent: 320,
                        childAspectRatio: 1.1,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                      ),
                      itemCount: _materials.length,
                      itemBuilder: (_, i) {
                        final m = _materials[i];
                        return Card(
                          clipBehavior: Clip.antiAlias,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Stack(
                                children: [
                                  Container(
                                    height: 80,
                                    width: double.infinity,
                                    color: AppTheme.primary.withValues(alpha: 0.1),
                                    child: Center(
                                      child: Icon(
                                        m['material_type'] == 'video' ? Icons.play_circle
                                            : m['material_type'] == 'audio' ? Icons.headphones
                                            : Icons.article,
                                        size: 40,
                                        color: AppTheme.primary,
                                      ),
                                    ),
                                  ),
                                  if (isAdmin)
                                    Positioned(
                                      top: 4,
                                      right: 4,
                                      child: CircleAvatar(
                                        radius: 14,
                                        backgroundColor: Colors.red.withValues(alpha: 0.85),
                                        child: IconButton(
                                          icon: const Icon(Icons.delete, size: 14, color: Colors.white),
                                          padding: EdgeInsets.zero,
                                          onPressed: () => _delete(m['id']),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              Padding(
                                padding: const EdgeInsets.all(12),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      m['title'] ?? '',
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                    ),
                                    const SizedBox(height: 4),
                                    if (m['author'] != null)
                                      Text(m['author'], style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary)),
                                    if (m['category'] != null)
                                      Text(m['category'], style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
