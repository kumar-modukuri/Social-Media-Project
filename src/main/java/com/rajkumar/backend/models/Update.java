package com.rajkumar.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Update 
{
    String mail;
    String username;
    String password;
    String image;
}