package me.minhn.slackr.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@Getter
@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedException extends RuntimeException{
    private final String resourceName;
    public UnauthorizedException(String resourceName) {
        super(String.format("You cannot access %s", resourceName));
        this.resourceName = resourceName;
    }
}
