package me.minhn.slackr.websocket;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.channel.ChannelEntity;
import me.minhn.slackr.channel.ChannelRepository;
import me.minhn.slackr.security.JwtUtil;
import me.minhn.slackr.user.UserEntity;
import me.minhn.slackr.user.UserRepository;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ExecutorChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WebsocketAuthInterceptor implements ExecutorChannelInterceptor {
    private static final String CHANNEL_TOPIC_PREFIX = "/topic/channel/";

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final ChannelRepository channelRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {

        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) {
            return message;
        }

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {

            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("Missing or invalid Authorization header");
            }

            String token = authHeader.substring(7);

            if (!jwtUtil.validateJwtToken(token)) {
                throw new IllegalArgumentException("Invalid JWT token");
            }

            String email = jwtUtil.getUserEmailFromToken(token);

            Authentication auth =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of()
                    );

            accessor.setUser(auth);
        }

        if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            authorizeSubscribe(accessor);
        }

        return message;
    }

    @Override
    public Message<?> beforeHandle(Message<?> message, MessageChannel channel, MessageHandler handler) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && accessor.getUser() instanceof Authentication auth) {
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        return message;
    }

    @Override
    public void afterMessageHandled(Message<?> message, MessageChannel channel,
                                    MessageHandler handler, Exception ex) {
        SecurityContextHolder.clearContext();
    }

    private void authorizeSubscribe(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith(CHANNEL_TOPIC_PREFIX)) {
            return;
        }

        Long channelId;
        try {
            channelId = Long.parseLong(destination.substring(CHANNEL_TOPIC_PREFIX.length()));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid channel id in destination: " + destination);
        }

        if (!(accessor.getUser() instanceof Authentication auth)) {
            throw new IllegalArgumentException("Not authenticated");
        }

        UserEntity user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ChannelEntity channelEntity = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found: " + channelId));

        boolean isMember = channelEntity.getMembers().stream()
                .anyMatch(m -> m.getId().equals(user.getId()));
        if (!isMember) {
            throw new IllegalArgumentException("Not a member of channel " + channelId);
        }
    }
}
