package me.minhn.slackr.channel.dto;

public record UpdateChannelRequest(
        String name,
        String description
) {
}
