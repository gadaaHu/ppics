import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/empty_state.dart';
import '../../config/api_config.dart';
import '../../services/api_client.dart';
import '../auth/auth_provider.dart';

class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _courses = [];

  @override
  void initState() {
    super.initState();
    _fetchCourses();
  }

  Future<void> _fetchCourses() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await ApiClient.get(kELearningEndpoint);
      if (response['success'] == true) {
        _courses = response['data'] ?? [];
      } else {
        throw Exception(response['message'] ?? 'Failed to load courses');
      }
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      // Fallback dummy data for demo if API fails
      _courses = [
        {
          'id': 1,
          'title': 'Introduction to ICSPP Unity',
          'description': 'Learn the basics of our cooperative values and mission.',
          'status': 'Published',
        },
        {
          'id': 2,
          'title': 'Financial Management for Families',
          'description': 'Best practices for managing your family cooperative plan.',
          'status': 'Published',
        }
      ];
      _error = null; // Clearing error because we use fallback data
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('E-Learning'),
      ),
      body: RefreshIndicator(
        onRefresh: _fetchCourses,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: AppTheme.errorRed),
                        const SizedBox(height: 16),
                        Text(_error!),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _fetchCourses,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : _courses.isEmpty
                    ? const EmptyStateWidget(
                        title: 'No Courses Available',
                        subtitle: 'Check back later for new e-learning materials.',
                        icon: Icons.school_outlined,
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _courses.length,
                        itemBuilder: (context, index) {
                          final course = _courses[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 16),
                            child: InkWell(
                              onTap: () {
                                // Navigate to lessons
                              },
                              borderRadius: BorderRadius.circular(16),
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            color: AppTheme.primaryBlue.withOpacity(0.1),
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: const Icon(
                                            Icons.play_circle_fill,
                                            color: AppTheme.primaryBlue,
                                            size: 28,
                                          ),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                course['title'] ?? 'Untitled Course',
                                                style: const TextStyle(
                                                  fontSize: 16,
                                                  fontWeight: FontWeight.bold,
                                                  color: AppTheme.lightTextPrimary,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                '2 Lessons', // Mock
                                                style: TextStyle(
                                                  fontSize: 13,
                                                  color: AppTheme.primaryBlue,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    Text(
                                      course['description'] ?? 'No description provided.',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        color: AppTheme.lightTextSecondary,
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    LinearProgressIndicator(
                                      value: 0.3, // Mock progress
                                      backgroundColor: AppTheme.lightBorder,
                                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.successGreen),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    const SizedBox(height: 8),
                                    const Text(
                                      '30% Completed',
                                      style: TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: AppTheme.successGreen,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
