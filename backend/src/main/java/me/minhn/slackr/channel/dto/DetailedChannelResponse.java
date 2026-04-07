package me.minhn.slackr.channel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record DetailedChannelResponse(
        String name,
        Long creator,
        @JsonProperty("private") boolean isPrivate,
        String description,
        String createdAt,
        List<Long> members
) {
}
