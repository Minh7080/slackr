package me.minhn.slackr.channel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ChannelResponse(
        Long id,
        String name,
        Long creator,
        @JsonProperty("private") boolean isPrivate,
        List<Long> members
) {
}
