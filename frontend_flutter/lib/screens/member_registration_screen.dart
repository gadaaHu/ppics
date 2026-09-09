import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';

class MemberRegistrationScreen extends StatefulWidget {
  const MemberRegistrationScreen({super.key});

  @override
  State<MemberRegistrationScreen> createState() => _MemberRegistrationScreenState();
}

class _MemberRegistrationScreenState extends State<MemberRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _apiService = ApiService();
  
  final _usernameController = TextEditingController();
  final _fullNameController = TextEditingController();
  final _passwordController = TextEditingController();
  
  bool _isLoading = false;
  String? _errorMessage;
  
  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    try {
      final response = await _apiService.register({
        'username': _usernameController.text,
        'full_name': _fullNameController.text,
        'password': _passwordController.text,
        'role': 'member'
      });
      
      if (response.data['success']) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Registration successful! Please login.')),
          );
          context.go('/login');
        }
      } else {
        setState(() {
          _errorMessage = response.data['message'] ?? 'Registration failed';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Connection error: ${e.toString()}';
      });
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
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primary, AppTheme.accent],
                begin: Alignment.bottomLeft,
                end: Alignment.topRight,
              ),
            ),
          ),
          
          // Subtle background decoration
          Positioned(
            top: 50,
            left: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.08),
              ),
            ).animate().fade(duration: 1000.ms).scale(curve: Curves.easeOutBack),
          ),
          
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: AppTheme.glassContainer(
                  opacity: 0.15,
                  blur: 15,
                  padding: const EdgeInsets.all(36),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Icon(Icons.person_add_alt_1, size: 60, color: Colors.white)
                            .animate().scale(delay: 200.ms, duration: 500.ms, curve: Curves.easeOutBack),
                        const SizedBox(height: 24),
                        const Text(
                          'Create an Account',
                          style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: Colors.white),
                          textAlign: TextAlign.center,
                        ).animate().fadeIn(delay: 300.ms).slideY(begin: 0.2, end: 0),
                        const SizedBox(height: 32),
                        
                        if (_errorMessage != null)
                          Container(
                            padding: const EdgeInsets.all(12),
                            margin: const EdgeInsets.only(bottom: 24),
                            decoration: BoxDecoration(
                              color: Colors.red.shade100,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _errorMessage!,
                              style: TextStyle(color: Colors.red.shade900, fontWeight: FontWeight.w600),
                              textAlign: TextAlign.center,
                            ),
                          ).animate().fadeIn(),
                          
                        TextFormField(
                          controller: _fullNameController,
                          style: const TextStyle(color: AppTheme.textPrimary),
                          decoration: const InputDecoration(
                            labelText: 'Full Name',
                            prefixIcon: Icon(Icons.badge_outlined),
                          ),
                          validator: (v) => v!.isEmpty ? 'Please enter your full name' : null,
                        ).animate().fadeIn(delay: 400.ms).slideX(begin: 0.1, end: 0),
                        const SizedBox(height: 16),
                        
                        TextFormField(
                          controller: _usernameController,
                          style: const TextStyle(color: AppTheme.textPrimary),
                          decoration: const InputDecoration(
                            labelText: 'Phone Number (Username)',
                            prefixIcon: Icon(Icons.phone_outlined),
                          ),
                          validator: (v) => v!.isEmpty ? 'Please enter your phone number' : null,
                        ).animate().fadeIn(delay: 500.ms).slideX(begin: 0.1, end: 0),
                        const SizedBox(height: 16),
                        
                        TextFormField(
                          controller: _passwordController,
                          obscureText: true,
                          style: const TextStyle(color: AppTheme.textPrimary),
                          decoration: const InputDecoration(
                            labelText: 'Password',
                            prefixIcon: Icon(Icons.lock_outline),
                          ),
                          validator: (v) => v!.length < 6 ? 'Password must be at least 6 characters' : null,
                        ).animate().fadeIn(delay: 600.ms).slideX(begin: 0.1, end: 0),
                        const SizedBox(height: 32),
                        
                        SizedBox(
                          height: 55,
                          child: ElevatedButton(
                            onPressed: _isLoading ? null : _register,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.white,
                              foregroundColor: AppTheme.primary,
                              elevation: 10,
                            ),
                            child: _isLoading
                                ? const CircularProgressIndicator(color: AppTheme.primary)
                                : const Text('Register', style: TextStyle(fontSize: 18)),
                          ),
                        ).animate().fadeIn(delay: 700.ms).slideY(begin: 0.2, end: 0),
                        
                        const SizedBox(height: 20),
                        TextButton(
                          onPressed: () => context.go('/login'),
                          style: TextButton.styleFrom(foregroundColor: Colors.white),
                          child: const Text('Already have an account? Login here.'),
                        ).animate().fadeIn(delay: 800.ms)
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
  
  @override
  void dispose() {
    _usernameController.dispose();
    _fullNameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
