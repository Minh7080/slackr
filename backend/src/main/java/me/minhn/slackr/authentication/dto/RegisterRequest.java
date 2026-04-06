package me.minhn.slackr.authentication.dto;

public record RegisterRequest(String email, String password, String name) {
}
