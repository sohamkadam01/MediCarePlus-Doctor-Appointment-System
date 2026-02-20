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
                .requestMatchers("/api/test/public").permitAll()
                .requestMatchers("/api/public/**").permitAll()

                // Doctor specific endpoints
                .requestMatchers("/api/doctors/details/**").permitAll()
                .requestMatchers("/api/specializations/**").permitAll()
                .requestMatchers("/api/doctors/pending").hasRole("DOCTOR")

                // Patient specific endpoints
                .requestMatchers("/api/patient-details/**").hasRole("PATIENT")

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
                .requestMatchers("/api/test/admin").hasRole("ADMIN")

                // Role-specific test endpoints
                .requestMatchers("/api/test/doctor").hasRole("DOCTOR")
                .requestMatchers("/api/test/patient").hasRole("PATIENT")

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
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
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
