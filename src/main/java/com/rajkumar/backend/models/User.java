package com.rajkumar.backend.models;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User 
{
    @Id
    String id;
    String mail;
    String username;
    String password;
    List<Friend> friends;
    List<Request> requests;
    String status;
    boolean loggedIn;
    boolean confirmed;
    Integer otp;
    String image;
}