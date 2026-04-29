package me.minhn.slackr.message;

import lombok.RequiredArgsConstructor;
import me.minhn.slackr.message.dto.ReactRequest;
import me.minhn.slackr.message.dto.SendMessageRequest;
import me.minhn.slackr.message.dto.UpdateMessageRequest;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class MessageWebsocketController {
    private final MessageService messageService;

    @MessageMapping("/message/{channelId}/send")
    public void sendMessage(@DestinationVariable Long channelId,
                            @Payload SendMessageRequest request) {
        messageService.sendMessage(channelId, request);
    }

    @MessageMapping("/message/{channelId}/{messageId}/update")
    public void updateMessage(@DestinationVariable Long channelId,
                              @DestinationVariable Long messageId,
                              @Payload UpdateMessageRequest request) {
        messageService.updateMessage(channelId, messageId, request);
    }

    @MessageMapping("/message/{channelId}/{messageId}/delete")
    public void deleteMessage(@DestinationVariable Long channelId,
                              @DestinationVariable Long messageId) {
        messageService.deleteMessage(channelId, messageId);
    }

    @MessageMapping("/message/{channelId}/{messageId}/pin")
    public void pinMessage(@DestinationVariable Long channelId,
                           @DestinationVariable Long messageId) {
        messageService.pinMessage(channelId, messageId);
    }

    @MessageMapping("/message/{channelId}/{messageId}/unpin")
    public void unpinMessage(@DestinationVariable Long channelId,
                             @DestinationVariable Long messageId) {
        messageService.unpinMessage(channelId, messageId);
    }

    @MessageMapping("/message/{channelId}/{messageId}/react")
    public void reactToMessage(@DestinationVariable Long channelId,
                               @DestinationVariable Long messageId,
                               @Payload ReactRequest request) {
        messageService.reactToMessage(channelId, messageId, request);
    }

    @MessageMapping("/message/{channelId}/{messageId}/unreact")
    public void unreactToMessage(@DestinationVariable Long channelId,
                                 @DestinationVariable Long messageId,
                                 @Payload ReactRequest request) {
        messageService.unreactToMessage(channelId, messageId, request);
    }

    @MessageExceptionHandler
    @SendToUser(value = "/queue/errors", broadcast = false)
    public Map<String, String> handleException(Throwable ex) {
        return Map.of("error", ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage());
    }
}
