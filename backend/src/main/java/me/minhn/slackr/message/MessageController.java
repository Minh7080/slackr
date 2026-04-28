package me.minhn.slackr.message;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.common.EmptyResponse;
import me.minhn.slackr.message.dto.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/message")
public class MessageController {
    private final MessageService messageService;

    @GetMapping("{channelId}")
    public ResponseEntity<Map<String, List<MessageResponse>>> getMessages(@PathVariable Long channelId,
                                                                          @RequestParam int start) {
        return ResponseEntity.ok(Map.of("messages", messageService.getMessages(channelId, start)));
    }

    @GetMapping("pinned/{channelId}")
    public ResponseEntity<Map<String, List<MessageResponse>>> getPinnedMessages(@PathVariable Long channelId) {
        return ResponseEntity.ok(Map.of("messages", messageService.getPinnedMessages(channelId)));
    }

    @PostMapping("{channelId}")
    public ResponseEntity<EmptyResponse> sendMessage(@PathVariable Long channelId,
                                                     @RequestBody SendMessageRequest request) {
        messageService.sendMessage(channelId, request);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @PutMapping("{channelId}/{messageId}")
    public ResponseEntity<EmptyResponse> updateMessage(@PathVariable Long channelId,
                                                       @PathVariable Long messageId,
                                                       @RequestBody UpdateMessageRequest request) {
        messageService.updateMessage(channelId, messageId, request);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @DeleteMapping("{channelId}/{messageId}")
    public ResponseEntity<EmptyResponse> deleteMessage(@PathVariable Long channelId,
                                                       @PathVariable Long messageId) {
        messageService.deleteMessage(channelId, messageId);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @PostMapping("pin/{channelId}/{messageId}")
    public ResponseEntity<EmptyResponse> pinMessage(@PathVariable Long channelId,
                                                    @PathVariable Long messageId) {
        messageService.pinMessage(channelId, messageId);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @PostMapping("unpin/{channelId}/{messageId}")
    public ResponseEntity<EmptyResponse> unpinMessage(@PathVariable Long channelId,
                                                      @PathVariable Long messageId) {
        messageService.unpinMessage(channelId, messageId);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @PostMapping("react/{channelId}/{messageId}")
    public ResponseEntity<EmptyResponse> reactToMessage(@PathVariable Long channelId,
                                                        @PathVariable Long messageId,
                                                        @RequestBody ReactRequest request) {
        messageService.reactToMessage(channelId, messageId, request);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }

    @PostMapping("unreact/{channelId}/{messageId}")
    public ResponseEntity<EmptyResponse> unreactToMessage(@PathVariable Long channelId,
                                                          @PathVariable Long messageId,
                                                          @RequestBody ReactRequest request) {
        messageService.unreactToMessage(channelId, messageId, request);
        return ResponseEntity.ok(EmptyResponse.INSTANCE);
    }
}
