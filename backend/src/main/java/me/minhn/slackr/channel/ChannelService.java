package me.minhn.slackr.channel;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.authentication.AuthenticationService;
import me.minhn.slackr.channel.dto.*;
import me.minhn.slackr.exception.BadRequestException;
import me.minhn.slackr.exception.ResourceNotFoundException;
import me.minhn.slackr.exception.UnauthorizedException;
import me.minhn.slackr.user.UserEntity;
import me.minhn.slackr.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChannelService {
    private final AuthenticationService authenticationService;
    private final ChannelRepository channelRepository;
    private final UserRepository userRepository;

    public List<ChannelResponse> getAllAccessibleChannels() {
        Long userId = authenticationService.getCurrentUser().getId();
        return channelRepository.findAccesibleChannels(userId).stream()
                .map(channel -> new ChannelResponse(
                        channel.getId(),
                        channel.getName(),
                        channel.getCreator().getId(),
                        channel.isPrivate(),
                        channel.getMembers().stream().map(UserEntity::getId).toList()
                ))
                .toList();
    }

    @Transactional
    public ChannelIdResponse newChannel(ChannelNewRequest request) {
        UserEntity user = authenticationService.getCurrentUser();
        ChannelEntity channel = new ChannelEntity(user, request.name(), request.isPrivate(), request.description());
        ChannelEntity savedChannel = channelRepository.save(channel);

        user.getChannels().add(savedChannel);
        userRepository.save(user);
        return new ChannelIdResponse(savedChannel.getId());
    }

    private boolean isUserAuthorisedToAccessChannel(Long userId, ChannelEntity channel) {
        return !channel.isPrivate()
                || channel.getCreator().getId().equals(userId)
                || channel.getMembers().stream().map(UserEntity::getId).anyMatch(userId::equals);
    }

    public DetailedChannelResponse getChannelById(Long channelId) {
        Long userId = authenticationService.getCurrentUser().getId();
        ChannelEntity channel = channelRepository.findById(channelId).orElseThrow(() ->
                new ResourceNotFoundException("channel", "id", channelId));

        if (!isUserAuthorisedToAccessChannel(userId, channel)) {
            throw new UnauthorizedException("channel");
        }

        return new DetailedChannelResponse(
                channel.getName(),
                channel.getCreator().getId(),
                channel.isPrivate(),
                channel.getDescription(),
                channel.getCreatedAt().toString(),
                channel.getMembers().stream().map(UserEntity::getId).toList()
        );
    }

    @Transactional
    public void updateChannelDetails(UpdateChannelRequest request, Long channelId) {
        Long userId = authenticationService.getCurrentUser().getId();
        ChannelEntity channel = channelRepository.findById(channelId).orElseThrow(() ->
                new ResourceNotFoundException("channel", "id", channelId));

        if (!isUserAuthorisedToAccessChannel(userId, channel)) {
            throw new UnauthorizedException("channel");
        }

        if (request.name() != null) channel.setName(request.name());
        if (request.description() != null) channel.setDescription(request.description());
        channelRepository.save(channel);
    }

    @Transactional
    public void joinChannel(Long channelId) {
        UserEntity user = authenticationService.getCurrentUser();
        ChannelEntity channel = channelRepository.findById(channelId).orElseThrow(() ->
                new ResourceNotFoundException("channel", "id", channelId));

        if (channel.isPrivate()) {
            throw new UnauthorizedException("private channel");
        }
        if (channel.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()))) {
            throw new BadRequestException("User is already a member of this channel");
        }

        user.getChannels().add(channel);
        userRepository.save(user);
    }

    @Transactional
    public void leaveChannel(Long channelId) {
        UserEntity user = authenticationService.getCurrentUser();
        ChannelEntity channel = channelRepository.findById(channelId).orElseThrow(() ->
                new ResourceNotFoundException("channel", "id", channelId));

        boolean isMember = channel.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));
        if (!isMember) {
            throw new BadRequestException("User is not a member of this channel");
        }

        user.getChannels().remove(channel);
        userRepository.save(user);
    }

    @Transactional
    public void inviteToChannel(Long channelId, Long inviteeId) {
        UserEntity currentUser = authenticationService.getCurrentUser();
        ChannelEntity channel = channelRepository.findById(channelId).orElseThrow(() ->
                new ResourceNotFoundException("channel", "id", channelId));

        boolean isCurrentUserMember = channel.getMembers().stream()
                .anyMatch(m -> m.getId().equals(currentUser.getId()));
        if (!isCurrentUserMember) {
            throw new UnauthorizedException("channel");
        }

        UserEntity invitee = userRepository.findById(inviteeId).orElseThrow(() ->
                new ResourceNotFoundException("user", "id", inviteeId));

        boolean alreadyMember = channel.getMembers().stream().anyMatch(m -> m.getId().equals(inviteeId));
        if (alreadyMember) {
            throw new BadRequestException("User is already a member of this channel");
        }

        invitee.getChannels().add(channel);
        userRepository.save(invitee);
    }
}
