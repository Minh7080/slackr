package me.minhn.slackr.user;

import me.minhn.slackr.exception.BadRequestException;
import me.minhn.slackr.exception.GlobalExceptionHandler;
import me.minhn.slackr.exception.ResourceNotFoundException;
import me.minhn.slackr.user.dto.UpdateUserRequest;
import me.minhn.slackr.user.dto.UserBasicResponse;
import me.minhn.slackr.user.dto.UserDetailResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAllUsers_returnsList() throws Exception {
        when(userService.getAllUsers()).thenReturn(List.of(
                new UserBasicResponse(1L, "betty@email.com"),
                new UserBasicResponse(2L, "inez@email.com")
        ));

        mockMvc.perform(get("/user"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.users.length()").value(2))
                .andExpect(jsonPath("$.users[0].id").value(1))
                .andExpect(jsonPath("$.users[0].email").value("betty@email.com"));
    }

    @Test
    void getUserById_returnsDetails() throws Exception {
        when(userService.getUserById(61021L)).thenReturn(
                new UserDetailResponse("betty@email.com", "Betty", "bio", "image-data"));

        mockMvc.perform(get("/user/61021"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("betty@email.com"))
                .andExpect(jsonPath("$.name").value("Betty"))
                .andExpect(jsonPath("$.bio").value("bio"))
                .andExpect(jsonPath("$.image").value("image-data"));
    }

    @Test
    void getUserById_notFound_returns400() throws Exception {
        when(userService.getUserById(999L))
                .thenThrow(new ResourceNotFoundException("user", "id", 999L));

        mockMvc.perform(get("/user/999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void updateCurrentUser_returnsOk() throws Exception {
        doNothing().when(userService).updateCurrentUser(any(UpdateUserRequest.class));

        mockMvc.perform(put("/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"new@email.com\",\"password\":\"newpass\","
                                + "\"name\":\"New Name\",\"bio\":\"new bio\",\"image\":\"new-image\"}"))
                .andExpect(status().isOk());

        verify(userService).updateCurrentUser(any(UpdateUserRequest.class));
    }

    @Test
    void updateCurrentUser_emailInUse_returns400() throws Exception {
        doThrow(new BadRequestException("Email is already in use"))
                .when(userService).updateCurrentUser(any(UpdateUserRequest.class));

        mockMvc.perform(put("/user")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"taken@email.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email is already in use"));
    }
}
