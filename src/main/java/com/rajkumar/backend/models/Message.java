package com.rajkumar.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message 
{
    String sender;
    String receiver;
    String content;
    String timestamp;
    boolean read;
}