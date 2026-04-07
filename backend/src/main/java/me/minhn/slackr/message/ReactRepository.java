package me.minhn.slackr.message;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReactRepository extends JpaRepository<ReactEntity, Long> {
    Optional<ReactEntity> findByMessageIdAndUserIdAndReact(Long messageId, Long userId, String react);
}
