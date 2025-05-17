package com.roboticgen.nexus.service;

import com.roboticgen.nexus.exception.UserNotFoundException;
import com.roboticgen.nexus.model.User;
import com.roboticgen.nexus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            throw new UserNotFoundException("No users found in the system.");
        }
        return users;
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> 
                new UserNotFoundException("No user found with email: " + email));
    }

    public User registerOAuth2User(String email, String name) {
        // build & persist a new User with role=INSTRUCTOR
        User user = User.builder()
            .username(name)                           // or whatever mapping you prefer
            .email(email)
            // Since password is non-nullable, give it a random placeholder:
            .password(UUID.randomUUID().toString())
            .role(User.Role.INSTRUCTOR)               // hard-coded
            .build();

        return userRepository.save(user);
    }
}
