package com.rajkumar.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rajkumar.backend.models.Login;
import com.rajkumar.backend.models.Signup;
import com.rajkumar.backend.services.AuthenticationServices;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class AuthenticationController 
{
    @Autowired
    private AuthenticationServices authenticationService;

    // SIGNUP

    @PostMapping("/signup")
    public String userSignup(@RequestBody Signup details)
    {
        return authenticationService.userSignup(details);
    }

    // SIGNUP SUCCESSFUL

    @PostMapping("/signupSuccessful")
    public String signupSuccessful(@RequestBody Signup details)
    {
        return authenticationService.signupSuccessful(details.getMail());
    }

    // LOGIN

    @PostMapping("/login")
    public String userLogin(@RequestBody Login details)
    {
        return authenticationService.userLogin(details);
    }

    // AUTO LOGIN

    @PostMapping("/autoLogin")
    public String autoLogin(@RequestBody Login details)
    {
        return authenticationService.autoLogin(details);
    }

    // FORGET PASSWORD

    @PostMapping("/forgetPassword")
    public String forgetPassword(@RequestBody Login details)
    {
        return authenticationService.forgetPassword(details.getMail());
    }

    // CONFIRM OTP

    @PostMapping("/confirmOtp")
    public String confirmOtp(@RequestBody Login details)
    {
        return authenticationService.confirmOtp(details);
    }

    // CHANGE PASSWORD

    @PostMapping("/changePassword")
    public String changePassword(@RequestBody Login details)
    {
        return authenticationService.changePassword(details);
    }

    // LOGOUT

    @PostMapping("/logout")
    public String userLogout(@RequestBody Login details)
    {
        return authenticationService.userLogout(details);
    }
}