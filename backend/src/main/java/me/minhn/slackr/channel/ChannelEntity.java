package me.minhn.slackr.channel;

import jakarta.persistence.*;
import lombok.*;
import me.minhn.slackr.user.UserEntity;
import org.hibernate.proxy.HibernateProxy;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor
@Table(name = "channels")
public class ChannelEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    private UserEntity creator;

    private boolean isPrivate = true;
    private String description;
    private Instant createdAt = Instant.now();

    @ManyToMany(mappedBy = "channels")
    @ToString.Exclude
    private List<UserEntity> members = new ArrayList<>();

    public ChannelEntity(UserEntity creator, String name, boolean isPrivate, String description) {
        this.creator = creator;
        this.name = name;
        this.isPrivate = isPrivate;
        this.description = description;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        ChannelEntity that = (ChannelEntity) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
