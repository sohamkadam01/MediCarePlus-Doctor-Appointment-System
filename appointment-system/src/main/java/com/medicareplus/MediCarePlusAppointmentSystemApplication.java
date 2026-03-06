package com.medicareplus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
@SpringBootApplication(scanBasePackages = "com.medicareplus")


public class MediCarePlusAppointmentSystemApplication {
	public static void main(String[] args) {
	   SpringApplication.run(MediCarePlusAppointmentSystemApplication.class, args);
	}	
}
