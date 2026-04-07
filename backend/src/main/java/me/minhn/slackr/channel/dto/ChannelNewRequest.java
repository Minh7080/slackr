package me.minhn.slackr.channel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ChannelNewRequest(String name, @JsonProperty("private") boolean isPrivate, String description) {
}
