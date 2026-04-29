package me.minhn.slackr.message;

import me.minhn.slackr.message.dto.ChannelEvent;

public record ChannelBroadcastEvent(Long channelId, ChannelEvent event) {
}
