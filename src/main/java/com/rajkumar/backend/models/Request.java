package com.rajkumar.backend.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Request 
{
    String from;
    String to;
    String username;
    String image;
}