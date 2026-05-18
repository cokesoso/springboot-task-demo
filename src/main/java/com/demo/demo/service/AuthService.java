package com.demo.demo.service;

import com.demo.demo.dto.AuthRequest;
import com.demo.demo.dto.AuthResponse;
import com.demo.demo.entity.User;
import com.demo.demo.repository.UserRepository;
import com.demo.demo.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.regex.Pattern;

@Service
public class AuthService {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(AuthRequest request) {
        validateCredentials(request);
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("该邮箱已注册");
        }
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(AuthRequest request) {
        validateCredentials(request);
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("邮箱或密码错误"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("邮箱或密码错误");
        }
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return new AuthResponse(jwtService.generateToken(user.getId()), user.getEmail());
    }

    private void validateCredentials(AuthRequest request) {
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("请输入邮箱");
        }
        if (!EMAIL_PATTERN.matcher(request.email().trim()).matches()) {
            throw new IllegalArgumentException("邮箱格式不正确");
        }
        if (request.password() == null || request.password().length() < 6) {
            throw new IllegalArgumentException("密码至少 6 位");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
