import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_shell.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class EvaluationsScreen extends StatefulWidget {
  const EvaluationsScreen({super.key});
  @override
  State<EvaluationsScreen> createState() => _EvaluationsScreenState();
}

class _EvaluationsScreenState extends State<EvaluationsScreen> {
  final _api = ApiService();
  List _evals = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final r = await _api.getEvaluations();
      setState(() { _evals = r.data['data'] ?? []; _loading = false; });
    } catch (e) { setState(() { _error = e.toString(); _loading = false; }); }
  }

  Future<void> _delete(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Evaluation'),
        content: const Text('Are you sure you want to delete this evaluation?'),
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
      await _api.deleteEvaluation(id);
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
    }
  }

  void _showCreateDialog() {
    final memberIdCtrl = TextEditingController();
    final scoreCtrl = TextEditingController();
    final periodCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Evaluation'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: memberIdCtrl, decoration: const InputDecoration(labelText: 'Member ID'), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              TextField(controller: scoreCtrl, decoration: const InputDecoration(labelText: 'Total Score'), keyboardType: TextInputType.number),
              const SizedBox(height: 8),
              TextField(controller: periodCtrl, decoration: const InputDecoration(labelText: 'Evaluation Period (e.g. Q1 2026)')),
              const SizedBox(height: 8),
              TextField(controller: notesCtrl, decoration: const InputDecoration(labelText: 'Notes'), maxLines: 2),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (memberIdCtrl.text.isEmpty || scoreCtrl.text.isEmpty) return;
              Navigator.pop(ctx);
              try {
                await _api.createEvaluation({
                  'member_id': int.parse(memberIdCtrl.text),
                  'total_score': double.parse(scoreCtrl.text),
                  'evaluation_period': periodCtrl.text,
                  'notes': notesCtrl.text,
                });
                _load();
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isAdmin = ['admin', 'leader'].contains(auth.currentUser?['role']);

    return AppShell(
      currentRoute: '/evaluations',
      floatingActionButton: isAdmin
          ? FloatingActionButton(onPressed: _showCreateDialog, child: const Icon(Icons.add))
          : null,
      child: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_error!, style: const TextStyle(color: Colors.red)),
                    ElevatedButton(onPressed: _load, child: const Text('Retry')),
                  ],
                ))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: _evals.isEmpty
                      ? const Center(child: Text('No evaluations found'))
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _evals.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (_, i) {
                            final e = _evals[i];
                            final statusColor = e['status'] == 'Approved' ? AppTheme.success : AppTheme.warning;
                            return Card(
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                                  child: const Icon(Icons.assessment, color: AppTheme.primary),
                                ),
                                title: Text('${e['member_name'] ?? 'Unknown'} - Score: ${e['total_score']}'),
                                subtitle: Text('${e['evaluation_period']} • by ${e['evaluator_name'] ?? 'N/A'}'),
                                trailing: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: statusColor.withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(e['status'] ?? '', style: TextStyle(color: statusColor, fontSize: 12, fontWeight: FontWeight.w600)),
                                    ),
                                    if (isAdmin) ...[
                                      const SizedBox(width: 4),
                                      IconButton(
                                        icon: const Icon(Icons.delete, color: Colors.red, size: 20),
                                        onPressed: () => _delete(e['id']),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                ),
    );
  }
}
