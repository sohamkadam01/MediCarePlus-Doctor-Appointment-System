package com.medicareplus.Config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.medicareplus.Security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> {
                    log.warn("401 Unauthorized for {} {}: {}",
                            request.getMethod(),
                            request.getRequestURI(),
                            authException != null ? authException.getMessage() : "no auth exception");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Unauthorized access. Please login.\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"Access denied. Insufficient permissions.\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/auth/login/email").permitAll()
                .requestMatchers("/api/auth/login/phone").permitAll()
                .requestMatchers("/api/users/register/**").permitAll()
                
                // PATIENT VERIFICATION ENDPOINTS - PUBLIC
                .requestMatchers(HttpMethod.POST, "/api/users/verify-patient").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/users/check-patient").permitAll()
                
                // LAB APPOINTMENT BOOKING - PUBLIC (ADD THIS LINE)
                .requestMatchers(HttpMethod.POST, "/api/appointments/book-lab-appointment").permitAll()
                
                // OTP VERIFICATION ENDPOINTS - PUBLIC
                .requestMatchers("/api/users/verify-otp").permitAll()
                .requestMatchers("/api/users/resend-otp").permitAll()
                .requestMatchers("/api/users/verification-status").permitAll()
                
                .requestMatchers("/api/test/public").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/error/**").permitAll()
                .requestMatchers("/ws/**").permitAll()

                // Doctor specific endpoints - READ operations public, WRITE restricted
                .requestMatchers(HttpMethod.GET, "/api/doctors/details/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/doctors/search").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/doctors/details/**").hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/doctors/details/**").hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers("/api/specializations/**").permitAll()
                .requestMatchers("/api/doctors/pending").hasRole("DOCTOR")
                .requestMatchers("/api/doctors/availability/**").hasRole("DOCTOR")

                // Lab endpoints - public read, admin write
                .requestMatchers(HttpMethod.GET, "/api/labs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-tests/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/labs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/labs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/labs/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/lab-tests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/lab-tests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/lab-tests/**").hasRole("ADMIN")

                // Lab enrollment endpoints - Public read operations, admin write
                .requestMatchers(HttpMethod.POST, "/api/lab-enrollments").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments/search").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments/cities").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments/states").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments/labs/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments/search-by-test").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments/home-collection/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments/user/**").hasRole("LAB")
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/lab-enrollments/{id}").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/lab-enrollments/**").hasRole("ADMIN")
                .requestMatchers("/api/lab/**").hasRole("LAB")

                // Patient specific endpoints
                .requestMatchers("/api/patient-details/**").hasRole("PATIENT")

                // PATIENT VITALS - Allow both DOCTORS and PATIENTS
                .requestMatchers(HttpMethod.GET, "/api/patient-vitals/patient/**").hasAnyRole("PATIENT", "DOCTOR")
                .requestMatchers(HttpMethod.POST, "/api/patient-vitals").hasAnyRole("DOCTOR", "PATIENT")
                .requestMatchers(HttpMethod.PUT, "/api/patient-vitals/**").hasAnyRole("DOCTOR", "PATIENT")
                .requestMatchers(HttpMethod.DELETE, "/api/patient-vitals/**").hasAnyRole("DOCTOR", "ADMIN")

                // Chat and Messaging endpoints
                .requestMatchers("/api/chat/patient/**").hasRole("PATIENT")
                .requestMatchers("/api/chat/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/api/messages/doctor/**").hasRole("DOCTOR")
                .requestMatchers("/api/messages/patient/**").hasRole("PATIENT")

                // Authenticated endpoints
                .requestMatchers("/api/auth/logout").authenticated()
                .requestMatchers("/api/auth/logout-all").authenticated()
                .requestMatchers("/api/auth/validate").authenticated()
                .requestMatchers("/api/auth/info").authenticated()
                .requestMatchers("/api/test/secured").authenticated()

                // Admin only endpoints
                .requestMatchers("/api/auth/logout/user/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/logout/phone/**").hasRole("ADMIN")
                .requestMatchers("/api/auth/blacklist/size").hasRole("ADMIN")
                .requestMatchers("/api/users/admins/**").hasRole("ADMIN")
                .requestMatchers("/api/users/doctors/pending").hasRole("ADMIN")
                .requestMatchers("/api/users/doctors/pending/details").hasRole("ADMIN")
                .requestMatchers("/api/users/doctors/*/approve").hasRole("ADMIN")
                .requestMatchers("/api/users/doctors/*/reject").hasRole("ADMIN")
                .requestMatchers("/api/users/stats").hasRole("ADMIN")
                .requestMatchers("/api/users/analytics/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/test/admin").hasRole("ADMIN")

                // Role-specific test endpoints
                .requestMatchers("/api/test/doctor").hasRole("DOCTOR")
                .requestMatchers("/api/test/patient").hasRole("PATIENT")

                // Appointment endpoints
                .requestMatchers(HttpMethod.GET, "/api/appointments/available-dates").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/appointments/available-slots").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/appointments/doctors/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/appointments/book").hasRole("PATIENT")
                .requestMatchers("/api/appointments/**").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
            "http://localhost:*",
            "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Allow-Origin"
        ));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
