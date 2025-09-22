package com.arbeit.backend.service;

import com.arbeit.backend.dto.AuthRequest;
import com.arbeit.backend.dto.AuthResponse;
import com.arbeit.backend.dto.LoginResponse;
import com.arbeit.backend.dto.UserRegistrationRequest;
import com.arbeit.backend.model.User;
import com.arbeit.backend.repository.UserRepository;
import com.arbeit.backend.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public LoginResponse login(AuthRequest request) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("Email does not exist");
        }

        User user = userOptional.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        // Generate tokens
        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail(), user.getRole());

        return new LoginResponse("User successfully logged in", user.getUserId(), user.getEmail(), user.getRole(), accessToken, refreshToken);
    }

    public AuthResponse register(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole("user");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Generate unique user ID
        user.setUserId(generateUniqueUserId());

        User savedUser = userRepository.save(user);

        return new AuthResponse("User successfully registered", savedUser.getUserId(), savedUser.getEmail(), savedUser.getRole());
    }

    public String refreshToken(String refreshToken) {
        if (!jwtUtils.validateRefreshToken(refreshToken)) {
            throw new RuntimeException("Invalid refresh token");
        }

        // Generate new access token from refresh token
        String newAccessToken = jwtUtils.generateAccessTokenFromRefreshToken(refreshToken);

        return newAccessToken;
    }

    private String generateUniqueUserId() {
        String userId;
        do {
            // Generate a random 3-digit number
            userId = String.valueOf(100 + (int)(Math.random() * 900));
        } while (userRepository.existsByUserId(userId));

        return userId;
    }
}
