package me.minhn.slackr.message;

import me.minhn.slackr.exception.BadRequestException;
import me.minhn.slackr.exception.GlobalExceptionHandler;
import me.minhn.slackr.exception.ResourceNotFoundException;
import me.minhn.slackr.exception.UnauthorizedException;
import me.minhn.slackr.message.dto.MessageResponse;
import me.minhn.slackr.message.dto.ReactRequest;
import me.minhn.slackr.message.dto.ReactResponse;
import me.minhn.slackr.message.dto.SendMessageRequest;
import me.minhn.slackr.message.dto.UpdateMessageRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MessageControllerTest {

    @Mock
    private MessageService messageService;

    @InjectMocks
    private MessageController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getMessages_returnsList() throws Exception {
        MessageResponse msg = new MessageResponse(
                371938L,
                "I was nowhere to be found",
                null,
                1L,
                "2011-10-05T14:48:00.000Z",
                false,
                null,
                false,
                List.of(new ReactResponse("heart", 2L))
        );
        when(messageService.getMessages(528491L, 0)).thenReturn(List.of(msg));

        mockMvc.perform(get("/message/528491").param("start", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages[0].id").value(371938))
                .andExpect(jsonPath("$.messages[0].message").value("I was nowhere to be found"))
                .andExpect(jsonPath("$.messages[0].sender").value(1))
                .andExpect(jsonPath("$.messages[0].pinned").value(false))
                .andExpect(jsonPath("$.messages[0].reacts[0].react").value("heart"))
                .andExpect(jsonPath("$.messages[0].reacts[0].user").value(2));
    }

    @Test
    void getMessages_notMember_returns403() throws Exception {
        when(messageService.getMessages(528491L, 0))
                .thenThrow(new UnauthorizedException("channel"));

        mockMvc.perform(get("/message/528491").param("start", "0"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getMessages_channelNotFound_returns400() throws Exception {
        when(messageService.getMessages(999L, 0))
                .thenThrow(new ResourceNotFoundException("channel", "id", 999L));

        mockMvc.perform(get("/message/999").param("start", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getMessages_emptyList_whenNoMessages() throws Exception {
        when(messageService.getMessages(528491L, 0)).thenReturn(List.of());

        mockMvc.perform(get("/message/528491").param("start", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages").isArray())
                .andExpect(jsonPath("$.messages.length()").value(0));
    }

    @Test
    void getMessages_returnsFullPageOf25() throws Exception {
        List<MessageResponse> page = java.util.stream.IntStream.range(0, 25)
                .mapToObj(i -> new MessageResponse(
                        (long) i,
                        "msg " + i,
                        null,
                        1L,
                        "2011-10-05T14:48:00.000Z",
                        false,
                        null,
                        false,
                        List.of()))
                .toList();
        when(messageService.getMessages(528491L, 0)).thenReturn(page);

        mockMvc.perform(get("/message/528491").param("start", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages.length()").value(25))
                .andExpect(jsonPath("$.messages[0].id").value(0))
                .andExpect(jsonPath("$.messages[24].id").value(24));
    }

    @Test
    void getMessages_passesStartParamToService() throws Exception {
        when(messageService.getMessages(eq(528491L), org.mockito.ArgumentMatchers.anyInt()))
                .thenReturn(List.of());

        mockMvc.perform(get("/message/528491").param("start", "50"))
                .andExpect(status().isOk());

        verify(messageService).getMessages(528491L, 50);
    }

    @Test
    void getMessages_secondPage_passesStart25() throws Exception {
        MessageResponse msg = new MessageResponse(
                100L, "page-2", null, 1L, "2011-10-05T14:48:00.000Z",
                false, null, false, List.of());
        when(messageService.getMessages(528491L, 25)).thenReturn(List.of(msg));

        mockMvc.perform(get("/message/528491").param("start", "25"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages[0].id").value(100));

        verify(messageService).getMessages(528491L, 25);
    }

    @Test
    void getMessages_missingStartParam_returns400() throws Exception {
        mockMvc.perform(get("/message/528491"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sendMessage_returnsOk() throws Exception {
        doNothing().when(messageService).sendMessage(eq(528491L), any(SendMessageRequest.class));

        mockMvc.perform(post("/message/528491")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"hello\"}"))
                .andExpect(status().isOk());

        verify(messageService).sendMessage(eq(528491L), any(SendMessageRequest.class));
    }

    @Test
    void sendMessage_emptyContent_returns400() throws Exception {
        doThrow(new BadRequestException("Message must have content or an image"))
                .when(messageService).sendMessage(eq(528491L), any(SendMessageRequest.class));

        mockMvc.perform(post("/message/528491")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Message must have content or an image"));
    }

    @Test
    void updateMessage_returnsOk() throws Exception {
        doNothing().when(messageService)
                .updateMessage(eq(528491L), eq(371938L), any(UpdateMessageRequest.class));

        mockMvc.perform(put("/message/528491/371938")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"edited\"}"))
                .andExpect(status().isOk());

        verify(messageService).updateMessage(eq(528491L), eq(371938L), any(UpdateMessageRequest.class));
    }

    @Test
    void updateMessage_notSender_returns403() throws Exception {
        doThrow(new UnauthorizedException("message"))
                .when(messageService).updateMessage(eq(528491L), eq(371938L), any(UpdateMessageRequest.class));

        mockMvc.perform(put("/message/528491/371938")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"edited\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void deleteMessage_returnsOk() throws Exception {
        doNothing().when(messageService).deleteMessage(528491L, 371938L);

        mockMvc.perform(delete("/message/528491/371938"))
                .andExpect(status().isOk());

        verify(messageService).deleteMessage(528491L, 371938L);
    }

    @Test
    void deleteMessage_notFound_returns400() throws Exception {
        doThrow(new ResourceNotFoundException("message", "id", 999L))
                .when(messageService).deleteMessage(528491L, 999L);

        mockMvc.perform(delete("/message/528491/999"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void pinMessage_returnsOk() throws Exception {
        doNothing().when(messageService).pinMessage(528491L, 371938L);

        mockMvc.perform(post("/message/pin/528491/371938"))
                .andExpect(status().isOk());

        verify(messageService).pinMessage(528491L, 371938L);
    }

    @Test
    void pinMessage_alreadyPinned_returns400() throws Exception {
        doThrow(new BadRequestException("Message is already pinned"))
                .when(messageService).pinMessage(528491L, 371938L);

        mockMvc.perform(post("/message/pin/528491/371938"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Message is already pinned"));
    }

    @Test
    void unpinMessage_returnsOk() throws Exception {
        doNothing().when(messageService).unpinMessage(528491L, 371938L);

        mockMvc.perform(post("/message/unpin/528491/371938"))
                .andExpect(status().isOk());

        verify(messageService).unpinMessage(528491L, 371938L);
    }

    @Test
    void unpinMessage_notPinned_returns400() throws Exception {
        doThrow(new BadRequestException("Message is not pinned"))
                .when(messageService).unpinMessage(528491L, 371938L);

        mockMvc.perform(post("/message/unpin/528491/371938"))
                .andExpect(status().isBadRequest());
    }

    private static final String REACT_BODY = "{\"react\":\"heart\"}";

    @Test
    void reactToMessage_returnsOk() throws Exception {
        doNothing().when(messageService)
                .reactToMessage(eq(528491L), eq(371938L), any(ReactRequest.class));

        mockMvc.perform(post("/message/react/528491/371938")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REACT_BODY))
                .andExpect(status().isOk());

        verify(messageService).reactToMessage(eq(528491L), eq(371938L), any(ReactRequest.class));
    }

    @Test
    void reactToMessage_alreadyReacted_returns400() throws Exception {
        doThrow(new BadRequestException("User has already reacted with this react"))
                .when(messageService).reactToMessage(eq(528491L), eq(371938L), any(ReactRequest.class));

        mockMvc.perform(post("/message/react/528491/371938")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REACT_BODY))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unreactToMessage_returnsOk() throws Exception {
        doNothing().when(messageService)
                .unreactToMessage(eq(528491L), eq(371938L), any(ReactRequest.class));

        mockMvc.perform(post("/message/unreact/528491/371938")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REACT_BODY))
                .andExpect(status().isOk());

        verify(messageService).unreactToMessage(eq(528491L), eq(371938L), any(ReactRequest.class));
    }

    @Test
    void unreactToMessage_reactNotFound_returns400() throws Exception {
        doThrow(new BadRequestException("React not found"))
                .when(messageService).unreactToMessage(eq(528491L), eq(371938L), any(ReactRequest.class));

        mockMvc.perform(post("/message/unreact/528491/371938")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(REACT_BODY))
                .andExpect(status().isBadRequest());
    }
}
