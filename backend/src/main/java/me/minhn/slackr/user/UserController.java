package me.minhn.slackr.user;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.common.EmptyResponse;
import me.minhn.slackr.user.dto.UpdateUserRequest;
import me.minhn.slackr.user.dto.UserBasicResponse;
import me.minhn.slackr.user.dto.UserDetailResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<Map<String, List<UserBasicResponse>>> getAllUsers() {
        return ResponseEntity.ok(Map.of("users", userService.getAllUsers()));
    }

    @GetMapping("{userId}")
    public ResponseEntity<UserDetailResponse> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping
    public ResponseEntity<EmptyResponse> updateCurrentUser(@RequestBody UpdateUserRequest request) {
        userService.updateCurrentUser(request);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }
}
