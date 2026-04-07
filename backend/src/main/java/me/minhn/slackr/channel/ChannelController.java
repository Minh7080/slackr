package me.minhn.slackr.channel;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.channel.dto.*;
import me.minhn.slackr.common.EmptyResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/channel")
public class ChannelController {
    private final ChannelService channelService;

    @GetMapping
    public ResponseEntity<Map<String, List<ChannelResponse>>> getAccessibleChannels() {
        return ResponseEntity.ok(Map.of("channels", channelService.getAllAccessibleChannels()));
    }

    @PostMapping
    public ResponseEntity<ChannelIdResponse> newChannel(@RequestBody ChannelNewRequest request) {
        return ResponseEntity.ok(channelService.newChannel(request));
    }

    @GetMapping("{channelId}")
    public ResponseEntity<DetailedChannelResponse> getChannelById(@PathVariable Long channelId) {
        return ResponseEntity.ok(channelService.getChannelById(channelId));
    }

    @PutMapping("{channelId}")
    public ResponseEntity<EmptyResponse> updateChannelDetails(@PathVariable Long channelId,
                                                              @RequestBody UpdateChannelRequest request) {
        channelService.updateChannelDetails(request, channelId);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @PostMapping("{channelId}/join")
    public ResponseEntity<EmptyResponse> joinChannel(@PathVariable Long channelId) {
        channelService.joinChannel(channelId);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @PostMapping("{channelId}/leave")
    public ResponseEntity<EmptyResponse> leaveChannel(@PathVariable Long channelId) {
        channelService.leaveChannel(channelId);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @PostMapping("{channelId}/invite")
    public ResponseEntity<EmptyResponse> inviteToChannel(@PathVariable Long channelId,
                                                         @RequestBody InviteRequest request) {
        channelService.inviteToChannel(channelId, request.userId());
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }
}
