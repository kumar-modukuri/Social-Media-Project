package com.rajkumar.backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.rajkumar.backend.models.Login;
import com.rajkumar.backend.models.Message;
import com.rajkumar.backend.services.ChatServices;

@Controller
public class ChatController 
{
    @Autowired
    private ChatServices chatService;

    // GET ONLINE USERS

    @MessageMapping("/global")                          // /chat/global        =>    Send Message
    @SendTo("/global/status")                           // /global/status      =>    Subscribe
    public List<String> getOnlineList(Login details)
    {
        return chatService.getOnlineList(details);
    }

    // SEND PRIVATE MESSAGE

    @MessageMapping("/private")                         // /chat/private       =>    Send Message
    public void sendPrivateMessage(Message message)
    {
        chatService.sendPrivateMessage(message);        // /private/mail/chat  => Subscribe
    }
}