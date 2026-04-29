package me.minhn.slackr.message.dto;

public record ChannelEvent(String type, Object payload) {
    public static final String MESSAGE_SENT = "MESSAGE_SENT";
    public static final String MESSAGE_UPDATED = "MESSAGE_UPDATED";
    public static final String MESSAGE_DELETED = "MESSAGE_DELETED";
    public static final String MESSAGE_PINNED = "MESSAGE_PINNED";
    public static final String MESSAGE_UNPINNED = "MESSAGE_UNPINNED";
    public static final String REACTION_ADDED = "REACTION_ADDED";
    public static final String REACTION_REMOVED = "REACTION_REMOVED";

    public record MessageSent(MessageResponse message) {}
    public record MessageUpdated(MessageResponse message) {}
    public record MessageDeleted(Long messageId) {}
    public record MessagePinned(Long messageId) {}
    public record MessageUnpinned(Long messageId) {}
    public record ReactionAdded(Long messageId, String react, Long userId) {}
    public record ReactionRemoved(Long messageId, String react, Long userId) {}
}
