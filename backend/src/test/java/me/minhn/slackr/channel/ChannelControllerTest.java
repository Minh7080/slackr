package me.minhn.slackr.channel;

import me.minhn.slackr.channel.dto.ChannelIdResponse;
import me.minhn.slackr.channel.dto.ChannelNewRequest;
import me.minhn.slackr.channel.dto.ChannelResponse;
import me.minhn.slackr.channel.dto.DetailedChannelResponse;
import me.minhn.slackr.channel.dto.UpdateChannelRequest;
import me.minhn.slackr.exception.BadRequestException;
import me.minhn.slackr.exception.GlobalExceptionHandler;
import me.minhn.slackr.exception.ResourceNotFoundException;
import me.minhn.slackr.exception.UnauthorizedException;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ChannelControllerTest {

    @Mock
    private ChannelService channelService;

    @InjectMocks
    private ChannelController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void getAllChannels_returnsList() throws Exception {
        ChannelResponse channel = new ChannelResponse(528491L, "Inez's forum", 1L, false, List.of(1L, 2L));
        when(channelService.getAllAccessibleChannels()).thenReturn(List.of(channel));

        mockMvc.perform(get("/channel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.channels[0].id").value(528491))
                .andExpect(jsonPath("$.channels[0].name").value("Inez's forum"))
                .andExpect(jsonPath("$.channels[0].private").value(false))
                .andExpect(jsonPath("$.channels[0].members.length()").value(2));
    }

    @Test
    void newChannel_returnsChannelId() throws Exception {
        when(channelService.newChannel(any(ChannelNewRequest.class)))
                .thenReturn(new ChannelIdResponse(42L));

        mockMvc.perform(post("/channel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New Channel\",\"private\":false,\"description\":\"desc\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.channelId").value(42));
    }

    @Test
    void getChannelById_returnsDetailed() throws Exception {
        DetailedChannelResponse detail = new DetailedChannelResponse(
                "Inez's forum", 1L, false, "desc", "2011-10-05T14:48:00.000Z", List.of(1L, 2L));
        when(channelService.getChannelById(528491L)).thenReturn(detail);

        mockMvc.perform(get("/channel/528491"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Inez's forum"))
                .andExpect(jsonPath("$.creator").value(1))
                .andExpect(jsonPath("$.private").value(false))
                .andExpect(jsonPath("$.description").value("desc"))
                .andExpect(jsonPath("$.createdAt").value("2011-10-05T14:48:00.000Z"));
    }

    @Test
    void getChannelById_notFound_returns400() throws Exception {
        when(channelService.getChannelById(999L))
                .thenThrow(new ResourceNotFoundException("channel", "id", 999L));

        mockMvc.perform(get("/channel/999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void getChannelById_unauthorized_returns403() throws Exception {
        when(channelService.getChannelById(528491L))
                .thenThrow(new UnauthorizedException("channel"));

        mockMvc.perform(get("/channel/528491"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void updateChannel_returnsOk() throws Exception {
        doNothing().when(channelService).updateChannelDetails(any(UpdateChannelRequest.class), eq(528491L));

        mockMvc.perform(put("/channel/528491")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Renamed\",\"description\":\"new desc\"}"))
                .andExpect(status().isOk());

        verify(channelService).updateChannelDetails(any(UpdateChannelRequest.class), eq(528491L));
    }

    @Test
    void joinChannel_returnsOk() throws Exception {
        doNothing().when(channelService).joinChannel(528491L);

        mockMvc.perform(post("/channel/528491/join"))
                .andExpect(status().isOk());

        verify(channelService).joinChannel(528491L);
    }

    @Test
    void joinChannel_private_returns403() throws Exception {
        doThrow(new UnauthorizedException("private channel"))
                .when(channelService).joinChannel(528491L);

        mockMvc.perform(post("/channel/528491/join"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void joinChannel_alreadyMember_returns400() throws Exception {
        doThrow(new BadRequestException("User is already a member of this channel"))
                .when(channelService).joinChannel(528491L);

        mockMvc.perform(post("/channel/528491/join"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void leaveChannel_returnsOk() throws Exception {
        doNothing().when(channelService).leaveChannel(528491L);

        mockMvc.perform(post("/channel/528491/leave"))
                .andExpect(status().isOk());

        verify(channelService).leaveChannel(528491L);
    }

    @Test
    void leaveChannel_notMember_returns400() throws Exception {
        doThrow(new BadRequestException("User is not a member of this channel"))
                .when(channelService).leaveChannel(528491L);

        mockMvc.perform(post("/channel/528491/leave"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void inviteToChannel_returnsOk() throws Exception {
        doNothing().when(channelService).inviteToChannel(528491L, 7L);

        mockMvc.perform(post("/channel/528491/invite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":7}"))
                .andExpect(status().isOk());

        verify(channelService).inviteToChannel(528491L, 7L);
    }

    @Test
    void inviteToChannel_unauthorized_returns403() throws Exception {
        doThrow(new UnauthorizedException("channel"))
                .when(channelService).inviteToChannel(528491L, 7L);

        mockMvc.perform(post("/channel/528491/invite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":7}"))
                .andExpect(status().isForbidden());
    }
}
