package com.medicareplus.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            System.out.println("=== ATTEMPTING TO SEND EMAIL ===");
            // System.out.println("From: " + fromEmail);
            // System.out.println("To: " + toEmail);
            // System.out.println("OTP: " + otp);
            // System.out.println("Host: smtp.gmail.com:587");
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("MedicarePlus - Email Verification OTP");
            message.setText(
                    "Your OTP for email verification is: " + otp +
                    "\n\nThis OTP is valid for 10 minutes.\n\n" +
                    "Regards,\nMedicarePlus Team"
            );

            mailSender.send(message);
            System.out.println("✅ OTP email sent successfully to: " + toEmail);

        } catch (Exception e) {
            System.err.println("❌ FAILED TO SEND EMAIL!");
            System.err.println("ERROR TYPE: " + e.getClass().getName());
            System.err.println("ERROR MESSAGE: " + e.getMessage());
            e.printStackTrace();  // ← THIS WILL SHOW THE REAL ERROR
            
            throw new RuntimeException("Unable to send OTP email: " + e.getMessage(), e);
        }
    }
}