package me.minhn.slackr.authentication;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.authentication.dto.LoginRequest;
import me.minhn.slackr.authentication.dto.RegisterRequest;
import me.minhn.slackr.authentication.dto.TokenRequest;
import me.minhn.slackr.authentication.dto.TokenResponse;
import me.minhn.slackr.exception.ResourceAlreadyExistsException;
import me.minhn.slackr.exception.ResourceNotFoundException;
import me.minhn.slackr.exception.UnauthorizedException;
import me.minhn.slackr.security.JwtUtil;
import me.minhn.slackr.user.UserEntity;
import me.minhn.slackr.user.UserRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public TokenResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        final UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails.getUsername());

        UserEntity user = userRepository.findByEmail(request.email()).orElseThrow(() ->
                new ResourceNotFoundException("User", "email", request.email()));

        return new TokenResponse(token, user.getId());
    }

    public TokenResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new ResourceAlreadyExistsException("User", "email", request.email());
        }
        final UserEntity newUser = new UserEntity (
                request.email(),
                request.name(),
                encoder.encode(request.password())
        );

        userRepository.save(newUser);
        return login(new LoginRequest(request.email(), request.password()));
    }

    public UserEntity getCurrentUser() {
        String email =  SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
