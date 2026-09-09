import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DocumentsScreen extends StatefulWidget {
  final int? cooperativeId;
  final int? familyId;
  final String title;

  const DocumentsScreen({
    super.key, 
    this.cooperativeId, 
    this.familyId,
    required this.title
  });

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  final _apiService = ApiService();
  bool _isLoading = true;
  List<dynamic> _documents = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchDocuments();
  }

  Future<void> _fetchDocuments() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = widget.familyId != null 
          ? await _apiService.getFamilyDocuments(widget.familyId!)
          : await _apiService.getCooperativeDocuments(widget.cooperativeId!);

      if (response.data['success']) {
        setState(() {
          _documents = response.data['data'];
        });
      } else {
        setState(() {
          _errorMessage = response.data['message'];
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
  
  Future<void> _deleteDocument(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Document'),
        content: const Text('Are you sure you want to delete this document?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true), 
            child: const Text('Delete')
          ),
        ],
      )
    );
    
    if (confirm != true) return;
    
    try {
      final response = widget.familyId != null
          ? await _apiService.deleteFamilyDocument(id)
          : await _apiService.deleteCooperativeDocument(id);
          
      if (response.data['success']) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Document deleted')));
        _fetchDocuments();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Delete failed: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.title)),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Open upload dialog
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Upload dialog not implemented yet')));
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _fetchDocuments, child: const Text('Retry'))
          ],
        )
      );
    }
    
    if (_documents.isEmpty) {
      return const Center(child: Text('No documents found.'));
    }
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _documents.length,
      itemBuilder: (context, index) {
        final doc = _documents[index];
        return Card(
          child: ListTile(
            leading: const Icon(Icons.description, color: Colors.blue, size: 40),
            title: Text(doc['title'] ?? 'Untitled'),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Type: ${doc['type_name'] ?? 'Unknown'}'),
                if (doc['date'] != null) Text('Date: ${doc['date']}'),
              ],
            ),
            trailing: IconButton(
              icon: const Icon(Icons.delete, color: Colors.red),
              onPressed: () => _deleteDocument(doc['id']),
            ),
          ),
        );
      },
    );
  }
}
