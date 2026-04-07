package me.minhn.slackr.message.dto;

import java.util.List;

public record MessageResponse(
        Long id,
        String message,
        String image,
        Long sender,
        String sentAt,
        boolean edited,
        String editedAt,
        boolean pinned,
        List<ReactResponse> reacts
) {
}
