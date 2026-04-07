package me.minhn.slackr.user.dto;

public record UpdateUserRequest(String email, String password, String name, String bio, String image) {
}
