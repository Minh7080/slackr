package me.minhn.slackr.channel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChannelRepository extends JpaRepository<ChannelEntity, Long> {
    @Query("select distinct c from ChannelEntity c left join c.members members where c.isPrivate = false or members.id = :userId")
    List<ChannelEntity> findAccesibleChannels(@Param("userId") Long userId);

    @Query("select count(c) > 0 from ChannelEntity c join c.members m where c.id = :channelId and m.email = :email")
    boolean isMemberByEmail(@Param("channelId") Long channelId, @Param("email") String email);
}
