package com.rajkumar.backend.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.rajkumar.backend.models.User;

public interface UserRepository extends MongoRepository<User,String>{}