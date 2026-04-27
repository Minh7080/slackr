package me.minhn.slackr.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    @Query(
            value = "SELECT * FROM messages WHERE channel_id = :channelId "
                    + "ORDER BY sent_at DESC LIMIT :limit OFFSET :offset",
            nativeQuery = true
    )
    List<MessageEntity> findByChannelIdOrderBySentAtDesc(
            @Param("channelId") Long channelId,
            @Param("offset") int offset,
            @Param("limit") int limit
    );
}
