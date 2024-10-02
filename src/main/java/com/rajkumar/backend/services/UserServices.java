package com.rajkumar.backend.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import com.rajkumar.backend.models.Chat;
import com.rajkumar.backend.models.Friend;
import com.rajkumar.backend.models.Message;
import com.rajkumar.backend.models.Request;
import com.rajkumar.backend.models.Update;
import com.rajkumar.backend.models.User;
import com.rajkumar.backend.repositories.ChatRepository;
import com.rajkumar.backend.repositories.UserRepository;

@Service
public class UserServices 
{
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ChatRepository chatRepo;

    // FIND BY MAIL

    public User findByMail(String mail)
    {
        try 
        {
            List<User> allUsers = userRepo.findAll();

            for (User user : allUsers) 
            {
                if (user.getMail().equals(mail)) 
                {
                    return user;
                }
            }
            return null;
        } 
        catch (Exception e) 
        {
            throw new RuntimeException("\nError in findByMail : " + e);
        }
    }
    
    // GET FRIENDS

    public List<Friend> getFriends(String mail)
    {
        try 
        {
            User user = findByMail(mail);

            if (user != null)
            {
                List<Friend> friends = user.getFriends();

                friends.sort(Comparator.comparing(Friend::getUsername));

                return friends;
            }

            return Collections.emptyList();
        } 
        catch (Exception e) 
        {
            return null;
        }
    }
    
    // GET ALL USERS

    public List<User> getAllUsers()
    {
        try 
        {
            return userRepo.findAll(Sort.by(Sort.Direction.ASC, "username"));
        } 
        catch (Exception e) 
        {
            return null;
        }
    }

    // GET REQUESTS

    public List<Request> getRequests(@PathVariable String mail)
    {
        try 
        {
            User user = findByMail(mail);

            if (user != null) 
            {
                List<Request> requests = user.getRequests();

                requests.sort(Comparator.comparing(Request::getUsername));

                return requests;
            }

            return Collections.emptyList();
        } 
        catch (Exception e) 
        {
            return null;
        }
    }

    // GET SENT

    public List<String> getSent(String mail)
    {
        try {
            List<String> sent = new ArrayList<>();

            User user = findByMail(mail);

            if (user != null) {
                for (User existingUser : getAllUsers()) {
                    for (Request request : existingUser.getRequests()) {
                        if (request.getFrom().equals(mail)) {
                            sent.add(request.getTo());
                        }
                    }
                }

                return sent;
            }

            return Collections.emptyList();
        } catch (Exception e) {
            return null;
        }
    }
    
    // GET ALL CHATS

    public List<Message> getAllChats(String mail)
    {
        try 
        {
            List<Message> messages = new ArrayList<>();

            User user = findByMail(mail);

            for (Friend friend : user.getFriends())
            {
                for(Chat existingChat : chatRepo.findAll())
                {
                    if(existingChat.getParticipants().contains(friend.getMail()) && existingChat.getParticipants().contains(mail))
                    {
                        for(Message existingMessage : existingChat.getMessages())
                        {
                            messages.add(existingMessage);
                        }
                    }
                }
            }

            return messages;
        } 
        catch (Exception e) 
        {
            return null;
        }
    }

    // SEND REQUEST

    public String sendRequest(Request request) 
    {
        try 
        {
            User user = findByMail(request.getFrom());
            User friendUser = findByMail(request.getTo());

            for(Request req : user.getRequests())
            {
                if(req.getFrom().equals(request.getTo()))
                {
                    Request modifiedRequest = new Request();

                    modifiedRequest.setFrom(request.getTo());
                    modifiedRequest.setTo(request.getFrom());
                    modifiedRequest.setUsername(friendUser.getUsername());
                    modifiedRequest.setImage(friendUser.getImage());

                    if(acceptRequest(modifiedRequest) == "SUCCESS") 
                    {
                        return "ACCEPTED";
                    }
                }
            }

            if (friendUser != null) 
            {
                List<Request> requests = friendUser.getRequests();

                for(Request req : requests) 
                {
                    if (req.getFrom().equals(request.getFrom())) 
                    {
                        return "ALREADY SENT";
                    }
                }

                requests.add(request);

                userRepo.save(friendUser);

                return "SUCCESS";
            }

            return "NOT FOUND";
        }
        catch (Exception e) 
        {
            return "ERROR";
        }
    }
    
    // DELETE REQUEST

    public String deleteRequest(Request request)
    {
        try 
        {
            User user = findByMail(request.getTo());

            if(user != null)
            {
                List<Request> requests = user.getRequests();

                boolean removed = requests.removeIf(req -> req.getFrom().equals(request.getFrom()));

                if(removed)
                {
                    userRepo.save(user);
                }

                return "SUCCESS";
            }

            return "NOT FOUND";
        } 
        catch (Exception e) 
        {
            return "ERROR";
        }
    }
    
    // ACCEPT REQUEST

    public String acceptRequest(Request request)
    {
        try 
        {
            User user = findByMail(request.getTo());
            User friendUser = findByMail(request.getFrom());

            if(user != null && friendUser != null)
            {
                List<Friend> friends = user.getFriends();

                Friend frnd = new Friend();

                frnd.setMail(request.getFrom());
                frnd.setUsername(request.getUsername());
                frnd.setImage(request.getImage());

                friends.add(frnd);

                List<Request> requests = user.getRequests();

                boolean removed = requests.removeIf(req -> req.getFrom().equals(request.getFrom()));

                List<Friend> friendUserFriends = friendUser.getFriends();

                Friend friendUserFrnd = new Friend();

                friendUserFrnd.setMail(user.getMail());
                friendUserFrnd.setUsername(user.getUsername());
                friendUserFrnd.setImage(user.getImage());

                friendUserFriends.add(friendUserFrnd);

                List<Request> friendUserRequests = friendUser.getRequests();

                boolean removedFriendRequest = friendUserRequests.removeIf(req -> req.getFrom().equals(request.getTo()));

                if(removed || removedFriendRequest) 
                {
                    userRepo.save(user);
                    userRepo.save(friendUser);
                }

                return "SUCCESS";
            }

            return "NOT FOUND";
        } 
        catch (Exception e) 
        {
            return "ERROR";
        }
    }
    
