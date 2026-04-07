package me.minhn.slackr.common;

/**
 * Serializes to {} — used for endpoints that return an empty JSON object on success.
 */
public record EmptyResponse() {
    public static final EmptyResponse INSTANCE = new EmptyResponse();
}
