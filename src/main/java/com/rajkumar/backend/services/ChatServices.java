package com.rajkumar.backend.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.rajkumar.backend.models.Chat;
import com.rajkumar.backend.models.Login;
import com.rajkumar.backend.models.Message;
import com.rajkumar.backend.models.User;
import com.rajkumar.backend.repositories.ChatRepository;
import com.rajkumar.backend.repositories.UserRepository;

@Service
public class ChatServices 
{
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ChatRepository chatRepo;

    @Autowired
    private UserServices userService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // GET ONLINE LIST

    public List<String> getOnlineList(Login details) 
    {
        try 
        {
            User user = userService.findByMail(details.getMail());

            List<String> onlineUsers = new ArrayList<>();

            if (user != null) 
            {
                user.setStatus(details.getPassword());

                userRepo.save(user);

                for (User existingUser : userService.getAllUsers()) 
                {
                    if (existingUser.getStatus().equals("online")) 
                    {
                        onlineUsers.add(existingUser.getMail());
                    }
                }

                return onlineUsers;
            }

            return Collections.emptyList();
        } 
        catch (Exception e) 
        {
            return null;
        }
    }
    
    // SAVE MESSAGE

    public String saveMessage(Message message) 
    {
        try 
        {
            boolean chatFound = false;

            for(Chat existingChat : chatRepo.findAll())
            {
                if(existingChat.getParticipants().contains(message.getSender()) && existingChat.getParticipants().contains(message.getReceiver())) 
                {
                    existingChat.getMessages().add(message);

                    chatRepo.save(existingChat);

                    chatFound = true;
                    break;
                }
            }
            
            if(!chatFound)
            {
                Chat newChat = new Chat();

                newChat.setParticipants(List.of(message.getSender(), message.getReceiver()));
                
                newChat.setMessages(List.of(message));
                
                chatRepo.save(newChat);
            }
            
            return "SUCCESS";
        } 
        catch(Exception e) 
        {
            return "ERROR";
        }
    }
    
    // SEND PRIVATE MESSAGE

    public void sendPrivateMessage(Message message)
    {
        if (message.getTimestamp().equals("DELETE CHATS"))
        {
            if(userService.deleteChats(message.getSender(), message.getReceiver()).equals("SUCCESS"))
            {
                messagingTemplate.convertAndSend("/private/"+message.getReceiver()+"/chat", message);
            }
        }
        else
        {
            if(saveMessage(message).equals("SUCCESS"))
            {
                messagingTemplate.convertAndSend("/private/"+message.getReceiver()+"/chat", message);
            }
        }
    }
}