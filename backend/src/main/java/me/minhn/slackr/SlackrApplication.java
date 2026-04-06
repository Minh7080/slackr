package me.minhn.slackr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class SlackrApplication {

	public static void main(String[] args) {
		SpringApplication.run(SlackrApplication.class, args);
	}

    @GetMapping
    public String helloWorld() {
        return "this is the slackr backend";
    }

}