    // DELETE FRIEND

    public String deleteFriend(String mail,Friend friend)
    {
        try {
            User user = findByMail(mail);
            User friendUser = findByMail(friend.getMail());

            if (user != null && friendUser != null) {
                List<Friend> friends = user.getFriends();

                boolean removed = friends.removeIf(frnd -> frnd.getMail().equals(friend.getMail()));

                List<Friend> friendUserFriends = friendUser.getFriends();

                boolean frndRemoved = friendUserFriends.removeIf(frnd -> frnd.getMail().equals(mail));

                String chatsRemoved = deleteChats(mail, friend.getMail());

                if(removed && frndRemoved) 
                {
                    if(chatsRemoved == "SUCCESS")
                    {
                        userRepo.save(user);
                        userRepo.save(friendUser);
                    }
                }

                return "SUCCESS";
            }

            return "NOT FOUND";
        } catch (Exception e) {
            return "ERROR";
        }
    }
    
    // DELETE CHATS

    public String deleteChats(String mail,String friend)
    {
        try 
        {
            List<Chat> allChats = chatRepo.findAll();

            List<Chat> chatsToRemove = allChats.stream().filter(existingChat -> existingChat.getParticipants().contains(mail) && existingChat.getParticipants().contains(friend)).collect(Collectors.toList());

            chatRepo.deleteAll(chatsToRemove);
            
            return "SUCCESS";
        } 
        catch (Exception e)
        {
            return "ERROR";
        }
    }

    // UPDATE
    
    public String update(Update details)
    {
        try {
            User user = findByMail(details.getMail());

            if (user != null) {
                boolean changedUsername = false;
                boolean changedProfile = false;

                if (!details.getUsername().isEmpty()) {
                    user.setUsername(details.getUsername());
                    changedUsername = true;
                }

                if (!details.getPassword().isEmpty()) {
                    user.setPassword(details.getPassword());
                }

                if (details.getImage() == null) {
                    user.setImage("EMPTY");
                    details.setImage("EMPTY");
                    changedProfile = true;
                } else {
                    user.setImage(details.getImage());
                    changedProfile = true;
                }

                userRepo.save(user);

                if (changedUsername) {
                    for (Friend friend : user.getFriends()) {
                        User friendUser = findByMail(friend.getMail());

                        if (friendUser != null) {
                            boolean friendUserUpdated = false;

                            for (Friend frnd : friendUser.getFriends()) {
                                if (frnd.getMail().equals(details.getMail())) {
                                    frnd.setUsername(details.getUsername());
                                    friendUserUpdated = true;
                                }
                            }

                            if (friendUserUpdated) {
                                userRepo.save(friendUser);
                            }
                        }
                    }

                    for (User existingUser : getAllUsers()) {
                        boolean requestUpdated = false;

                        for (Request existingUserRequest : existingUser.getRequests()) {
                            if (existingUserRequest.getFrom().equals(details.getMail())) {
                                existingUserRequest.setUsername(details.getUsername());
                                requestUpdated = true;
                            }
                        }

                        if (requestUpdated) {
                            userRepo.save(existingUser);
                        }
                    }
                }

                if (changedProfile) {
                    for (Friend friend : user.getFriends()) {
                        User friendUser = findByMail(friend.getMail());

                        if (friendUser != null) {
                            boolean friendUserUpdated = false;

                            for (Friend frnd : friendUser.getFriends()) {
                                if (frnd.getMail().equals(details.getMail())) {
                                    frnd.setImage(details.getImage());
                                    friendUserUpdated = true;
                                }
                            }

                            if (friendUserUpdated) {
                                userRepo.save(friendUser);
                            }
                        }
                    }

                    for (User existingUser : getAllUsers()) {
                        boolean requestUpdated = false;

                        for (Request existingUserRequest : existingUser.getRequests()) {
                            if (existingUserRequest.getFrom().equals(details.getMail())) {
                                existingUserRequest.setImage(details.getImage());
                                requestUpdated = true;
                            }
                        }

                        if (requestUpdated) {
                            userRepo.save(existingUser);
                        }
                    }
                }

                return "SUCCESS";
            }

            return "NOT FOUND";
        } catch (Exception e) {
            return "ERROR";
        }
    }
    
    // DELETE

    public String delete(String mail)
    {
        try 
        {
            User user = findByMail(mail);

            if (user != null)
            {
                for (Friend friend : user.getFriends())
                {
                    User friendUser = findByMail(friend.getMail());

                    List<Friend> friendUserFriends = friendUser.getFriends();

                    friendUserFriends.removeIf(frnd -> frnd.getMail().equals(mail));

                    userRepo.save(friendUser);
                }

                List<Chat> allChats = chatRepo.findAll();

                List<Chat> chatsToRemove = allChats.stream().filter(existingChat -> existingChat.getParticipants().contains(mail)).collect(Collectors.toList());

                chatRepo.deleteAll(chatsToRemove);

                userRepo.delete(user);

                return "SUCCESS";
            }
            
            return "NOT FOUND";
        } 
        catch (Exception e) 
        {
            return "ERROR";
        }
    }
}