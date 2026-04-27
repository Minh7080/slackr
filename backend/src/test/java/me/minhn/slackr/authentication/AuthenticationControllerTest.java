package me.minhn.slackr.authentication;

import me.minhn.slackr.authentication.dto.LoginRequest;
import me.minhn.slackr.authentication.dto.RegisterRequest;
import me.minhn.slackr.authentication.dto.TokenResponse;
import me.minhn.slackr.exception.GlobalExceptionHandler;
import me.minhn.slackr.exception.ResourceAlreadyExistsException;
import me.minhn.slackr.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerTest {

    @Mock
    private AuthenticationService authService;

    @InjectMocks
    private AuthenticationController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    private static final String REGISTER_BODY =
            "{\"email\":\"betty@email.com\",\"password\":\"cardigan\",\"name\":\"Betty\"}";
    private static final String LOGIN_BODY =
            "{\"email\":\"betty@email.com\",\"password\":\"cardigan\"}";

    @Test
    void register_returnsTokenAndUserId() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(new TokenResponse("jwt-token", 61021L));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REGISTER_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.userId").value(61021));
    }

    @Test
    void register_emailAlreadyExists_returns400() throws Exception {
        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new ResourceAlreadyExistsException("User", "email", "betty@email.com"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REGISTER_BODY))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void login_returnsTokenAndUserId() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenReturn(new TokenResponse("jwt-token", 61021L));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(LOGIN_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.userId").value(61021));
    }

    @Test
    void login_unknownUser_returns400() throws Exception {
        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new ResourceNotFoundException("User", "email", "ghost@email.com"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"ghost@email.com\",\"password\":\"cardigan\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void logout_returnsEmptyJson() throws Exception {
        mockMvc.perform(post("/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isMap());
    }
}
