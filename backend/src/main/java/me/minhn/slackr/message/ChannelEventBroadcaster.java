package me.minhn.slackr.message;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class ChannelEventBroadcaster {
    private final SimpMessagingTemplate messagingTemplate;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onChannelBroadcast(ChannelBroadcastEvent event) {
        messagingTemplate.convertAndSend("/topic/channel/" + event.channelId(), event.event());
    }
}
