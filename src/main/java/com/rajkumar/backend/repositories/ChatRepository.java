package com.rajkumar.backend.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.rajkumar.backend.models.Chat;

public interface ChatRepository extends MongoRepository<Chat,String>{}