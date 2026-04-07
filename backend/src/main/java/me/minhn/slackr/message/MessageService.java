package me.minhn.slackr.message;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.authentication.AuthenticationService;
import me.minhn.slackr.channel.ChannelEntity;
import me.minhn.slackr.channel.ChannelRepository;
import me.minhn.slackr.exception.BadRequestException;
import me.minhn.slackr.exception.ResourceNotFoundException;
import me.minhn.slackr.exception.UnauthorizedException;
import me.minhn.slackr.message.dto.*;
import me.minhn.slackr.user.UserEntity;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ReactRepository reactRepository;
    private final ChannelRepository channelRepository;
    private final AuthenticationService authenticationService;

    private ChannelEntity getChannelAndCheckMembership(Long channelId, UserEntity user) {
        ChannelEntity channel = channelRepository.findById(channelId).orElseThrow(() ->
                new ResourceNotFoundException("channel", "id", channelId));
        boolean isMember = channel.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        if (!isMember) {
            throw new UnauthorizedException("channel");
        }
        return channel;
    }

    private MessageResponse toResponse(MessageEntity msg) {
        return new MessageResponse(
                msg.getId(),
                msg.getMessage(),
                msg.getImage(),
                msg.getSender().getId(),
                msg.getSentAt().toString(),
                msg.isEdited(),
                msg.getEditedAt() != null ? msg.getEditedAt().toString() : null,
                msg.isPinned(),
                msg.getReacts().stream()
                        .map(r -> new ReactResponse(r.getReact(), r.getUser().getId()))
                        .toList()
        );
    }

    public List<MessageResponse> getMessages(Long channelId, int start) {
        UserEntity user = authenticationService.getCurrentUser();
        getChannelAndCheckMembership(channelId, user);
        return messageRepository.findByChannelIdOrderBySentAtDesc(channelId, PageRequest.of(start / 25, 25))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void sendMessage(Long channelId, SendMessageRequest request) {
        UserEntity user = authenticationService.getCurrentUser();
        ChannelEntity channel = getChannelAndCheckMembership(channelId, user);

        if (request.message() == null && request.image() == null) {
            throw new BadRequestException("Message must have content or an image");
        }

        messageRepository.save(new MessageEntity(request.message(), request.image(), user, channel));
    }

    @Transactional
    public void updateMessage(Long channelId, Long messageId, UpdateMessageRequest request) {
        UserEntity user = authenticationService.getCurrentUser();
        getChannelAndCheckMembership(channelId, user);

        MessageEntity message = messageRepository.findById(messageId).orElseThrow(() ->
                new ResourceNotFoundException("message", "id", messageId));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new UnauthorizedException("message");
        }
        if (request.message() == null && request.image() == null) {
            throw new BadRequestException("Message must have content or an image");
        }

        if (request.message() != null) message.setMessage(request.message());
        if (request.image() != null) message.setImage(request.image());
        message.setEdited(true);
        message.setEditedAt(Instant.now());
        messageRepository.save(message);
    }

    @Transactional
    public void deleteMessage(Long channelId, Long messageId) {
        UserEntity user = authenticationService.getCurrentUser();
        getChannelAndCheckMembership(channelId, user);

        MessageEntity message = messageRepository.findById(messageId).orElseThrow(() ->
                new ResourceNotFoundException("message", "id", messageId));

        if (!message.getSender().getId().equals(user.getId())) {
            throw new UnauthorizedException("message");
        }

        messageRepository.delete(message);
    }

    @Transactional
    public void pinMessage(Long channelId, Long messageId) {
        UserEntity user = authenticationService.getCurrentUser();
        getChannelAndCheckMembership(channelId, user);

        MessageEntity message = messageRepository.findById(messageId).orElseThrow(() ->
                new ResourceNotFoundException("message", "id", messageId));

        if (message.isPinned()) {
            throw new BadRequestException("Message is already pinned");
        }

        message.setPinned(true);
        messageRepository.save(message);
    }

    @Transactional
    public void unpinMessage(Long channelId, Long messageId) {
        UserEntity user = authenticationService.getCurrentUser();
        getChannelAndCheckMembership(channelId, user);

        MessageEntity message = messageRepository.findById(messageId).orElseThrow(() ->
                new ResourceNotFoundException("message", "id", messageId));

        if (!message.isPinned()) {
            throw new BadRequestException("Message is not pinned");
        }

        message.setPinned(false);
        messageRepository.save(message);
    }

    @Transactional
    public void reactToMessage(Long channelId, Long messageId, ReactRequest request) {
        UserEntity user = authenticationService.getCurrentUser();
        getChannelAndCheckMembership(channelId, user);

        MessageEntity message = messageRepository.findById(messageId).orElseThrow(() ->
                new ResourceNotFoundException("message", "id", messageId));

        boolean alreadyReacted = reactRepository
                .findByMessageIdAndUserIdAndReact(messageId, user.getId(), request.react())
                .isPresent();
        if (alreadyReacted) {
            throw new BadRequestException("User has already reacted with this react");
        }

        reactRepository.save(new ReactEntity(request.react(), user, message));
    }

    @Transactional
    public void unreactToMessage(Long channelId, Long messageId, ReactRequest request) {
        UserEntity user = authenticationService.getCurrentUser();
        getChannelAndCheckMembership(channelId, user);

        messageRepository.findById(messageId).orElseThrow(() ->
                new ResourceNotFoundException("message", "id", messageId));

        ReactEntity react = reactRepository
                .findByMessageIdAndUserIdAndReact(messageId, user.getId(), request.react())
                .orElseThrow(() -> new BadRequestException("React not found"));

        reactRepository.delete(react);
    }
}
