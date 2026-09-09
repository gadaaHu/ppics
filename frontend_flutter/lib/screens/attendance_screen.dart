import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_shell.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final _apiService = ApiService();
  bool _isLoading = true;
  bool _isScanning = false;
  List<dynamic> _attendance = [];
  Map<String, dynamic>? _stats;
  String? _errorMessage;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final statsResp = await _apiService.getAttendanceStats();
      if (statsResp.data['success']) {
        _stats = statsResp.data['data'];
      }

      final recordsResp = await _apiService.getAttendance();
      if (recordsResp.data['success']) {
        _attendance = recordsResp.data['data'];
      }
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _scanBarcode() {
    final codeController = TextEditingController();
    final eventIdController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Simulate Barcode Scan'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: eventIdController, decoration: const InputDecoration(labelText: 'Event ID'), keyboardType: TextInputType.number),
            TextField(controller: codeController, decoration: const InputDecoration(labelText: 'Member QR/Phone')),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (codeController.text.isEmpty || eventIdController.text.isEmpty) return;
              Navigator.pop(ctx);
              try {
                final response = await _apiService.scanBarcode({'event_id': int.parse(eventIdController.text), 'qr_code': codeController.text});
                if (mounted && response.data['success']) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Attendance recorded!')));
                  _fetchData();
                } else if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed: ${response.data['message']}')));
                }
              } catch (e) {
                if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
              }
            },
            child: const Text('Scan'),
          )
        ],
      )
    );
  }

  Future<void> _scanFace() async {
    final eventIdController = TextEditingController(text: '1'); // Default to event 1 for demo
    
    // First ask for Event ID before opening camera
    final eventId = await showDialog<int>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Select Event ID'),
        content: TextField(
          controller: eventIdController,
          decoration: const InputDecoration(labelText: 'Event ID'),
          keyboardType: TextInputType.number,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, null), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, int.tryParse(eventIdController.text) ?? 1),
            child: const Text('Continue'),
          )
        ],
      )
    );

    if (eventId == null) return;

    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.camera,
        preferredCameraDevice: CameraDevice.front,
      );
      
      if (image == null) return;

      setState(() => _isScanning = true);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Analyzing face...')));

      final multipartFile = await MultipartFile.fromFile(image.path, filename: 'frame.jpg');
      final response = await _apiService.recognizeFace(eventId, multipartFile);
      
      if (mounted) {
        if (response.data['success']) {
          final matches = response.data['matches'] as List;
          final String names = matches.map((m) => m['full_name']).join(', ');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Recognized: $names! Attendance marked.'), backgroundColor: AppTheme.success),
          );
          _fetchData(); // Refresh list
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(response.data['message'] ?? 'Face not recognized'), backgroundColor: AppTheme.warning),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        String msg = 'An error occurred.';
        if (e is DioException) {
          msg = e.response?.data?['detail'] ?? e.message;
        }
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $msg'), backgroundColor: AppTheme.danger));
      }
    } finally {
      if (mounted) setState(() => _isScanning = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppShell(
      currentRoute: '/attendance',
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton.extended(
            heroTag: 'face_btn',
            onPressed: _isScanning ? null : _scanFace,
            icon: _isScanning ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) : const Icon(Icons.face),
            label: const Text('Face ID'),
            backgroundColor: AppTheme.accent,
            foregroundColor: Colors.white,
          ),
          const SizedBox(height: 16),
          FloatingActionButton.extended(
            heroTag: 'qr_btn',
            onPressed: _scanBarcode,
            icon: const Icon(Icons.qr_code_scanner),
            label: const Text('Scan QR'),
          ),
        ],
      ),
      child: _buildBody(),
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
            ElevatedButton(onPressed: _fetchData, child: const Text('Retry'))
          ],
        )
      );
    }

    return Column(
      children: [
        if (_stats != null)
          Card(
            margin: const EdgeInsets.all(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStat('Total Scans', _stats!['total_records'].toString()),
                  _buildStat('Events', _stats!['total_events'].toString()),
                ],
              ),
            ),
          ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16.0),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text('Recent Scans', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
        ),
        Expanded(
          child: RefreshIndicator(
            onRefresh: _fetchData,
            child: _attendance.isEmpty 
              ? const Center(child: Text('No attendance records found')) 
              : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _attendance.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final record = _attendance[index];
                  return Card(
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.green.withValues(alpha: 0.15),
                        child: const Icon(Icons.check_circle, color: Colors.green),
                      ),
                      title: Text(record['member_name'] ?? record['user_name'] ?? 'Unknown'),
                      subtitle: Text('Event: ${record['event_title'] ?? record['event_id']}'),
                      trailing: Text(
                        record['scan_time']?.toString().substring(0, 16) ?? '',
                        style: const TextStyle(fontSize: 11, color: AppTheme.textSecondary),
                      ),
                    ),
                  );
                },
              ),
          ),
        )
      ],
    );
  }
  
  Widget _buildStat(String label, String val) {
    return Column(
      children: [
        Text(val, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primary)),
        Text(label, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }
}
