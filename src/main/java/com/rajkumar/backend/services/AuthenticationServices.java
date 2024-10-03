package com.rajkumar.backend.services;

import java.util.Collections;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.rajkumar.backend.models.Login;
import com.rajkumar.backend.models.Signup;
import com.rajkumar.backend.models.User;
import com.rajkumar.backend.repositories.UserRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class AuthenticationServices 
{
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private UserServices userService;

    @Autowired
    private JavaMailSender mailSender;

    // SIGNUP

    public String userSignup(Signup details)
    {
        try 
        {
            User user = userService.findByMail(details.getMail());

            if(user == null)
            {
                String response = sendConfirmationMail(details.getMail(),details.getUsername());

                if(response.equals("SUCCESS"))
                {
                    try 
                    {
                        User newUser = new User();

                        newUser.setMail(details.getMail());
                        newUser.setUsername(details.getUsername());
                        newUser.setPassword(details.getPassword());
                        newUser.setFriends(Collections.emptyList());
                        newUser.setRequests(Collections.emptyList());
                        newUser.setStatus("offline");
                        newUser.setLoggedIn(false);
                        newUser.setConfirmed(false);
                        newUser.setOtp(0);
                        newUser.setImage("EMPTY");

                        userRepo.save(newUser);

                        return "SUCCESS";
                    }
                    catch (Exception e) 
                    {
                        return "SAVE ERROR";
                    }
                }
                else
                {
                    return "MAIL ERROR";
                }
            }
            else
            {
                return "ALREADY EXISTS";
            }
        } 
        catch(Exception e) 
        {
            return "ERROR";
        }
    }

    // SEND CONFIRMATION MAIL

    public String sendConfirmationMail(String mail,String username)
    {
        MimeMessage message = mailSender.createMimeMessage();

        try 
        {
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("yourmailaddress");
            helper.setTo(mail);
            helper.setSubject("Confirmation Mail");
            String htmlContent = "<html><body>"
                            + "<h1>Welcome " + username + "</h1>"
                            + "<p>Thank you for signing up! Please click the link below to complete your registration.</p>"
                            + "<a href=\"http://localhost:3000/#signupSuccessful?mail=" + mail + "\" style=\""
                            + "display: inline-block; padding: 10px 20px; font-size: 16px; font-weight: bold; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;\">"
                            + "Confirm Sign Up</a>"
                            + "</body></html>";

            helper.setText(htmlContent, true);

            mailSender.send(message);

            return "SUCCESS";
        } 
        catch(Exception e) 
        {
            return "ERROR";
        }
    }

    // SIGNUP SUCCESSFUL

    public String signupSuccessful(String mail)
    {
        try 
        {
            User user = userService.findByMail(mail);

            if(user != null)
            {
                if(!user.isConfirmed())
                {
                    user.setConfirmed(true);

                    userRepo.save(user);
                }
                return "SUCCESS";
            }
            return "NOT FOUND";
        } 
        catch(Exception e) 
        {
            return "ERROR";
        }
    }

    // LOGIN

    public String userLogin(Login details)
    {
        try
        {
            User user = userService.findByMail(details.getMail());

            if(user != null)
            {
                if(user.isConfirmed())
                {
                    if(user.getMail().equals(details.getMail()) && user.getPassword().equals(details.getPassword()))
                    {
                        user.setLoggedIn(true);

                        userRepo.save(user);

                        return "SUCCESS";
                    }
                    else
                    {
                        return "INCORRECT";
                    }
                }
                else
                {
                    String response = sendConfirmationMail(user.getMail(),user.getUsername());

                    if(response.equals("SUCCESS"))
                    {
                        return "SENT";
                    }
                    else
                    {
                        return "MAIL ERROR";
                    }
                }
            }
            else
            {
                return "NOT FOUND";
            } 
        }
        catch(Exception e) 
        {
            return "ERROR";
        }
    }

    // AUTO LOGIN

    public String autoLogin(Login details)
    {
        try 
        {
            User user = userService.findByMail(details.getMail());

            if(user != null)
            {
                if(user.isLoggedIn())
                {
                    return "SUCCESS";
                }
                
                return "FAILED";
            }
            else
            {
                return "NOT FOUND";
            }
        } 
        catch(Exception e) 
        {
            return "ERROR";
        }
    }

    // FORGET PASSWORD

    public String forgetPassword(String mail)
    {
        try 
        {
            User user = userService.findByMail(mail);

            if(user != null)
            {
                return sendOtpMail(mail,user);
            }
            else
            {
                return "NOT FOUND";
            }
        } 
        catch(Exception e) 
        {
            return "ERROR";
        }
    }

    // SEND OTP MAIL

    public String sendOtpMail(String mail,User user)
    {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);

        user.setOtp(otp);

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom("socialmediaprojectbyraj@gmail.com");
        message.setTo(mail);
        message.setSubject("Forget Password OTP");
        message.setText("OTP for resetting password : " + otp);

        try 
        {
            userRepo.save(user);
            mailSender.send(message);
            return "SUCCESS";
        }
        catch(Exception e) 
        {
            return "OTP ERROR";
        }
    }

    // CONFIRM OTP

    public String confirmOtp(Login details)
    {
        try 
        {
            User user = userService.findByMail(details.getMail());

            if (user != null) 
            {
                if(user.getOtp().equals(Integer.parseInt(details.getPassword())))
                {
                    return "SUCCESS";
                }

                return "INCORRECT";
            }
            else 
            {
                return "NOT FOUND";
            }
        } 
        catch (Exception e) 
        {
            return "ERROR";
        }
    }

    // CHANGE PASSWORD

    public String changePassword(Login details)
    {
        try 
        {
            User user = userService.findByMail(details.getMail());

            if (user != null)
            {
                user.setPassword(details.getPassword());
                user.setOtp(0);

                userRepo.save(user);

                return "SUCCESS";
            }

            return "NOT FOUND";
        } 
        catch(Exception e) 
        {
            return "ERROR";
        }
    }

    // LOGOUT

    public String userLogout(Login details)
    {
        try 
        {
            User user = userService.findByMail(details.getMail());

            user.setLoggedIn(false);

            userRepo.save(user);

            return "SUCCESS";
        } 
        catch(Exception e) 
        {
            return "ERROR";
        }
    }
}