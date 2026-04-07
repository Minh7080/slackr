package me.minhn.slackr.message;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.minhn.slackr.user.UserEntity;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "reacts")
public class ReactEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String react;

    @ManyToOne(optional = false)
    private UserEntity user;

    @ManyToOne(optional = false)
    private MessageEntity message;

    public ReactEntity(String react, UserEntity user, MessageEntity message) {
        this.react = react;
        this.user = user;
        this.message = message;
    }
}
