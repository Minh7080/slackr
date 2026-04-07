package me.minhn.slackr.user;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.authentication.AuthenticationService;
import me.minhn.slackr.exception.BadRequestException;
import me.minhn.slackr.exception.ResourceNotFoundException;
import me.minhn.slackr.user.dto.UpdateUserRequest;
import me.minhn.slackr.user.dto.UserBasicResponse;
import me.minhn.slackr.user.dto.UserDetailResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final AuthenticationService authenticationService;
    private final PasswordEncoder passwordEncoder;

    public List<UserBasicResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserBasicResponse(u.getId(), u.getEmail()))
                .toList();
    }

    public UserDetailResponse getUserById(Long userId) {
        UserEntity user = userRepository.findById(userId).orElseThrow(() ->
                new ResourceNotFoundException("user", "id", userId));
        return new UserDetailResponse(user.getEmail(), user.getName(), user.getBio(), user.getImage());
    }

    @Transactional
    public void updateCurrentUser(UpdateUserRequest request) {
        UserEntity user = authenticationService.getCurrentUser();

        if (request.email() != null) {
            if (userRepository.findByEmail(request.email()).filter(u -> !u.getId().equals(user.getId())).isPresent()) {
                throw new BadRequestException("Email is already in use");
            }
            user.setEmail(request.email());
        }
        if (request.password() != null) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.name() != null) {
            user.setName(request.name());
        }
        if (request.bio() != null) {
            user.setBio(request.bio());
        }
        if (request.image() != null) {
            user.setImage(request.image());
        }

        userRepository.save(user);
    }
}
