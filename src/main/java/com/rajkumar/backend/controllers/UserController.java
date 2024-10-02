package com.rajkumar.backend.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rajkumar.backend.models.Friend;
import com.rajkumar.backend.models.Message;
import com.rajkumar.backend.models.Request;
import com.rajkumar.backend.models.Update;
import com.rajkumar.backend.models.User;
import com.rajkumar.backend.services.UserServices;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController
{
    @Autowired
    private UserServices userService;

    // FIND BY MAIL

    @GetMapping("{mail}")
    public User findByMail(@PathVariable String mail)
    {
        return userService.findByMail(mail);
    }

    // GET FRIENDS

    @GetMapping("/friends/{mail}")
    public List<Friend> getFriends(@PathVariable String mail)
    {
        return userService.getFriends(mail);
    }

    // GET ALL USERS

    @GetMapping
    public List<User> getAllUsers()
    {
        return userService.getAllUsers();
    }

    // GET REQUESTS

    @GetMapping("/requests/{mail}")
    public List<Request> getRequests(@PathVariable String mail)
    {
        return userService.getRequests(mail);
    }

    // GET SENT

    @GetMapping("/sent/{mail}")
    public List<String> getSent(@PathVariable String mail)
    {
        return userService.getSent(mail);
    }

    // GET ALL CHATS

    @GetMapping("/chats/{mail}")
    public List<Message> getAllChats(@PathVariable String mail)
    {
        return userService.getAllChats(mail);
    }

    // SEND REQUEST

    @PostMapping("/request")
    public String sendRequest(@RequestBody Request request)
    {
        return userService.sendRequest(request);
    }

    // DELETE REQUEST

    @PostMapping("/deleteRequest")
    public String deleteRequest(@RequestBody Request request)
    {
        return userService.deleteRequest(request);
    }

    // ACCEPT REQUEST

    @PostMapping("/acceptRequest")
    public String acceptRequest(@RequestBody Request request)
    {
        return userService.acceptRequest(request);
    }

    // DELETE FRIEND

    @PostMapping("/deleteFriend/{mail}")
    public String deleteFriend(@PathVariable String mail,@RequestBody Friend friend)
    {
        return userService.deleteFriend(mail, friend);
    }
    
    // UPDATE

    @PostMapping("/update")
    public String update(@RequestBody Update details)
    {
        return userService.update(details);
    }

    // DELETE

    @PostMapping("/delete/{mail}")
    public String delete(@PathVariable String mail)
    {
        return userService.delete(mail);
    }
}